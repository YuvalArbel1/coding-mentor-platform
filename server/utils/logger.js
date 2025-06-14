/**
 * Simple logger utility
 * @module utils/logger
 */

/**
 * Logger class for consistent logging
 */
class Logger {
    /**
     * Log info message
     * @param {string} message - Message to log
     * @param {Object} [meta] - Additional metadata
     */
    static info(message, meta = {}) {
        console.log(`[${new Date().toISOString()}] INFO: ${message}`, meta);
    }

    /**
     * Log error message
     * @param {string} message - Error message
     * @param {Error} [error] - Error object
     */
    static error(message, error = null) {
        console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
    }

    /**
     * Log warning message
     * @param {string} message - Warning message
     * @param {Object} [meta] - Additional metadata
     */
    static warn(message, meta = {}) {
        console.warn(`[${new Date().toISOString()}] WARN: ${message}`, meta);
    }

    /**
     * Log debug message
     * @param {string} message - Debug message
     * @param {Object} [meta] - Additional metadata
     */
    static debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${new Date().toISOString()}] DEBUG: ${message}`, meta);
        }
    }
}

export default Logger;