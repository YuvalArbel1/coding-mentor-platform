/**
 * Main server entry point
 * @module server
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import our modules
import pool from './config/database.js';
import Logger from './utils/logger.js';
import { SOCKET_EVENTS } from './utils/constants.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date() });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: 'Database connected!',
            time: result.rows[0].now
        });
    } catch (error) {
        Logger.error('Database test failed', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT}`);
});