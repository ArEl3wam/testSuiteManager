import express from 'express'
import { AggregationFeatures } from '../services/AggregationService'
import { validationPointModel } from "../model/ValidationPoint";

export async function SearchingResources(req: express.Request, res: express.Response) {
    try {
        
        let aggregateFeatures = AggregationFeatures.getInstance(validationPointModel.aggregate())
        aggregateFeatures
            .search_lookup("validationtags", "validationTag")
            .search_lookup("testcases", "testCase")
            .search_match(req.query.vp)
            .search_match(req.query.vt, "validationTag")
            .search_match(req.query.tc, "testCase")
            .search_project()
            .search_project("validationTag")
            .search_project("testCase")
            // .group(req.query.select)
            .paginate(req.query.page,req.query.limit)
        const results = await aggregateFeatures.getAggregation().exec()

        res.status(200).json({ 
            status: 'success',
            results: results.length,
            data: {
                results
            }
         })
    } catch (err: unknown) {
        console.log(err)
        res.status(400).send('Bad Request, check your query parameters')
    }
}