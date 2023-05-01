import express from 'express'
import { listValidationPoints, parseValidationPointResults } from '../services/validationPointService'
const ValidationPoint = require('../model/ValidationPoint').ValidationPoint;


export async function listingValidationPoint(req: express.Request, res: express.Response) {

    const listingOptions: any = req.query
    const vps = await listValidationPoints(listingOptions)
    res.status(200).send(vps)
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
    vp.levelsOrder = levelOrder
    vp.levels = modifiedLevels
    vp.results=await parseValidationPointResults(req.body.results);
    if(!vp.results) {
        return res.status(400).json({ message: "Invalid results" });
    }
    
    await vp.save().then(() => {
        return res.status(201).json(vp);
    }).catch((err: any) => {    
        return res.status(400).json({ message: err.message });
    });
}