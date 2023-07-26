import express from "express"; 
import { getDatabaseUrls, openDatabaseConnection , deleteDatabase} from "../controllers/databaseController";

export const databaseRouter = express.Router()
databaseRouter
    .route('/database/urls')
    .get(getDatabaseUrls)
    .post(openDatabaseConnection)
    .delete(deleteDatabase)