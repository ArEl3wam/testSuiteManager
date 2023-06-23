import express from "express"; 
import {killServer} from "../controllers/shutdownController"

export const shutdownRouter = express.Router()

shutdownRouter.post('/shutdown', killServer)
