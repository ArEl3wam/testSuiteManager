import express from 'express';

import { DbConnectionHandler } from "./../shared/DbConnectionsHandler"
import {getDBMetadataModel} from "./../model/DBMetadata"

export async function getDatabasesNames() {

    let connection = DbConnectionHandler.getInstance().getLogsDbConnection();
    const databases = await connection.db.admin().listDatabases();
    return databases.databases
        .map((database: any) => database.name)
        .filter((databaseName: string) => !['admin', 'local', 'config', 'test', 'users', 'DBMetadata']
        .includes(databaseName));
}

export async function checkDuplicateDatabaseName(request: express.Request): Promise<boolean> {
    // this function checks if the database name is already exists with different case
    // if it exists, it changes the database name in the request to the found name case
    const requestedDbName = request.query.databaseName;
    let found : boolean = false;
    (await getDatabasesNames()).map((dbName: string) => {
        if (dbName.toLowerCase() === requestedDbName?.toString().toLowerCase()) {
            request.query.databaseName = dbName;
            found =  true;
        }
    });
    return found;
}

export function addToDbMetadata(request: express.Request, response: express.Response) {
    const databaseName = request.query.databaseName;
    const solutionName = request.query.solution;
    const dbMetadataModel = getDBMetadataModel();
    dbMetadataModel.create({ DatabaseName: databaseName, SolutionName: solutionName });
    console.log(`Database ${databaseName} is added to DBMetadata`);
    
}