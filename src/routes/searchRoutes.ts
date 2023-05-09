import { Router } from "express";
import { SearchingResources } from "../controllers/SearchController";

export const SearchRouter = Router()

SearchRouter.get('/search', SearchingResources)