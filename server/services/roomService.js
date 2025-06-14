/**
 * Room Service - Manages code block rooms and users
 * @module services/roomService
 */

import Logger from '../utils/logger.js';
import { USER_ROLES } from '../utils/constants.js';

class RoomService {
    constructor() {
        /**
         * Room data structure
         * @type {Map<string, {mentor: string|null, students: Set<string>, code: string}>}
         */
        this.rooms = new Map();
    }

    /**
     * Create or get a room
     * @param {string} blockId - Code block ID
     * @returns {Object} Room object
     */
    getOrCreateRoom(blockId) {
        const roomId = `block-${blockId}`;

        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                mentor: null,
                students: new Set(),
                code: '',
                blockId: blockId
            });
            Logger.info(`Created new room: ${roomId}`);
        }

        return this.rooms.get(roomId);
    }

    /**
     * Join a room and assign role
     * @param {string} blockId - Code block ID
     * @param {string} socketId - Socket ID
     * @returns {{role: string, room: Object}} Role and room info
     */
    joinRoom(blockId, socketId) {
        const room = this.getOrCreateRoom(blockId);
        let role;

        if (!room.mentor) {
            room.mentor = socketId;
            role = USER_ROLES.MENTOR;
            Logger.info(`Mentor ${socketId} joined room block-${blockId}`);
        } else {
            room.students.add(socketId);
            role = USER_ROLES.STUDENT;
            Logger.info(`Student ${socketId} joined room block-${blockId}`);
        }

        return { role, room };
    }

    /**
     * Leave a room
     * @param {string} blockId - Code block ID
     * @param {string} socketId - Socket ID
     * @returns {{wasMentor: boolean, room: Object|null}}
     */
    leaveRoom(blockId, socketId) {
        const room = this.getOrCreateRoom(blockId);
        let wasMentor = false;

        if (room.mentor === socketId) {
            wasMentor = true;
            room.mentor = null;
            room.code = ''; // Clear code when mentor leaves
            Logger.info(`Mentor ${socketId} left room block-${blockId}`);
        } else {
            room.students.delete(socketId);
            Logger.info(`Student ${socketId} left room block-${blockId}`);
        }

        // Clean up empty rooms
        if (!room.mentor && room.students.size === 0) {
            this.rooms.delete(`block-${blockId}`);
            Logger.info(`Deleted empty room block-${blockId}`);
            return { wasMentor, room: null };
        }

        return { wasMentor, room };
    }

    /**
     * Get room info
     * @param {string} blockId - Code block ID
     * @returns {Object} Room statistics
     */
    getRoomInfo(blockId) {
        const room = this.getOrCreateRoom(blockId);
        return {
            hasMentor: !!room.mentor,
            studentCount: room.students.size,
            totalUsers: (room.mentor ? 1 : 0) + room.students.size
        };
    }

    /**
     * Update room code
     * @param {string} blockId - Code block ID
     * @param {string} code - Updated code
     */
    updateRoomCode(blockId, code) {
        const room = this.getOrCreateRoom(blockId);
        room.code = code;
    }

    /**
     * Find room by socket ID
     * @param {string} socketId - Socket ID
     * @returns {string|null} Block ID or null
     */
    findRoomBySocketId(socketId) {
        for (const [roomId, room] of this.rooms) {
            if (room.mentor === socketId || room.students.has(socketId)) {
                return room.blockId;
            }
        }
        return null;
    }
}

// Export singleton instance
export default new RoomService();