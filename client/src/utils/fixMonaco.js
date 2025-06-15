// Fix for Monaco Editor ResizeObserver loop errors
const fixMonacoResize = () => {
    // Filter out ResizeObserver errors
    const errorHandler = (e) => {
        if (e.message && e.message.includes('ResizeObserver loop')) {
            e.stopPropagation();
            e.preventDefault();
            return true;
        }
    };

    // Add error event listener
    window.addEventListener('error', errorHandler);

    // Override console.error to filter ResizeObserver errors
    const originalConsoleError = console.error;
    console.error = function (...args) {
        const errorString = args.join(' ');
        if (errorString.includes('ResizeObserver loop')) {
            return;
        }
        originalConsoleError.apply(console, args);
    };

    const ro = window.ResizeObserver;
    window.ResizeObserver = function (callback) {
        return new ro(function (entries, observer) {
            requestAnimationFrame(() => {
                callback(entries, observer);
            });
        });
    };
};

export default fixMonacoResize;