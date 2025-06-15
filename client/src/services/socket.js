import {io} from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io(SOCKET_URL, {
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

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(blockId) {
        if (this.socket) {
            this.socket.emit('join-room', {blockId});
        }
    }

    sendCodeChange(blockId, code) {
        if (this.socket) {
            this.socket.emit('code-change', {blockId, code});
        }
    }


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

    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
}

export default new SocketService();