import express from 'express'
import { AggregationFeatures } from '../services/searchAggregationService'
import { validationPointModel } from "../model/ValidationPoint";

export async function SearchingResources(req: express.Request, res: express.Response) {
    try {
        
        let aggregateFeatures = AggregationFeatures.getInstance(validationPointModel.aggregate())
        aggregateFeatures
            .lookUP("validationtags", "validationTag")
            .lookUP("testcases", "testCase")
            .match(req.query.vp)
            .match(req.query.vt, "validationTag")
            .match(req.query.tc, "testCase")
            .project()
            .project("validationTag")
            .project("testCase")
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