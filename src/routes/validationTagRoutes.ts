import express from "express";
import {
    createValidationTagForTestCase,
    createValidationTagForTestSuite,
    fetchValidationTagById,
    fetchValidationTags,
    fetchValidationTagsForTestCase,
    fetchValidationTagsForTestSuite,
    changeValidationTag,
    getAllValidationTagsOfTestCase
} from "../controllers/validationTagController";


export const validationTagRouter = express.Router()

validationTagRouter
    .route('/validationTags')
    .get(fetchValidationTags);

validationTagRouter
    .route('/validationTags/testCases')
    .get(fetchValidationTagsForTestCase);

validationTagRouter
    .route('/validationTags/testCases/:testCaseId')
    .get(getAllValidationTagsOfTestCase)

validationTagRouter
    .route('/validationTags/testSuites')
    .get(fetchValidationTagsForTestSuite);
        
validationTagRouter
    .route('/validationTags/:validationTagId')
    .get(fetchValidationTagById)
    .patch(changeValidationTag);


validationTagRouter
    .route('/validationTags/testSuites/:testSuiteId')
    .post(createValidationTagForTestSuite);


validationTagRouter    
    .route('/validationTags/testSuites/:testSuiteId/testCases/:testCaseId')
    .post(createValidationTagForTestCase);
    

