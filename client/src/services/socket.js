/**
 * Socket.io Client Service
 *
 * Handles all WebSocket connections and real-time communication
 * between the client and server for the collaborative coding platform.
 *
 * @module services/socket
 */

import {io} from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

/**
 * Socket Service - Manages WebSocket connections
 */
class SocketService {
    constructor() {
        this.socket = null;
    }

    /**
     * Connect to the Socket.io server
     */
    connect() {
        this.socket = io('/', {
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection failed:', error);
            alert('Failed to connect to server. Please refresh the page.');
        });

        return this.socket;
    }

    /**
     * Disconnect from the server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Join a code block room
     */
    joinRoom(blockId, username) {
        if (this.socket) {
            const data = {blockId};
            if (username) {
                data.username = username;
            }
            this.socket.emit('join-room', data);
        }
    }

    /**
     * Send code changes to server
     */
    sendCodeChange(blockId, code) {
        if (this.socket) {
            this.socket.emit('code-change', {blockId, code});
        }
    }

    // Hint-related methods
    requestHint(blockId, studentName) {
        if (this.socket) {
            this.socket.emit('request-hint', {blockId, studentName});
        }
    }

    sendHint(studentId, hintId, blockId) {
        if (this.socket) {
            this.socket.emit('send-hint', {
                studentId,
                hintId: Number(hintId),
                blockId
            });
        }
    }

    declineHint(studentId, blockId) {
        if (this.socket) {
            this.socket.emit('decline-hint', {studentId, blockId});
        }
    }

    // Event listeners
    onJoinRoom(callback) {
        if (this.socket) {
            this.socket.on('join-room', callback);
        }
    }

    onRoomInfo(callback) {
        if (this.socket) {
            this.socket.on('room-info', callback);
        }
    }

    onMentorLeft(callback) {
        if (this.socket) {
            this.socket.on('mentor-left', callback);
        }
    }

    onSolutionMatched(callback) {
        if (this.socket) {
            this.socket.on('solution-matched', callback);
        }
    }

    onStudentCodeUpdate(callback) {
        if (this.socket) {
            this.socket.on('student-code-update', callback);
        }
    }

    onStudentSolved(callback) {
        if (this.socket) {
            this.socket.on('student-solved', callback);
        }
    }

    onStudentLeft(callback) {
        if (this.socket) {
            this.socket.on('student-left', callback);
        }
    }

    // Hint event listeners
    onHintRequestReceived(callback) {
        if (this.socket) {
            this.socket.on('hint-request-received', callback);
        }
    }

    onHintRequestSent(callback) {
        if (this.socket) {
            this.socket.on('hint-request-sent', callback);
        }
    }

    onHintReceived(callback) {
        if (this.socket) {
            this.socket.on('hint-received', callback);
        }
    }

    onHintDeclined(callback) {
        if (this.socket) {
            this.socket.on('hint-declined', callback);
        }
    }

    onHintSentConfirmation(callback) {
        if (this.socket) {
            this.socket.on('hint-sent-confirmation', callback);
        }
    }

    onError(callback) {
        if (this.socket) {
            this.socket.on('error', callback);
        }
    }

    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
}

export default new SocketService();