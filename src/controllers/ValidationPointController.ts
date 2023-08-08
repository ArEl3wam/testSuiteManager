import express from 'express'
import {
    addValidationPointToValidationTag,
    parseValidationPointResults,
    updateParentsEndDate,
    updateValdationPoint,
    getAllValidationPointsOfvalidationTagService
} from '../services/validationPointService'
const ValidationPoint = require('../model/ValidationPoint').ValidationPoint;


export async function listingValidationPoint(req: express.Request, res: express.Response) {
    try {
        res.status(200).json({
            status: 'success',
        })
    } catch (err) {
        res.status(500).send('Something went wrong')
    }
}

export async function addValidationTag(req: express.Request, res: express.Response) {
    const { testSuiteId, testCaseId, validationTagId } = req.params;
    const vp = new ValidationPoint();
    vp.parent = {
        validationTag: { id: validationTagId },
        testCase: { id: testCaseId},
        testSuite: {id: testSuiteId}
    }
    const levels: any[]= req.body.levels

    const levelOrder = []
    const modifiedLevels = {}

    for (let i = 0; i < levels.length; ++i) {
        const [key, value] = Object.entries(levels[i])[0]
        levelOrder.push(key)
        Object.assign(modifiedLevels, {
            [i]: `${key}:${value}`
        })
    }
    vp.metaData= req.body.metaData;
    vp.levelsOrder = levelOrder
    vp.modifiedLevels = modifiedLevels
    vp.levels = levels.reduce((acc, cur) => {
        return Object.assign(acc, cur)
    }, {})
    vp.results= await parseValidationPointResults(req.body.results);
    vp.creation_date = req.body.creation_date
    if(!vp.results) {
        return res.status(400).json({ message: "Invalid validation point , this validaiton point has no results" });
    }
    
    await vp.save().then(async () => {
        await addValidationPointToValidationTag(validationTagId, { id: vp._id })
        await updateParentsEndDate(vp);
        return res.status(201).json(vp);
    }).catch((err: any) => {    
        return res.status(400).json({ message: err.message });
    });
}

export async function  updatingValidationPoint(req: express.Request, res: express.Response) {
    
    try {
        const { validationPointId } = req.params
        const valdationPoint = await updateValdationPoint(validationPointId, req.body, )
        res.status(200).send(valdationPoint)
    } catch (err: unknown) {
        res.status(500).send('Server error')
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
    
