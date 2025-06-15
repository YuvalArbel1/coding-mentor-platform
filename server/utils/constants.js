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
    HINT_RESPONSE: 'hint-response',
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

/**
 * AI hint configuration
 * @readonly
 */
export const AI_CONFIG = {
    MAX_HINTS_PER_SESSION: 5,
    HINT_COOLDOWN_MS: 120000, // 2 minutes
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 150,
    TEMPERATURE: 0.7
};