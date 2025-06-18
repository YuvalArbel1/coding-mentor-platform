/**
 * Main server entry point
 * @module server
 */

import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';

import './config/database.js';
import Logger from './utils/logger.js';

import codeBlockRoutes from './routes/codeBlockRoutes.js';

import setupSocketHandlers from './controllers/socketController.js';

dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.urlencoded({extended: true}));

// API Routes
app.use('/api/blocks', codeBlockRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Coding Mentor Platform API',
        version: '1.0.0',
        timestamp: new Date()
    });
});

// Socket.io setup
setupSocketHandlers(io);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    Logger.error('Unhandled error', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// 404 handler - Only for API routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT}`);
    Logger.info(`Environment: ${process.env.NODE_ENV}`);
});

export {io};