/**
 * Application constants
 * @module utils/constants
 */

/**
 * Socket events
 * @readonly
 * @enum {string}
 */
export const SOCKET_EVENTS = {
    JOIN_ROOM: 'join-room',
    LEAVE_ROOM: 'leave-room',
    CODE_CHANGE: 'code-change',
    ROOM_INFO: 'room-info',
    MENTOR_LEFT: 'mentor-left',
    SOLUTION_MATCHED: 'solution-matched',
    REQUEST_HINT: 'request-hint',
    HINT_REQUEST_RECEIVED: 'hint-request-received',
    HINT_REQUEST_SENT: 'hint-request-sent',
    SEND_HINT: 'send-hint',
    HINT_RECEIVED: 'hint-received',
    HINT_SENT_CONFIRMATION: 'hint-sent-confirmation',
    DECLINE_HINT: 'decline-hint',
    HINT_DECLINED: 'hint-declined',
    CURSOR_MOVE: 'cursor-move',
    ERROR: 'error',
    STUDENT_CODE_UPDATE: 'student-code-update',
    STUDENT_SOLVED: 'student-solved',
    STUDENT_LEFT: 'student-left'
};

/**
 * User roles
 * @readonly
 * @enum {string}
 */
export const USER_ROLES = {
    MENTOR: 'mentor',
    STUDENT: 'student'
};

