import express from 'express';
import { Types } from "mongoose";
import  {getValidationTagModel} from "../model/ValidationTag";
import {getTestCaseModel} from "../model/TestCase";
import { LinkingResourcesError, NotFoundError } from "../shared/errors";
import { _idToid, flattenObject } from "../shared/utils";
import { ValidationTagInsertion, ValidationTagUpdate, ValidationTagListingOptions } from "../interfaces/validationTagInterfaces";
import { addValidationTagToTestCase } from "./testCaseService";
import { AggregationWrapper } from './AggregationWrapper';
import {getTestSuiteModel} from "../model/TestSuite";

export async function insertValidationTagForTestCase(testSuiteId: string, testCaseId: string, validationTagInfo: ValidationTagInsertion, databaseName: any) {
    let validationTagId: Types.ObjectId | undefined = undefined;

    try {
        // Check if test case exists
        const testCase = await getTestCaseModel(databaseName).findById(testCaseId, { validationTagRefs: false, __v: false }).exec();
        if (!testCase) {
            throw new NotFoundError(`Test Case with id '${testCaseId}' was not found!`);
        }

        // Check if test suite exists
        const testSuite = await getTestSuiteModel(databaseName).findById(testSuiteId, { testCaseRefs: false, validationTagRefs: false, __v: false }).exec();
        if (!testSuite) {
            throw new NotFoundError(`Test Suite with id '${testSuiteId}' was not found!`);
        }

        // Check if testCaseId belongs to testSuiteId
        if (!testCase.parent.testSuite.id.equals(new Types.ObjectId(testSuiteId))) {
            throw new LinkingResourcesError(`Test Case with id '${testCaseId}' does not belong to Test Suite with id '${testSuiteId}'!`);
        }

        // Prepare validation tag and insert it to the DB
        validationTagInfo.parent = {
            testCase: {
                id: new Types.ObjectId(testCaseId)
            },
            testSuite: {
                id: new Types.ObjectId(testSuiteId)
            }
        };
        const validationTag = await getValidationTagModel(databaseName).create(validationTagInfo);

        // Remove __v and validationPointRefs from validationTag
        validationTag.__v = undefined;
        const { validationPointRefs, ...validationTagReturned } = validationTag.toJSON();

        //console.log(validationTagReturned);
        validationTagId = validationTagReturned._id;

        // Add validation tag id to test case in the database
        await addValidationTagToTestCase(testCaseId, { id: validationTagId }, databaseName);
        return _idToid(validationTagReturned)

    } catch (err: unknown) {
        console.log(err);
        if (validationTagId) {
            await getValidationTagModel(databaseName).findByIdAndDelete(validationTagId);
        }
        throw err;
    }
}

export async function insertValidationTagForTestSuite(testSuiteId: string, validationTagInfo: ValidationTagInsertion, databaseName: any) {
    let validationTagId: Types.ObjectId | undefined = undefined;

    try {
        // Check if test suite exists
        const testSuite = await getTestSuiteModel(databaseName).findById(testSuiteId, { testCaseRefs: false, validationTagRefs: false, __v: false }).exec();
        if (!testSuite) {
            throw new NotFoundError(`Test Suite with id '${testSuiteId}' was not found!`);
        }

        // Prepare validation tag and insert it to the DB
        validationTagInfo.parent = {
            testSuite: {
                id: new Types.ObjectId(testSuiteId)
            }
        };
        const validationTag = await getValidationTagModel(databaseName).create(validationTagInfo);

        // Remove __v and validationPointRefs from validationTag
        validationTag.__v = undefined;
        const { validationPointRefs, ...validationTagReturned } = validationTag.toJSON();

        //console.log(validationTagReturned);
        validationTagId = validationTagReturned._id;

        // Add validation tag id to test suite in the database
        await addValidationTagToTestSuite(testSuiteId, { id: validationTagId }, databaseName);
        return _idToid(validationTagReturned)

    } catch (err: unknown) {
        console.log(err);
        if (validationTagId) {
            await getValidationTagModel(databaseName).findByIdAndDelete(validationTagId);
        }
        throw err;
    }
}

export async function addValidationTagToTestSuite(testSuiteId: string, validationTag: { id?: Types.ObjectId, _id?: Types.ObjectId }, databaseName: any) {
    try {
        const t = await getTestSuiteModel(databaseName).findByIdAndUpdate(testSuiteId, {
            $push: {
                validationTagRefs: (validationTag.id) ? validationTag.id : validationTag._id
            }
        })

    } catch (err: unknown) {
        throw new LinkingResourcesError(`Couldn't link validation tag to test test suite with id '${testSuiteId}'`)
    }
}

export async function getValidationTag(validationTagId: string, databaseName: any) {
    const validationTag = await getValidationTagModel(databaseName)
        .findById(validationTagId, { __v: false })
        .populate('validationPointRefs', { __v: false, parent: false })
        .exec();

    if (!validationTag) {
        throw new NotFoundError(`Validation tag with id '${validationTagId}' was not found!`);
    }

    const validationPointsWith_id = validationTag.validationPointRefs;

    let validationTagObj: any = validationTag.toJSON();
    validationTagObj.validationPointRefs = undefined;

    // convert _id to id for each validation point
    const validationPoints = validationPointsWith_id.map(
        (validationPoint: any) => {
            let validationPointJson = validationPoint.toJSON();
            validationPointJson._id = undefined;
            return validationPointJson;
        }
    );

    return _idToid({ ...validationTagObj, validationPoints });
}


export async function getValidationTags(filters: ValidationTagListingOptions, databaseName: any) {

    try {
        // TODO: add validationPoint filtering
        const { skip, limit, testSuite, testCase, ...options } = filters;

        // Handle parent filtering
        let parent = {};

        if (testSuite && testSuite.id) Object.assign(parent, {
            testSuite: {
                id: testSuite.id
            }
        });

        if (testCase && testCase.id) Object.assign(parent, {
            testCase: {
                id: testCase.id
            }
        });

        if (testSuite && testSuite.id || testCase && testCase.id) {
            Object.assign(options, { parent: parent });
        }

        const dotNotationOptions = flattenObject(options);
        //console.log(dotNotationOptions)

        // Get all validation tags, with validationPointRefs substituted with their actual documents
        const query = getValidationTagModel(databaseName)
            .find(dotNotationOptions, { __v: false })
            .populate('validationPointRefs', { __v: false, parent: false });


        // Handle pagination
        if (skip) {
            query.sort({ _id: 1 }).skip(skip);
        }
        if (limit) {
            query.limit(limit);
        }

        const validationTags = await query.exec();
        if (!validationTags) {
            throw new NotFoundError(`Error listing all validation tags!`);
        }


        return validationTags.map((validationTag) => {
            // validationPointRefs are now populated and become the actual validation points
            const validationPointsWith_id = validationTag.validationPointRefs;

            // Remove validationPointRefs from the returned object
            let validationTagObj: any = validationTag.toJSON();
            validationTagObj.validationPointRefs = undefined;

            // convert _id to id for each validation point
            const validationPoints = validationPointsWith_id.map(
                (validationPoint: any) => {
                    let validationPointJson = validationPoint.toJSON();
                    validationPointJson._id = undefined;
                    return validationPointJson;
                }
            );

            return _idToid({ ...validationTagObj, validationPoints });
        });
    } catch (err: unknown) {
        throw err;
    }
}

export async function getValidationTagsForTestCase(filters: ValidationTagListingOptions, databaseName: any) {
    try {
        // TODO: add validationPoint filtering
        const { skip, limit, testSuite, testCase, ...options } = filters;

        // Handle parent filtering
        let parent = {};

        if (testSuite && testSuite.id) Object.assign(parent, {
            testSuite: {
                id: testSuite.id
            }
        });

        if (testCase && testCase.id) Object.assign(parent, {
            testCase: {
                id: testCase.id
            }
        });

        if (testSuite && testSuite.id || testCase && testCase.id) {
            Object.assign(options, { parent: parent });
        }

        const dotNotationOptions = flattenObject(options);

        Object.assign(dotNotationOptions, { 'parent.testCase': { $exists: true } });

        // console.log(dotNotationOptions)

        // Get all validation tags, with validationPointRefs substituted with their actual documents
        const query = getValidationTagModel(databaseName)
            .find(dotNotationOptions, { __v: false })
            .populate('validationPointRefs', { __v: false, parent: false });

        // Handle pagination
        if (skip) {
            query.sort({ _id: 1 }).skip(skip);
        }
        if (limit) {
            query.limit(limit);
        }

        const validationTags = await query.exec();
        if (!validationTags) {
            throw new NotFoundError(`Error listing all validation tags!`);
        }

        return validationTags.map((validationTag) => {
            // validationPointRefs are now populated and become the actual validation points
            const validationPointsWith_id = validationTag.validationPointRefs;

            // Remove validationPointRefs from the returned object
            let validationTagObj: any = validationTag.toJSON();
            validationTagObj.validationPointRefs = undefined;

            // convert _id to id for each validation point
            const validationPoints = validationPointsWith_id.map(
                (validationPoint: any) => {
                    let validationPointJson = validationPoint.toJSON();
                    validationPointJson._id = undefined;
                    return validationPointJson;
                }
            );

            return _idToid({ ...validationTagObj, validationPoints });
        });
    } catch (err: unknown) {
        throw err;
    }
}

export async function getValidationTagsForTestSuite(filters: ValidationTagListingOptions, databaseName: any) {
    try {
        if (filters.testCase) {
            throw new LinkingResourcesError(`Cannot filter by testCase when listing validation tags for test suite!`);
        }

        // TODO: add validationPoint filtering
        const { skip, limit, testSuite, ...options } = filters;

        //! needs to be refactored
        // Handle parent filtering
        let parent = {};

        if (testSuite && testSuite.id) Object.assign(parent, {
            testSuite: {
                id: testSuite.id
            }
        });

        if (testSuite && testSuite.id) {
            Object.assign(options, { parent: parent });
        }
        //! =================
        const dotNotationOptions = flattenObject(options);

        Object.assign(dotNotationOptions, { 'parent.testCase': { $exists: false } });

        //console.log(dotNotationOptions)

        // Get all validation tags, with validationPointRefs substituted with their actual documents
        const query = getValidationTagModel(databaseName)
            .find(dotNotationOptions, { __v: false })
            .populate('validationPointRefs', { __v: false, parent: false });

        // Handle pagination
        if (skip) {
            query.sort({ _id: 1 }).skip(skip);
        }
        if (limit) {
            query.limit(limit);
        }

        const validationTags = await query.exec();
        if (!validationTags) {
            throw new NotFoundError(`Error listing all validation tags!`);
        }

        return validationTags.map((validationTag) => {
            // validationPointRefs are now populated and become the actual validation points
            const validationPointsWith_id = validationTag.validationPointRefs;

            // Remove validationPointRefs from the returned object
            let validationTagObj: any = validationTag.toJSON();
            validationTagObj.validationPointRefs = undefined;

            // convert _id to id for each validation point
            const validationPoints = validationPointsWith_id.map(
                (validationPoint: any) => {
                    let validationPointJson = validationPoint.toJSON();
                    validationPointJson._id = undefined;
                    return validationPointJson;
                }
            );

            return _idToid({ ...validationTagObj, validationPoints });
        });
    } catch (err: unknown) {
        throw err;
    }
}

export async function updateValidationTag(validationTagId: string, reqBody: ValidationTagUpdate, databaseName: any) {
    try {
        const updatedValidationTag = await getValidationTagModel(databaseName).findByIdAndUpdate(validationTagId, flattenObject(reqBody), { new: true, select: '-__v' });
        if (!updatedValidationTag) {
            throw new NotFoundError(`Validation tag with id ${validationTagId} not found!`);
        }
        return _idToid(updatedValidationTag.toJSON());

    } catch (err: unknown) {
        throw err;
    }

}


export async function getAllValidationTagsOfTestCaseService(testCaseId: string, req: express.Request) {
    try {
        const databaseName= req.query.databaseName;

        let testCaseData = await getTestCaseModel(databaseName).findById(testCaseId);
        
        if (!testCaseData) {
            throw new NotFoundError(`Test case with id ${testCaseId} not found!`);
        }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        let validationTags = await AggregationWrapper.getInstance(getValidationTagModel(databaseName).aggregate())
            .match({ '_id': { $in: testCaseData.validationTagRefs } })
            .lookup("validationpoints", "validationPointRefs", "_id")
            .count_by_project("ValidationPoints", "validationPointRefs")
            .filter(req.query)
            .paginate(page, limit)
            .getAggregation().exec();
        return validationTags;
    }
    catch (err: any) {
        throw new NotFoundError((`Test case with id ${testCaseId} not found!`));
    }

}
