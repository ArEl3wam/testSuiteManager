const mongoose=require('mongoose');
import express from 'express';
import { mongo } from 'mongoose';


export async function getDatabaseUrls(request: express.Request, response: express.Response) {
    // check if there is a connection
    if (!mongoose.connection.readyState) {
        await mongoose.connect(`${process.env.DB_URL}${process.env.DB_PORT}/admin`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    const databases = await mongoose.connections[0].db.admin().listDatabases();
    // skip admin, local, config databases
    const databasesNames = databases.databases
        .map((database: any) => database.name)
        .filter((databaseName: string) => !['admin', 'local', 'config']
        .includes(databaseName));
    
    return response.status(200).json({ databasesNames});
}

export async function openDatabaseConnection(request: express.Request, response: express.Response) {
    const request_db_name : String = request.body.databaseUrl.split('/')[3];
    
    
    if (request_db_name == mongoose.connection.name) {
        return response.status(200).json({ message: `Database connection with ${request.body.databaseUrl} is already opened` });
    }
    try {
        await mongoose.disconnect()
        await mongoose.connect(request.body.databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log(`Database connection with ${request.body.databaseUrl} is opened successfully`);
        return response.status(200).json({ message: `Database connection with ${request.body.databaseUrl} is opened successfully` });
    }    
    catch (err: any) {
        await mongoose.disconnect()
        console.log(err.message);
        return response.status(400).json({ message: err.message });
    }   
}
export async function deleteDatabase(request: express.Request, response: express.Response) {
    const db_name: String = request.body.databaseName;
    const newDbUrl: string = `${process.env.DB_URL}${process.env.DB_PORT}/${db_name}`;
    
    if (!db_name) {
        return response.status(400).json({
            status: 'fail',
            message: 'invalid database name or invalid request body'
        });
    }
    
    try {
        await mongoose.disconnect();
        const connection = await mongoose.createConnection(newDbUrl);
        await connection.dropDatabase();
        return response.status(200).json({
            status: 'success',
            message: `Database ${db_name} is deleted successfully`
        });

    }    
    catch (err: any) {
        console.log(err.message);
        return response.status(400).json({
            status: 'fail',
            message: err.message
        });
    }

      
}

export async function swapDatabaseConnection(request: express.Request, response: express.Response, next: express.NextFunction) {
    const db_name= request.query.databaseName;
    
    // const db_name = request.cookies['databaseName'];
    
    if (request.url.split('/')[1] == 'database') {
        return next();
    }
    if (!db_name) {
        return next();
    }
    const newDbUrl: string = `${process.env.DB_URL}${process.env.DB_PORT}/${db_name}`;
    if (db_name != mongoose.connection.name) {
        
        try {
            
            await mongoose.disconnect()
            await mongoose.connect(newDbUrl, {
                serverSelectionTimeoutMS: 3000,
            });
            
        } catch (err: any) {
            console.log(err.message);
        }
    }
    
    
    return next();
}