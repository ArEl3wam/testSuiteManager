import { Router } from "express";
import {
  getUniqueFilters,
  searchByFilters,
} from "../controllers/SearchController";
import { isAuthenticated } from "../permissions/permissions";

export const SearchRouter = Router();

SearchRouter.use("/search", isAuthenticated);

SearchRouter.get("/search", getUniqueFilters);
SearchRouter.post("/search", searchByFilters);
