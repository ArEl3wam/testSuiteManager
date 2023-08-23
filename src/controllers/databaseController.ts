import express from 'express';
import { DbConnectionHandler } from "./../shared/DbConnectionsHandler"
import {
    getDatabasesNames,
    checkDuplicateDatabaseName,
    addToDbMetadata,
} from "./../services/databaseService"
import {getDBMetadataModel} from "./../model/DBMetadata"

let connection = DbConnectionHandler.getInstance().getLogsDbConnection();

function connectToAdmin() {
    connection = connection.useDb('admin');
    DbConnectionHandler.updateLogsDbConnection(connection);

}

export async function getDatabaseUrls(request: express.Request | any, response: express.Response) {
    
    return response.status(200).json({ databasesNames: await getDatabasesNames()});
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

export async function AuthorizeDatabaseCreation(request: express.Request, response: express.Response, next: express.NextFunction) {
    // this function make sure that the requested database is created and added to DB metadata database
    
    if (!request.query.databaseName) {
        response.status(400).json({
            status: 'fail',
            message: 'invalid database name'
        });
    }
    if (!request.query.solution) {
        response.status(400).json({
            status: 'fail',
            message: 'invalid solution name'
        });
    }
    const new_db: boolean = !await checkDuplicateDatabaseName(request); 
    if (new_db){
        addToDbMetadata(request, response);
    }
    
    return next();
}

export async function getDatabasesBySolution(request: express.Request, response: express.Response) {
    const DBModel = getDBMetadataModel()
    try {
        const result = await DBModel.aggregate().group({
            _id: "$SolutionName",
            Databases: { $push: "$DatabaseName" }
        }).project({
            _id: 0,
            SolutionName: "$_id",
            Databases: 1
        }).exec()
        const formattedResult: any = {};
        result.forEach((solution) => {
            formattedResult[solution.SolutionName] = solution.Databases;
        });
        return response.status(200).json({
            status: "success",
            result: formattedResult
        })
    }
    catch (err: any) {
        return response.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
    
}