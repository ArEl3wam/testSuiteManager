import express from "express";
import {
  getAllTestcasesOfTestSuite,
  creatingTestCase,
  fetchingTestCaseById,
  listingTestCases,
  updatingTestCase,
} from "../controllers/TestCaseController";
import { isAuthenticated } from "../permissions/permissions";

export const testCaseRouter = express.Router();

// testCaseRouter.use("/testCases", isAuthenticated);

testCaseRouter.route("/testCases").get(listingTestCases);

testCaseRouter
  .route("/testCases/:testCaseId")
  .get(fetchingTestCaseById)
  .patch(updatingTestCase);

testCaseRouter
  .route("/testCases/testSuite/:testSuiteId")
  .get(getAllTestcasesOfTestSuite);

testCaseRouter
  .route("/testSuite/:testSuiteId/testCases")
  .post(creatingTestCase);
