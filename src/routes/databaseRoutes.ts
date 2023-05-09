import express from "express"; 
import { getDatabaseUrls, openDatabaseConnection , closeDatabaseConnection} from "../controllers/databaseController";

export const databaseRouter = express.Router()
databaseRouter.get('/database/urls', getDatabaseUrls)
databaseRouter.post('/database/urls', openDatabaseConnection)
databaseRouter.delete('/database/urls', closeDatabaseConnection)