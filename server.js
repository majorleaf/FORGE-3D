import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import { client } from '@gradio/client';

import authRoutes from './routes/authRoutes.js';
import supabase from './config/supabaseClient.js';


dotenv.config();

const app = express();


// COmmunication between backend and frontend 
app.use(cors());


// To parse json from frontend
app.use( express.json());


//APIs
app.get('/', (req, res) =>  {
    res.json({ message: "FORGE3D BACKEND"})
});
app.get("/health", (req, res) =>  {
    res.json({ status: "ok", service: "FORGED3D BACKEND"})
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{ 
     console.log(`server running on PORT ${PORT}`)
    console.log(`Health:  http://localhost:${PORT}/health`);  
});