import express from 'express'
import { listValidationPoints } from '../services/validationPointService'







export async function listingValidationPoint(req: express.Request, res: express.Response) {

    const listingOptions: any = req.query
    const vps = await listValidationPoints(listingOptions)
    res.status(200).send(vps)
}