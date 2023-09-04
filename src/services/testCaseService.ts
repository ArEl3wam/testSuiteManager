import express from 'express';
import { Types } from "mongoose";
import { TestCaseInsertion, TestCaseListingOptions, TestCaseUpdate } from "../interfaces/testCaseInterfaces";
import {getTestCaseModel} from "../model/TestCase";
import { LinkingResourcesError, NotFoundError } from "../shared/errors";
import { _idToid, flattenObject, removeAttributes } from "../shared/utils";
import { AggregationWrapper } from "./AggregationWrapper";
import {getTestSuiteModel} from "../model/TestSuite";


export async function getTestCaseById(testCaseId: string, databaseName: any) {

    try {
        const testCase = await getTestCaseModel(databaseName).findById(testCaseId, { validationTagRefs: false, __v: false }).exec()
        if(!testCase) {
            throw new NotFoundError(`Test Case with id '${testCaseId}' was not found!`)
        }
        return _idToid(testCase?.toJSON())
    } catch (err: unknown) {
        throw err
    }
}


export async function insertTestCase(testSuiteId: string, testCaseInfo: TestCaseInsertion, databaseName: any) {
    let testCaseId: Types.ObjectId | undefined = undefined;

    try {
        Object.assign(testCaseInfo, {
            parent: {
                testSuite: {
                    id: testSuiteId
                }
            }
        })
        const testCase = await getTestCaseModel(databaseName).create(testCaseInfo)
        testCaseId = testCase._id
        await addTestCaseToTestSuite(testSuiteId, testCase, databaseName)

        return _idToid(testCase.toJSON())
    } catch (err: unknown) {
        console.log(err)
        if(err instanceof LinkingResourcesError) {
            await getTestCaseModel(databaseName).findByIdAndDelete(testCaseId)
        }
        throw err
    }
}

export async function addTestCaseToTestSuite(testSuiteId: string, testCase: { id?: Types.ObjectId, _id?: Types.ObjectId }, databaseName: any ) {
    try {
        await getTestSuiteModel(databaseName).findByIdAndUpdate(testSuiteId, {
            $push: {
                testCaseRef: (testCase.id) ? testCase.id : testCase._id
            }
        }).orFail()
        
    } catch (err: unknown) {
        throw new LinkingResourcesError(`Couldn't link validation tag to test case with id '${testSuiteId}'`)
    }
}

export async function addValidationTagToTestCase(testCaseId: string, validationTag: { id?: Types.ObjectId, _id?: Types.ObjectId }, databaseName: any ) {
    try {
        await getTestCaseModel(databaseName).findByIdAndUpdate(testCaseId, {
            $push: {
                validationTagRefs: (validationTag.id) ? validationTag.id : validationTag._id
            }
        }).orFail()
    } catch (err: unknown) {
        throw new LinkingResourcesError(`Couldn't link validation tag to test case with id '${testCaseId}'`)
    }
}

// TODO: add filteration options
export async function listTestCases(listingOptions: TestCaseListingOptions, databaseName: any) {
    try {
        const { skip, limit, testSuite, ...filtering } = listingOptions
        const options = filtering
        if (testSuite &&  testSuite.id) Object.assign(options, {
            parent: {
                testSuite: {
                    id: new Types.ObjectId(testSuite.id)
                }
            }
        })

        const query = getTestCaseModel(databaseName).find(options, { __v: false })
        if(skip) {
            query.sort({ _id: 1 }) 
            query.skip(skip)
        }
        if(limit) query.limit(limit)
        const testCases = await query.exec()
        return testCases.map(testCase => removeAttributes(_idToid(testCase.toJSON()), ['validationTagRefs']))
    } catch (err: unknown) {
        console.log(err)
        throw err
    }
}


export async function updateTestCase(testCaseId: string, updateData: TestCaseUpdate, databaseName: any) {
    try {
        const testCase = await getTestCaseModel(databaseName).findByIdAndUpdate(testCaseId,updateData, { new: true,  fields: { __v: false }})
        if(!testCase) {
            throw new NotFoundError(`Test Case with id '${testCaseId}' was not found!`)
        }
        return _idToid(testCase.toJSON())
    } catch(err: unknown) {
        throw err
    }
}


export async function getAllTestcasesOfTestSuiteService(testSuiteId: string, req: express.Request) {
    try {
        const databaseName= req.query.databaseName;
        const testSuiteData: any = await getTestSuiteModel(databaseName).findById(testSuiteId, { '_v': 0 }).exec()
        const page = req.query.page ? parseInt(req.query.page as string) : 1
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 100
        let testcases = await AggregationWrapper.getInstance(getTestCaseModel(databaseName).aggregate())
            .match({ '_id': { $in: testSuiteData.testCaseRef } })
            .lookup("validationtags", "validationTagRefs", "_id")
            .count_by_group("ValidationTags", "validationTagRefs")
            .filter(req.query)
            .paginate(page, limit)
            .getAggregation().exec()
        return testcases
    }
    catch (err: any) {
        console.log(err);
        
        throw new Error(`TestSuite with id ${testSuiteId} not found`)
    }
}