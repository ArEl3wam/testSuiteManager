import express from "express";
import {
  addTestSuite,
  getTestSuiteById,
  deleteTestSuiteById,
  getAllTestSuites,
  updateTestSuiteById,
} from "../controllers/TestSuiteController";
import { AuthorizeDatabaseCreation } from "./../controllers/databaseController";
import { isAuthenticated } from "../permissions/permissions";

export const TestSuiteRouter = express.Router();

// TestSuiteRouter.use("/TestSuites", isAuthenticated);

TestSuiteRouter.route("/TestSuites/:id")
  .get(getTestSuiteById)
  .patch(AuthorizeDatabaseCreation, updateTestSuiteById)
  .delete(deleteTestSuiteById);

TestSuiteRouter.route("/TestSuites")
  .get(getAllTestSuites)
  .post(AuthorizeDatabaseCreation, addTestSuite);
