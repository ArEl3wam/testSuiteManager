import express from 'express';

export function killServer(request: express.Request, response: express.Response) {
    console.log('killing server');
    
    response.send('Shutting down...');
    process.exit(0);
}