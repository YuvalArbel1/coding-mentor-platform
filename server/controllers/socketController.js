/**
 * Socket.io Controller - Handles real-time communication
 * @module controllers/socketController
 */

import { SOCKET_EVENTS, USER_ROLES } from '../utils/constants.js';
import roomService from '../services/roomService.js';
import CodeBlockService from '../services/codeBlockService.js';
import Logger from '../utils/logger.js';

/**
 * Setup Socket.io event handlers
 * @param {Server} io - Socket.io server instance
 */
function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        Logger.info(`New client connected: ${socket.id}`);

        /**
         * Handle joining a code block room
         */
        socket.on(SOCKET_EVENTS.JOIN_ROOM, async ({ blockId }) => {
            try {
                // Leave any previous rooms
                const rooms = Array.from(socket.rooms);
                rooms.forEach(room => {
                    if (room !== socket.id) {
                        socket.leave(room);
                    }
                });

                // Join the new room
                const roomName = `block-${blockId}`;
                socket.join(roomName);

                // Assign role and get room info
                const { role, room } = roomService.joinRoom(blockId, socket.id);

                // Get the code block data
                const codeBlock = await CodeBlockService.getCodeBlockById(blockId);

                // Send role and initial code to the user
                socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
                    role,
                    code: room.code || codeBlock.initial_code,
                    title: codeBlock.title,
                    description: codeBlock.description
                });

                // Update room info for all users
                io.to(roomName).emit(SOCKET_EVENTS.ROOM_INFO, roomService.getRoomInfo(blockId));

                Logger.info(`User ${socket.id} joined room ${roomName} as ${role}`);
            } catch (error) {
                Logger.error('Error joining room', error);
                socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join room' });
            }
        });

        /**
         * Handle code changes from students
         */
        socket.on(SOCKET_EVENTS.CODE_CHANGE, async ({ blockId, code }) => {
            try {
                const room = roomService.getOrCreateRoom(blockId);

                // Only students can change code
                if (room.students.has(socket.id)) {
                    roomService.updateRoomCode(blockId, code);

                    // Broadcast to all users in the room
                    socket.to(`block-${blockId}`).emit(SOCKET_EVENTS.CODE_CHANGE, { code });

                    // Check if solution matches
                    const isCorrect = await CodeBlockService.checkSolution(blockId, code);
                    if (isCorrect) {
                        io.to(`block-${blockId}`).emit(SOCKET_EVENTS.SOLUTION_MATCHED);
                        Logger.info(`Solution matched for block ${blockId}`);
                    }
                }
            } catch (error) {
                Logger.error('Error handling code change', error);
            }
        });

        /**
         * Handle cursor position updates
         */
        socket.on(SOCKET_EVENTS.CURSOR_MOVE, ({ blockId, position, selection }) => {
            const room = roomService.getOrCreateRoom(blockId);

            // Get user info
            let userName = 'Anonymous';
            let userColor = '#' + Math.floor(Math.random()*16777215).toString(16);

            if (room.mentor === socket.id) {
                userName = 'Mentor';
                userColor = '#FF6B6B';
            } else if (room.students.has(socket.id)) {
                const studentIndex = Array.from(room.students).indexOf(socket.id);
                userName = `Student ${studentIndex + 1}`;
            }

            // Broadcast cursor position to others
            socket.to(`block-${blockId}`).emit(SOCKET_EVENTS.CURSOR_MOVE, {
                userId: socket.id,
                userName,
                userColor,
                position,
                selection
            });
        });

        /**
         * Handle disconnect
         */
        socket.on('disconnect', () => {
            Logger.info(`Client disconnected: ${socket.id}`);

            // Find which room the user was in
            const blockId = roomService.findRoomBySocketId(socket.id);

            if (blockId) {
                const { wasMentor, room } = roomService.leaveRoom(blockId, socket.id);

                if (wasMentor && room && room.students.size > 0) {
                    // Mentor left, notify students
                    io.to(`block-${blockId}`).emit(SOCKET_EVENTS.MENTOR_LEFT);
                    Logger.info(`Mentor left room block-${blockId}, students will be redirected`);
                }

                // Update room info
                if (room) {
                    io.to(`block-${blockId}`).emit(SOCKET_EVENTS.ROOM_INFO, roomService.getRoomInfo(blockId));
                }
            }
        });
    });
}

export default setupSocketHandlers;