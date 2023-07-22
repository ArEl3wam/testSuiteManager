import { Router } from "express";
import { getUniqueFilters,searchByFilters } from "../controllers/SearchController";

export const SearchRouter = Router()

SearchRouter.get('/search', getUniqueFilters)
SearchRouter.post('/search', searchByFilters)