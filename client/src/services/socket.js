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

    sendCursorPosition(blockId, position, selection) {
        if (this.socket) {
            this.socket.emit('cursor-move', {blockId, position, selection});
        }
    }

    onJoinRoom(callback) {
        if (this.socket) {
            this.socket.on('join-room', callback);
        }
    }

    onCodeChange(callback) {
        if (this.socket) {
            this.socket.on('code-change', callback);
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

    onCursorMove(callback) {
        if (this.socket) {
            this.socket.on('cursor-move', callback);
        }
    }

    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
}

export default new SocketService();