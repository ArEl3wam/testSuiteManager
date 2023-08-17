import express from 'express';

import { DbConnectionHandler } from "./../shared/DbConnectionsHandler"


export async function getDatabasesNames() {

    let connection = DbConnectionHandler.getInstance().getLogsDbConnection();
    const databases = await connection.db.admin().listDatabases();
    return databases.databases
        .map((database: any) => database.name)
        .filter((databaseName: string) => !['admin', 'local', 'config', 'test']
        .includes(databaseName));
}

export async function checkDuplicateDatabaseName(request: express.Request) {
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