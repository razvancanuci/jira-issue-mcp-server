import express from "express";


export const SERVER_DNS = process.env.SERVER_DOMAIN || 'http://localhost:3000';
const app = express()

app.use(express.json())

export {app}

