import http from 'http'
import { createApp } from './app'
import {DbConnectionHandler} from './shared/DbConnectionsHandler'
require('dotenv').config(
    {
        path: `${__dirname}/.env`
    }
)
DbConnectionHandler.initialize()
const app = createApp()
const server = http.createServer(app)
const port = process.env['BACKEND_PORT'] || 8080

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
