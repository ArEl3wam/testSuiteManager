import express from "express"; 
import { validationPointModel } from "../model/ValidationPoint";
import validationTagModel from "../model/ValidationTag";
import { testSuiteModel } from "../model/TestSuite";
import testCaseModel from "../model/TestCase";

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
            testSuite: await getstatistics(testSuiteModel),
            testCase: await getstatistics(testCaseModel),
            validationTag: await getstatistics(validationTagModel),
            validationPoint: await getstatistics(validationPointModel)
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