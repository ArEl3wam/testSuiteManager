import { Router } from "express";
import { listingValidationPoint , addValidationTag, updatingValidationPoint} from "../controllers/ValidationPointController";

export const valdationPointRouter = Router()


valdationPointRouter.get('/validationPoints', listingValidationPoint);
valdationPointRouter.post('/TestSuite/:testSuiteId/TestCase/:testCaseId/ValidationTag/:validationTagId/ValidationPoint', addValidationTag);

valdationPointRouter.patch('/validationPoints/:validationPointId', updatingValidationPoint)