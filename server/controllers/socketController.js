/**
 * Socket.io Controller - Handles real-time communication
 * @module controllers/socketController
 */

import {SOCKET_EVENTS, USER_ROLES} from '../utils/constants.js';
import roomService from '../services/roomService.js';
import CodeBlockService from '../services/codeBlockService.js';
import HintService from '../services/hintService.js';
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
        socket.on(SOCKET_EVENTS.JOIN_ROOM, async ({blockId, username}) => {
            try {
                // Check if socket is already in a room
                const existingBlockId = roomService.findRoomBySocketId(socket.id);
                if (existingBlockId && username && roomService.isStudent(existingBlockId, socket.id)) {
                    // Student is updating their username
                    roomService.updateStudentName(existingBlockId, socket.id, username);

                    // Get the room and student info
                    const room = roomService.getOrCreateRoom(existingBlockId);
                    const student = room.students.get(socket.id);

                    // Notify mentor of the name update
                    if (room.mentor && student) {
                        io.to(room.mentor).emit(SOCKET_EVENTS.STUDENT_CODE_UPDATE, {
                            socketId: socket.id,
                            name: username,
                            code: student.code
                        });
                    }

                    // Update room info for everyone
                    io.to(`block-${existingBlockId}`).emit(SOCKET_EVENTS.ROOM_INFO, roomService.getRoomInfo(existingBlockId));

                    // Don't process further - just return
                    Logger.info(`Student ${socket.id} updated name to ${username}`);
                    return;
                }

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

                // Assign role and get room info - now with username
                const {role, room} = roomService.joinRoom(blockId, socket.id, codeBlock.initial_code, username);

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
         * Handle hint request from student
         */
        socket.on(SOCKET_EVENTS.REQUEST_HINT, async ({ blockId, studentName }) => {
            try {
                const room = roomService.getOrCreateRoom(blockId);

                // Check if student is in the room
                if (!room.students.has(socket.id)) {
                    socket.emit(SOCKET_EVENTS.ERROR, { message: 'You must be a student to request hints' });
                    return;
                }

                // Check if student can request more hints
                if (!HintService.canRequestMoreHints(blockId, socket.id)) {
                    socket.emit(SOCKET_EVENTS.ERROR, { message: 'You have already received the maximum number of hints (3)' });
                    return;
                }

                // Track the hint request
                const requestCount = HintService.trackHintRequest(blockId, socket.id);

                // Get available hints for this code block
                const hints = await HintService.getHintsByCodeBlock(blockId);

                // Get already sent hints
                const sentHints = HintService.getSentHints(blockId, socket.id);

                // Notify mentor about the hint request
                if (room.mentor) {
                    io.to(room.mentor).emit(SOCKET_EVENTS.HINT_REQUEST_RECEIVED, {
                        studentId: socket.id,
                        studentName: studentName || room.students.get(socket.id).name,
                        blockId,
                        requestNumber: requestCount,
                        recommendedLevel: HintService.getRecommendedHintLevel(requestCount),
                        availableHints: hints.map(h => ({
                            id: h.id,
                            level: h.level,
                            alreadySent: sentHints.has(h.id)
                        })),
                        totalSentHints: sentHints.size
                    });

                    // Notify student that request was sent
                    socket.emit(SOCKET_EVENTS.HINT_REQUEST_SENT, {
                        message: 'Your hint request has been sent to the mentor',
                        requestNumber: requestCount,
                        hintsRemaining: 3 - sentHints.size
                    });
                } else {
                    socket.emit(SOCKET_EVENTS.ERROR, {
                        message: 'No mentor available to approve hints'
                    });
                }

                Logger.info(`Student ${socket.id} requested hint #${requestCount} for block ${blockId}`);
            } catch (error) {
                Logger.error('Error handling hint request', error);
                socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to request hint' });
            }
        });

        /**
         * Handle mentor sending hint to student
         */
        socket.on(SOCKET_EVENTS.SEND_HINT, async ({ studentId, hintId, blockId }) => {
            try {
                const room = roomService.getOrCreateRoom(blockId);

                // Verify sender is the mentor
                if (room.mentor !== socket.id) {
                    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only mentors can send hints' });
                    return;
                }

                // Get the hint content
                const hint = await HintService.getHintById(hintId);

                // Record that this hint was sent
                HintService.recordSentHint(blockId, studentId, hintId);

                // Get total hints sent to this student
                const sentHints = HintService.getSentHints(blockId, studentId);

                // Send hint to specific student
                io.to(studentId).emit(SOCKET_EVENTS.HINT_RECEIVED, {
                    level: hint.level,
                    content: hint.content,
                    requestNumber: HintService.getHintRequestCount(blockId, studentId),
                    totalHintsReceived: sentHints.size,
                    canRequestMore: sentHints.size < 3
                });

                // Confirm to mentor
                socket.emit(SOCKET_EVENTS.HINT_SENT_CONFIRMATION, {
                    studentId,
                    level: hint.level,
                    totalSentToStudent: sentHints.size
                });

                Logger.info(`Mentor sent ${hint.level} hint to student ${studentId}`);
            } catch (error) {
                Logger.error('Error sending hint', error);
                socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to send hint' });
            }
        });

        /**
         * Handle mentor declining hint request
         */
        socket.on(SOCKET_EVENTS.DECLINE_HINT, ({ studentId, blockId }) => {
            try {
                const room = roomService.getOrCreateRoom(blockId);

                // Verify sender is the mentor
                if (room.mentor !== socket.id) {
                    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only mentors can decline hints' });
                    return;
                }

                // Notify student
                io.to(studentId).emit(SOCKET_EVENTS.HINT_DECLINED, {
                    message: 'Your hint request was declined by the mentor'
                });

                Logger.info(`Mentor declined hint request from student ${studentId}`);
            } catch (error) {
                Logger.error('Error declining hint', error);
                socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to decline hint' });
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
                    // Also clear hint requests for this room
                    HintService.clearHintRequests(blockId);
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