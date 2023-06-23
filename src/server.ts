import http from 'http'
import { createApp } from './app'




const app = createApp()
const server = http.createServer(app)
const port = process.env['PORT'] || 7651

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})