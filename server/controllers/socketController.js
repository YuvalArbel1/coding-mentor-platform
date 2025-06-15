/**
 * Socket.io Controller - Handles real-time communication
 * @module controllers/socketController
 */

import {SOCKET_EVENTS, USER_ROLES} from '../utils/constants.js';
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
        socket.on(SOCKET_EVENTS.JOIN_ROOM, async ({blockId}) => {
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

                // Get the code block data
                const codeBlock = await CodeBlockService.getCodeBlockById(blockId);

                // Assign role and get room info
                const {role, room} = roomService.joinRoom(blockId, socket.id, codeBlock.initial_code);

                // Prepare response based on role
                let responseData = {
                    role,
                    title: codeBlock.title,
                    description: codeBlock.description
                };

                if (role === USER_ROLES.MENTOR) {
                    // Mentor gets all students' code (empty array if no students yet)
                    responseData.students = roomService.getAllStudentsCode(blockId);
                } else {
                    // Student gets their own code
                    responseData.code = codeBlock.initial_code;
                }

                // Send role and appropriate data to the user
                socket.emit(SOCKET_EVENTS.JOIN_ROOM, responseData);

                // Update room info for all users
                io.to(roomName).emit(SOCKET_EVENTS.ROOM_INFO, roomService.getRoomInfo(blockId));

                // If a student joined, notify the mentor immediately
                if (role === USER_ROLES.STUDENT && room.mentor) {
                    const student = room.students.get(socket.id);
                    io.to(room.mentor).emit(SOCKET_EVENTS.STUDENT_CODE_UPDATE, {
                        socketId: socket.id,
                        name: student.name,
                        code: student.code
                    });
                }

                Logger.info(`User ${socket.id} joined room ${roomName} as ${role}`);
            } catch (error) {
                Logger.error('Error joining room', error);
                socket.emit(SOCKET_EVENTS.ERROR, {message: 'Failed to join room'});
            }
        });

        /**
         * Handle code changes from students
         */
        socket.on(SOCKET_EVENTS.CODE_CHANGE, async ({blockId, code}) => {
            try {
                const room = roomService.getOrCreateRoom(blockId);

                // Only students can change code
                if (room.students.has(socket.id)) {
                    // Update this student's code
                    roomService.updateStudentCode(blockId, socket.id, code);

                    // Get student info
                    const student = room.students.get(socket.id);

                    // Send update to mentor only
                    if (room.mentor) {
                        io.to(room.mentor).emit(SOCKET_EVENTS.STUDENT_CODE_UPDATE, {
                            socketId: socket.id,
                            name: student.name,
                            code: code
                        });
                    }

                    // Check if solution matches
                    const isCorrect = await CodeBlockService.checkSolution(blockId, code);
                    if (isCorrect) {
                        // Notify the student
                        socket.emit(SOCKET_EVENTS.SOLUTION_MATCHED);

                        // Notify the mentor
                        if (room.mentor) {
                            io.to(room.mentor).emit(SOCKET_EVENTS.STUDENT_SOLVED, {
                                socketId: socket.id,
                                name: student.name
                            });
                        }

                        Logger.info(`Solution matched for student ${socket.id} in block ${blockId}`);
                    }
                }
            } catch (error) {
                Logger.error('Error handling code change', error);
            }
        });

        /**
         * Handle disconnect
         */
        socket.on('disconnect', () => {
            Logger.info(`Client disconnected: ${socket.id}`);

            // Find which room the user was in
            const blockId = roomService.findRoomBySocketId(socket.id);

            if (blockId) {
                // Get room info BEFORE leaving
                const roomBeforeLeave = roomService.getOrCreateRoom(blockId);
                const mentorId = roomBeforeLeave.mentor;

                const {wasMentor, room} = roomService.leaveRoom(blockId, socket.id);

                if (wasMentor && room && room.students.size > 0) {
                    // Mentor left, notify students
                    io.to(`block-${blockId}`).emit(SOCKET_EVENTS.MENTOR_LEFT);
                    Logger.info(`Mentor left room block-${blockId}, students will be redirected`);

                    // Clear the room completely when mentor leaves
                    roomService.clearRoom(blockId);
                } else if (!wasMentor && mentorId) {
                    // Student left and there's a mentor - notify them
                    Logger.info(`Notifying mentor ${mentorId} that student ${socket.id} left`);
                    io.to(mentorId).emit(SOCKET_EVENTS.STUDENT_LEFT, {
                        socketId: socket.id
                    });
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