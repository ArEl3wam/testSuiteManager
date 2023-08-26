import express from "express";
import {
  getDatabaseUrls,
  openDatabaseConnection,
  deleteDatabase,
  getDatabasesBySolution,
} from "../controllers/databaseController";
import { isAuthenticated } from "../permissions/permissions";

export const databaseRouter = express.Router();
databaseRouter.use("/database", isAuthenticated);

databaseRouter
  .route("/database/urls")
  .get(getDatabaseUrls)
  .post(openDatabaseConnection)
  .delete(deleteDatabase);

databaseRouter.route("/database/dummy_route").get(getDatabasesBySolution);
