import { Router } from "express";
import { listingValidationPoint } from "../controllers/ValidationPointController";

export const valdationPointRouter = Router()


valdationPointRouter.get('/validationPoints', listingValidationPoint)