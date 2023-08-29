import { Router } from "express";
import {
  getAllValidationPointsOfvalidationTag,
  listingValidationPoint,
  addValidationPoint,
  updatingValidationPoint,
} from "../controllers/ValidationPointController";
import { isAuthenticated } from "../permissions/permissions";

export const valdationPointRouter = Router();

// valdationPointRouter.use("/validationPoints", isAuthenticated);

valdationPointRouter.route("/validationPoints").get(listingValidationPoint);

valdationPointRouter
  .route("/validationPoints/:validationPointId")
  .patch(updatingValidationPoint);

valdationPointRouter
  .route("/validationPoints/validationtag/:validationTagId")
  .get(getAllValidationPointsOfvalidationTag);

valdationPointRouter
  .route(
    "/TestSuite/:testSuiteId/TestCase/:testCaseId/ValidationTag/:validationTagId/ValidationPoint"
  )
  .post(addValidationPoint);
