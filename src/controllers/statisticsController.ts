import express from "express"; 
import { getValidationPointModel } from "../model/ValidationPoint";
import {getValidationTagModel} from "../model/ValidationTag";
import { getTestSuiteModel } from "../model/TestSuite";
import {getTestCaseModel} from "../model/TestCase";

async function getstatistics(databaseModel: any) {
    return {
        total: await databaseModel.countDocuments(),
        passed: await databaseModel.countDocuments({ status: true }),
        failed: await databaseModel.countDocuments({ status: false })
    }
 } 

export async function getStatistics(req: express.Request, res: express.Response) {
    try {
        const data = {
            testSuite: await getstatistics(getTestSuiteModel()),
            testCase: await getstatistics(getTestCaseModel()),
            validationTag: await getstatistics(getValidationTagModel()),
            validationPoint: await getstatistics(getValidationPointModel())
        }
        
        res.status(200).json({
            status: 'success',
            data
        })
    }
    catch (err: any) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}