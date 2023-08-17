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
        const databaseName= req.query.databaseName;
        const data = {
            testSuite: await getstatistics(getTestSuiteModel(databaseName)),
            testCase: await getstatistics(getTestCaseModel(databaseName)),
            validationTag: await getstatistics(getValidationTagModel(databaseName)),
            validationPoint: await getstatistics(getValidationPointModel(databaseName))
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