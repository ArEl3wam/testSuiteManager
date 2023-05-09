
import express from 'express'
import { searchResources } from '../services/SearchService'
import { SearchOptions } from '../interfaces/SearchInterface'

export async function SearchingResources(req: express.Request, res: express.Response) {
    try {
        // Validation is necessary later in the project

        const { select, ...others} = (req.query as any)

        const results = await searchResources({
            select,
            filteration: others || {}
        })
        res.status(200).send({ data: results })
    } catch (err: unknown) {
        console.log(err)
        res.status(500).send('Something went wrong')
    }
}