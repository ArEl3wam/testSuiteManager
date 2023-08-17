import express from 'express'
import {
    addValidationPointToValidationTag,
    parseValidationPointResults,
    updateParentsEndDate,
    updateValdationPoint,
    getAllValidationPointsOfvalidationTagService
} from '../services/validationPointService'
import { AggregationWrapper } from '../services/AggregationWrapper'
import { getValidationPointModel, ValidationPointBase } from '../model/ValidationPoint'
import mongoose, { Types } from 'mongoose';


export async function listingValidationPoint(req: express.Request, res: express.Response) {
    try {
        const databaseName= req.query.databaseName;
        const validationPoints = await AggregationWrapper.getInstance(getValidationPointModel(databaseName).aggregate())
            .match({})
            .filter(req.query)
            .paginate(req.query.page, req.query.limit)
            .getAggregation()
            .exec()
        
        res.status(200).json({
            status: 'success',
            resultsLength: validationPoints.length,
            validationPoints
        })
    } catch (err) {
        res.status(500).send('Something went wrong')
    }
}

export async function addValidationPoint(req: express.Request, res: express.Response) {
    const databaseName= req.query.databaseName;
    const { testSuiteId, testCaseId, validationTagId } = req.params;
    const ValidationPoint: mongoose.Model<ValidationPointBase>  = getValidationPointModel(databaseName);
    const vp = new ValidationPoint();

    vp.parent = {
        validationTag: { id: new Types.ObjectId(validationTagId) },
        testCase: { id: new Types.ObjectId(testCaseId) },
        testSuite: { id: new Types.ObjectId(testSuiteId) }
    }
    const levels: any[]= req.body.levels

    const levelOrder = []
    const modifiedLevels = {}
    if (levels) {
        for (let i = 0; i < levels.length; ++i) {
            const [key, value] = Object.entries(levels[i])[0]
            levelOrder.push(key)
            Object.assign(modifiedLevels, {
                [i]: `${key}:${value}`
            })
        }
    }
    vp.metaData= req.body.metaData;
    vp.levelsOrder = levelOrder
    vp.modifiedLevels = modifiedLevels
    vp.levels = levels?levels.reduce((acc, cur) => {
        return Object.assign(acc, cur)
    }, {}):{}
    vp.results= req.body.results;    
    vp.creation_date = req.body.creation_date
    if(!vp.results) {
        return res.status(400).json({ message: "Invalid validation point , this validaiton point has no results" });
    }
    
    await vp.save().then(async () => {
        await addValidationPointToValidationTag(validationTagId, { id: vp._id }, databaseName)
        await updateParentsEndDate(vp, databaseName);
        return res.status(201).json(vp);
    }).catch((err: any) => {    
        return res.status(400).json({ message: err.message });
    });
}

export async function  updatingValidationPoint(req: express.Request, res: express.Response) {
    const databaseName= req.query.databaseName;
    try {
        const { validationPointId } = req.params
        const valdationPoint = await updateValdationPoint(validationPointId, req.body, databaseName)
        res.status(200).send(valdationPoint)
    } catch (err: any) {
        res.status(500).send({
            message: err.message
        })
    }
}

export async function getAllValidationPointsOfvalidationTag(req: express.Request, res: express.Response) {
    try {
        const results = await getAllValidationPointsOfvalidationTagService(req.params.validationTagId, req);
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
    
