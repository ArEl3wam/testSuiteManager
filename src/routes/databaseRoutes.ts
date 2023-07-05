import express from "express"; 
import { getDatabaseUrls, openDatabaseConnection , closeDatabaseConnection} from "../controllers/databaseController";

export const databaseRouter = express.Router()
databaseRouter
    .route('/database/urls')
    .get(getDatabaseUrls)
    .post(openDatabaseConnection)
    .delete(closeDatabaseConnection)