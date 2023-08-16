import express from 'express';
import { DbConnectionHandler } from "./../shared/DbConnectionsHandler"

let connection = DbConnectionHandler.getInstance().getLogsDbConnection();

function connectToAdmin() {
    connection = connection.useDb('admin');
    DbConnectionHandler.updateLogsDbConnection(connection);

}

export async function getDatabaseUrls(request: express.Request, response: express.Response) {

    const databases = await connection.db.admin().listDatabases();
    // skip admin, local, config databases
    const databasesNames = databases.databases
        .map((database: any) => database.name)
        .filter((databaseName: string) => !['admin', 'local', 'config', 'test']
        .includes(databaseName));
    
    return response.status(200).json({ databasesNames});
}

export async function openDatabaseConnection(request: express.Request, response: express.Response) {
    const request_db_name : String = request.body.databaseUrl.split('/')[3];
    try {
        connection = connection.useDb(request_db_name.toString())
        DbConnectionHandler.updateLogsDbConnection(connection);
        return response.status(200).json({
            status: 'success',
            message: `Database ${request_db_name} is opened successfully`
        });
    }
    catch (err: any) {
        return response.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
      
}
export async function deleteDatabase(request: express.Request, response: express.Response) {
    const db_name: String = request.body.databaseName;
    if (!db_name) {
        return response.status(400).json({
            status: 'fail',
            message: 'invalid database name or invalid request body'
        });
    }
    try {
        connection = connection.useDb(db_name.toString());
        connection.db.dropDatabase();
        connectToAdmin();
        return response.status(200).json({
            status: 'success',
            message: `Database ${db_name} is deleted successfully`
        });
    } catch (err: any) {
        return response.status(400).json({
            status: 'fail',
            message: err.message
        });

    }
}

export async function swapDatabaseConnection(request: express.Request, response: express.Response, next: express.NextFunction) {
    const db_name= request.query.databaseName;
    
    if (!db_name) {
        return next();
    }
    connection = connection.useDb(db_name.toString());
    DbConnectionHandler.updateLogsDbConnection(connection);
    return next();
}