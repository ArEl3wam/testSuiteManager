import express from "express"; 
import { getStatistics } from "../controllers/statisticsController";

export const statisticsRouter = express.Router()

statisticsRouter
    .route('/statistics')
    .get(getStatistics)