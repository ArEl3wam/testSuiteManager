import { Types } from "mongoose";
import { TestCaseInsertion, TestCaseListingOptions, TestCaseUpdate } from "../interfaces/testCaseInterfaces";
import testCaseModel from "../model/TestCase";
import { LinkingResourcesError, NotFoundError } from "../shared/errors";
import { _idToid } from "../shared/utils";
const testSuiteModel = require('../model/TestSuite').testSuiteModel;


export async function getTestCaseById(testCaseId: string) {

    try {
        const testCase = await testCaseModel.findById(testCaseId, { validationTagRefs: false, __v: false }).exec()
        if(!testCase) {
            throw new NotFoundError(`Test Case with id '${testCaseId}' was not found!`)
        }
        return _idToid(testCase?.toJSON())
    } catch (err: unknown) {
        throw err
    }
}


export async function insertTestCase(testSuiteId: string, testCaseInfo: TestCaseInsertion) {
    let testCaseId: Types.ObjectId | undefined = undefined;

    try {
        Object.assign(testCaseInfo, {
            parent: {
                testSuite: {
                    id: testSuiteId
                }
            }
        })
        const testCase = await testCaseModel.create(testCaseInfo)
        testCaseId = testCase._id
        await addTestCaseToTestSuite(testSuiteId, testCase)

        return _idToid(testCase.toJSON())
    } catch (err: unknown) {
        console.log(err)
        if(err instanceof LinkingResourcesError) {
            await testCaseModel.findByIdAndDelete(testCaseId)
        }
        throw err
    }
}

export async function addTestCaseToTestSuite(testSuiteId: string, testCase: { id?: Types.ObjectId, _id?: Types.ObjectId } ) {
    try {
        await testSuiteModel.findByIdAndUpdate(testSuiteId, {
            $push: {
                testCaseRef: (testCase.id) ? testCase.id : testCase._id
            }
        }).orFail()
        
    } catch (err: unknown) {
        throw new LinkingResourcesError(`Couldn't link validation tag to test case with id '${testSuiteId}'`)
    }
}

export async function addValidationTagToTestCase(testCaseId: string, validationTag: { id?: Types.ObjectId, _id?: Types.ObjectId } ) {
    try {
        await testCaseModel.findByIdAndUpdate(testCaseId, {
            $push: {
                validationTagRefs: (validationTag.id) ? validationTag.id : validationTag._id
            }
        }).orFail()
    } catch (err: unknown) {
        throw new LinkingResourcesError(`Couldn't link validation tag to test case with id '${testCaseId}'`)
    }
}

// TODO: add filteration options
export async function listTestCases(listingOptions: TestCaseListingOptions) {
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

        const query = testCaseModel.find(options, { validationTagRefs: false, __v: false })
        if(skip) {
            query.sort({ _id: 1 }) 
            query.skip(skip)
        }
        if(limit) query.limit(limit)
        const testCases = await query.exec()
        return testCases.map(testCase =>_idToid(testCase.toJSON()))
    } catch (err: unknown) {
        throw err
    }
}


export async function updateTestCase(testCaseId: string, updateData: TestCaseUpdate) {
    try {
        const testCase = await testCaseModel.findByIdAndUpdate(testCaseId, updateData, { new: true,  fields: { __v: false, validationTagRefs: false }})
        if(!testCase) {
            throw new NotFoundError(`Test Case with id '${testCaseId}' was not found!`)
        }
        return _idToid(testCase.toJSON())
    } catch(err: unknown) {
        throw err
    }
}