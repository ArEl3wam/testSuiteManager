import express from 'express'
import {
    filtersBuilder,
    testSuiteAggregationBuilder,
    testCaseAggregationBuilder,
    validationTagAggregationBuilder,
    validationPointAggregationBuilder,
} from "../services/EnhancedSearchService"


const builderMap: any = {
    testSuite: testSuiteAggregationBuilder,
    testCase: testCaseAggregationBuilder,
    validationTag: validationTagAggregationBuilder,
    validationPoint: validationPointAggregationBuilder
}

export async function getUniqueFilters(req: express.Request, res: express.Response) {
    try {

        const data = await filtersBuilder();
        res.status(200).json({ 
            status: 'success',
            data
         })
    } catch (err: any) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}

export async function searchByFilters(req: express.Request, res: express.Response) {
    try {
         
        const results = await builderMap[req.body.select](req);
        res.status(200).json({
            status: 'success',
            resultsLength: results.length,
            results
        })
    }
    catch (err: any) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
        
    }

}