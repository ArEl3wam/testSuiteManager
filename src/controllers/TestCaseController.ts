
import express from 'express'
import { getAllTestcasesOfTestSuiteService, getTestCaseById, insertTestCase, listTestCases, updateTestCase } from '../services/testCaseService'
import { TestCaseInsertion, TestCaseListingOptions } from '../interfaces/testCaseInterfaces'
import { NotFoundError } from '../shared/errors'

export async function fetchingTestCaseById(req: express.Request, res: express.Response, next: express.NextFunction) {
    const id = req.params.testCaseId

    try {
        const testCase = await getTestCaseById(id)
        res.status(200).send(testCase)
    } catch (err: unknown) {
        console.log(err)
        if(err instanceof NotFoundError) {
            res.status(err.status).send({ msg: err.message })
        } else {
            res.status(500).send()
        }
    }    
}

export async function creatingTestCase(req: express.Request, res: express.Response) {
    const testSuiteId = req.params.testSuiteId    
    // TODO: add validation
    const testCaseInfo: TestCaseInsertion = req.body
    try {
        const testCase = await insertTestCase(testSuiteId, testCaseInfo)
        res.status(201).send(testCase)
    } catch (err: unknown) {
        res.status(400).send({ error: 'Error while creating test case.' })
    }
}

export async function listingTestCases(req: express.Request, res: express.Response) {

    // TODO: Options Validation is Required at somepoint
    const listingOptions: TestCaseListingOptions = req.query
    try {   
        const testCases = await listTestCases(listingOptions)
        res.status(200).send(testCases)
    } catch (err: unknown) {
        res.status(500).send({ error: 'Server Error' })
    }
}


export async function updatingTestCase(req: express.Request, res: express.Response) {

    const { testCaseId } = req.params
    const updateData = req.body
    try {
        const testCase = await updateTestCase(testCaseId, updateData)
        res.status(200).send(testCase)
    } catch (err: unknown) {
        if(err instanceof NotFoundError) {
            res.status(err.status).send({ msg: err.message })
        } else {
            res.status(500).send()
        }
    }
}

export async function getAllTestcasesOfTestSuite(req: express.Request, res: express.Response) {
    try {
        
        const results = await getAllTestcasesOfTestSuiteService(req.params.testSuiteId)
        res.status(200).json({
            status: 'success',
            resultsLength: results.length,
            results
        })
    }
    catch (err:any) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}
    