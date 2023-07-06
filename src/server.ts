import http from 'http'
import { createApp } from './app'
import mongoose from 'mongoose'
require('dotenv').config(
    {
        path: `${__dirname}/.env`
    }
)
const DB_PORT: string = process.env['DB_PORT'] || '27017';
const DB_URL: string = `mongodb://localhost:${DB_PORT}/`;
(async () => {
    try {
        await mongoose.connect(`${DB_URL}`, {
            serverSelectionTimeoutMS: 3000,
        });
        console.log(`connected to ${DB_URL}`);
        
    } catch (err: any) {
        console.log(err.message);
    }
})();


const app = createApp()
const server = http.createServer(app)
const port = process.env['PORT']

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})