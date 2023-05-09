import express from 'express';
import { readDatabaseUrls } from '../services/databaseService';
import {buildDatabase, closeDatabase} from '../DataBaseConnection';


export async function getDatabaseUrls(request: express.Request, response: express.Response) {
    const databaseURLs=await readDatabaseUrls();
    return response.status(200).json({ databaseURLs});
}

export async function openDatabaseConnection(request: express.Request, response: express.Response) {
    try{
        buildDatabase(request.body.databaseUrl);
    }    
    catch (err: any) {
        return response.status(400).json({ message: err.message });
    }   
    return response.status(200).json({ message: "Database connection is succeeded " });
}
export async function closeDatabaseConnection(request: express.Request, response: express.Response) {
    try{
        closeDatabase();
    }    
    catch (err: any) {
        return response.status(400).json({ message: err.message });
    }   
    return response.status(200).json({ message: "Database connection is closed " });
}