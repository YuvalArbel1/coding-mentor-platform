/**
 * Main server entry point
 * @module server
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import configurations
import './config/database.js'; // Initialize database connection
import Logger from './utils/logger.js';

// Import routes
import codeBlockRoutes from './routes/codeBlockRoutes.js';

// Import Socket controller
import setupSocketHandlers from './controllers/socketController.js';

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
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
    res.json({
        message: 'Coding Mentor Platform API',
        version: '1.0.0',
        timestamp: new Date()
    });
});

// API Routes
app.use('/api/blocks', codeBlockRoutes);

// Socket.io setup
setupSocketHandlers(io);

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

// 404 handler
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

export { io };