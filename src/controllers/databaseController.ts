const mongoose=require('mongoose');
import express from 'express';
import { mongo } from 'mongoose';


export async function getDatabaseUrls(request: express.Request, response: express.Response) {
    const databases = await mongoose.connections[0].db.admin().listDatabases();
    // skip admin, local, config databases
    const databasesNames = databases.databases
        .map((database: any) => database.name)
        .filter((databaseName: string) => !['admin', 'local', 'config']
        .includes(databaseName));
    
    return response.status(200).json({ databasesNames});
}

export async function openDatabaseConnection(request: express.Request, response: express.Response) {
    try{
        const connection = await mongoose.connect(request.body.databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log(`Database connection with ${request.body.databaseUrl} is opened successfully`);
        return response.status(200).json({ message: `Database connection with ${request.body.databaseUrl} is opened successfully` });
    }    
    catch (err: any) {
        await mongoose.disconnect()
        console.log(err.message);
        return response.status(400).json({ message: err.message });
    }   
}
export async function closeDatabaseConnection(request: express.Request, response: express.Response) {
    try{
        await mongoose.disconnect()
        console.log("Database connection is closed successfully");
        
        return response.status(200).json({ message: "Database connection is closed successfully" });
    }    
    catch (err: any) {
        return response.status(400).json({ message: err.message });
    }   
}

export async function swapDatabaseConnection(request: express.Request, response: express.Response, next: express.NextFunction) {
    if (request.url.split('/')[1] == 'database') {
        return next();
    }
    if (!request.body.databaseName) {
        return next();
    }
    const newDbUrl: string = `${process.env.DB_URL}${process.env.DB_PORT}/${request.body.databaseName}`;
    if (request.body.databaseName != mongoose.connection.name) {
        
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