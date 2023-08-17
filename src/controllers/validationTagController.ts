import express from 'express';
import {
    insertValidationTagForTestCase,
    insertValidationTagForTestSuite,
    getValidationTag,
    getValidationTags,
    getValidationTagsForTestCase,
    getValidationTagsForTestSuite,
    updateValidationTag,
    getAllValidationTagsOfTestCaseService
} from '../services/validationTagService'
import { ValidationTagInsertion, ValidationTagListingOptions, ValidationTagUpdate } from '../interfaces/validationTagInterfaces'
import { LinkingResourcesError, NotFoundError } from '../shared/errors'


export async function createValidationTagForTestCase(req: express.Request, res: express.Response) {

    const databaseName= req.query.databaseName;
    const testSuiteId = req.params.testSuiteId;
    const testCaseId = req.params.testCaseId;

    const validationTagInfo: ValidationTagInsertion = req.body;

    try {
        const validationTag = await insertValidationTagForTestCase(testSuiteId, testCaseId, validationTagInfo, databaseName);
        res.status(201).send(validationTag);
    } catch (err: unknown) {
        if (err instanceof NotFoundError || err instanceof LinkingResourcesError)
            res.status(err.status).send({ message: err.message });
        else
            res.status(500).send({ message: 'Server Error' });
    }
}

export async function createValidationTagForTestSuite(req: express.Request, res: express.Response) {
    const databaseName= req.query.databaseName;
    const testSuiteId = req.params.testSuiteId;

    const validationTagInfo: ValidationTagInsertion = req.body;

    try {
        const validationTag = await insertValidationTagForTestSuite(testSuiteId, validationTagInfo, databaseName);
        res.status(201).send(validationTag);
    } catch (err: unknown) {
        if (err instanceof NotFoundError || err instanceof LinkingResourcesError)
            res.status(err.status).send({ message: err.message });
        else
            res.status(500).send({ message: 'Server Error' });
    }
}

export async function fetchValidationTagById(req: express.Request, res: express.Response) {
    const databaseName= req.query.databaseName;
    const validationTagId = req.params.validationTagId;

    try {
        const validationTag = await getValidationTag(validationTagId, databaseName);
        res.status(200).send(validationTag);
    } catch (err: unknown) {
        if (err instanceof NotFoundError || err instanceof LinkingResourcesError) {
            res.status(err.status).send({ message: err.message });
        } else {
            res.status(500).send({ message: 'Server Error' });
        }
    }

}

export async function fetchValidationTags(req: express.Request, res: express.Response) {
    const databaseName= req.query.databaseName;
    const filters: ValidationTagListingOptions = req.query;
    try {
        const validationTags = await getValidationTags(filters, databaseName);
        res.status(200).send(validationTags);
    } catch (err: unknown) {
        if (err instanceof NotFoundError || err instanceof LinkingResourcesError) {
            res.status(err.status).send({ message: err.message });
        } else {
            res.status(500).send({ message: 'Server Error' });
        }
    }

}

export async function fetchValidationTagsForTestCase(req: express.Request, res: express.Response) {
    const databaseName= req.query.databaseName;

    const filters: ValidationTagListingOptions = req.query;
    
    try {
        const validationTags = await getValidationTagsForTestCase(filters, databaseName);
        res.status(200).send(validationTags);
    } catch (err: unknown) {
        if (err instanceof NotFoundError || err instanceof LinkingResourcesError) {
            res.status(err.status).send({ message: err.message });
        } else {
            res.status(500).send({ message: 'Server Error' });
        }
    }

}

export async function fetchValidationTagsForTestSuite(req: express.Request, res: express.Response) {
    const databaseName= req.query.databaseName;

    const filters: ValidationTagListingOptions = req.query;
    try {
        const validationTags = await getValidationTagsForTestSuite(filters, databaseName);
        res.status(200).send(validationTags);
    } catch (err: any) {
        if (err instanceof NotFoundError || err instanceof LinkingResourcesError) {
            res.status(err.status).send({ message: err.message });
        } else {
            res.status(500).send({ message: err.message});
        }
    }
}

export async function changeValidationTag(req: express.Request, res: express.Response) {
    const databaseName= req.query.databaseName;
    const validationTagId = req.params.validationTagId;
    const validationTagInfo: ValidationTagUpdate = req.body;

    try {
        const updatedValidationTag = await updateValidationTag(validationTagId, validationTagInfo, databaseName);
        res.status(200).send(updatedValidationTag);
    } catch (err: any) {
        if (err instanceof NotFoundError || err instanceof LinkingResourcesError) {
            res.status(err.status).send({ message: err.message });
        } else {
            res.status(500).send({ message: err.message });
        }
    }
}

export async function getAllValidationTagsOfTestCase(req: express.Request, res: express.Response) {

    try {
        const testCaseId = req.params.testCaseId;
        let results = await getAllValidationTagsOfTestCaseService(testCaseId, req);
        
        res.status(200).json({
            status: 'success',
            resultsLength: results.length,
            results
        })
        
     } catch (err: any) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        })
     }
}