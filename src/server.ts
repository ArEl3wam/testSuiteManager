import http from 'http'
import { createApp } from './app'
import mongoose, { Mongoose } from 'mongoose'

// TODO : read this from dot env file 
mongoose.connect('mongodb://localhost:27017/tr', {
    serverSelectionTimeoutMS: 3000,
}).then((mongoose: Mongoose) => {
    console.log('Connected to database')
}).catch((err: unknown) => {
    console.log(err)
})
const app = createApp()
const server = http.createServer(app)
const port = process.env['PORT'] || 8080

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})