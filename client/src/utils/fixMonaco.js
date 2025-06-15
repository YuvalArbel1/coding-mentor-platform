/**
 * Monaco Editor ResizeObserver Error Fix
 *
 * This utility module fixes a known issue with Monaco Editor where ResizeObserver
 * throws errors in the console. These errors don't affect functionality but can
 * clutter the console and confuse developers.
 *
 * @module utils/fixMonaco
 *
 * @see {@link https://github.com/microsoft/monaco-editor/issues/2137} - Related issue
 */

/**
 * Fixes Monaco Editor ResizeObserver loop errors
 *
 * This function implements multiple strategies to prevent ResizeObserver errors:
 * 1. Filters out ResizeObserver errors from window error events
 * 2. Overrides console.error to filter these specific errors
 * 3. Wraps ResizeObserver callbacks in requestAnimationFrame
 *
 * @function fixMonacoResize
 * @returns {void}
 */
const fixMonacoResize = () => {
    /**
     * Error handler for window error events
     * Prevents ResizeObserver errors from propagating
     *
     * @param {ErrorEvent} e - The error event
     * @returns {boolean} True if error was handled (prevents default behavior)
     */
    const errorHandler = (e) => {
        if (e.message && e.message.includes('ResizeObserver loop')) {
            e.stopPropagation();
            e.preventDefault();
            return true;
        }
    };

    // Add error event listener to catch and suppress ResizeObserver errors
    window.addEventListener('error', errorHandler);

    /**
     * Store original console.error for non-ResizeObserver errors
     * @type {Function}
     */
    const originalConsoleError = console.error;

    /**
     * Override console.error to filter ResizeObserver errors
     * This ensures these errors don't appear in the console
     * while preserving all other error logging
     */
    console.error = function (...args) {
        const errorString = args.join(' ');
        if (errorString.includes('ResizeObserver loop')) {
            return;
        }
        originalConsoleError.apply(console, args);
    };

    /**
     * Store original ResizeObserver constructor
     * @type {ResizeObserver}
     */
    const ro = window.ResizeObserver;

    /**
     * Override ResizeObserver to wrap callbacks in requestAnimationFrame
     * This prevents the loop limit exceeded errors by deferring execution
     */
    window.ResizeObserver = function (callback) {
        return new ro(function (entries, observer) {
            requestAnimationFrame(() => {
                callback(entries, observer);
            });
        });
    };
};

export default fixMonacoResize;