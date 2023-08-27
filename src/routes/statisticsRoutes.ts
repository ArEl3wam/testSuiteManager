import express from "express";
import { getStatistics } from "../controllers/statisticsController";
import { isAuthenticated } from "../permissions/permissions";

export const statisticsRouter = express.Router();

statisticsRouter.use("/statistics", isAuthenticated);
statisticsRouter.route("/statistics").get(getStatistics);
