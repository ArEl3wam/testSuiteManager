import express from 'express';
import { addTestSuite, getTestSuiteById,deleteTestSuiteById, getAllTestSuites,updateTestSuiteById } from '../controllers/TestSuiteController';
export const TestSuiteRouter = express.Router();

TestSuiteRouter
    .route("/TestSuites/:id")
    .get(getTestSuiteById)
    .patch(updateTestSuiteById)
    .delete(deleteTestSuiteById);

TestSuiteRouter
    .route("/TestSuites")
    .get(getAllTestSuites)
    .post(addTestSuite);


