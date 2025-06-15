import React, {useState, useEffect} from 'react';

/**
 * StudentHintPanel Component
 *
 * A panel that displays hints to students and allows them to request new hints from mentors.
 * Students can receive up to 3 hints per coding session.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.hints - Array of hint objects already received by the student
 *   @param {string} props.hints[].level - Hint difficulty level ('basic', 'medium', 'advanced')
 *   @param {string} props.hints[].content - The actual hint text
 *   @param {boolean} props.hints[].canRequestMore - Whether more hints can be requested
 *   @param {number} props.hints[].totalHintsReceived - Total number of hints received
 * @param {Function} props.onRequestHint - Callback function when student requests a new hint
 * @param {string} props.studentName - Name of the student (used when requesting hints)
 *
 * @example
 * <StudentHintPanel
 *   hints={[{level: 'basic', content: 'Try using async/await'}]}
 *   onRequestHint={handleRequestHint}
 *   studentName="John Doe"
 * />
 */
const StudentHintPanel = ({hints, onRequestHint, studentName}) => {
    // State to track if a hint request is in progress
    const [isRequesting, setIsRequesting] = useState(false);

    // State to show success/error messages after hint requests
    const [lastRequestStatus, setLastRequestStatus] = useState(null);

    // State to track if student can request more hints (max 3)
    const [canRequestMore, setCanRequestMore] = useState(true);

    // State to track how many hints the student can still request
    const [hintsRemaining, setHintsRemaining] = useState(3);

    /**
     * Effect to update hint availability based on received hints
     * Runs whenever the hints array changes
     */
    useEffect(() => {
        // Update based on received hints
        if (hints.length > 0) {
            const lastHint = hints[hints.length - 1];
            // Check if more hints can be requested (fallback to simple length check)
            setCanRequestMore(lastHint.canRequestMore ?? (hints.length < 3));
            // Calculate remaining hints (max 3 total)
            setHintsRemaining(3 - (lastHint.totalHintsReceived ?? hints.length));
        }
    }, [hints]);

    /**
     * Handles the hint request process
     * - Validates if more hints can be requested
     * - Shows appropriate error message if limit reached
     * - Triggers the request and manages UI states
     */
    const handleRequestHint = () => {
        // Check if student has reached the 3-hint limit
        if (!canRequestMore) {
            setLastRequestStatus({
                type: 'error',
                message: 'You have received all available hints (3/3)'
            });
            return;
        }

        // Set requesting state and clear any previous status
        setIsRequesting(true);
        setLastRequestStatus(null);

        // Call parent component's request handler
        onRequestHint();

        // Reset requesting state after 2 seconds
        setTimeout(() => setIsRequesting(false), 2000);
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 max-h-40 flex flex-col">
            {/* Header section with title and request button */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div>
                    <h3 className="text-lg font-semibold text-white">💡 Hints</h3>
                    <p className="text-xs text-gray-400">
                        {hints.length}/3 hints used
                    </p>
                </div>

                {/* Request Hint Button with various states */}
                <button
                    onClick={handleRequestHint}
                    disabled={isRequesting || !canRequestMore}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        isRequesting
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : !canRequestMore
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {isRequesting ? 'Requesting...' :
                        !canRequestMore ? 'No More Hints' :
                            'Request Hint'}
                </button>
            </div>

            {/* Status message display (success/error) */}
            {lastRequestStatus && (
                <div className={`mb-2 p-2 rounded-lg text-sm flex-shrink-0 ${
                    lastRequestStatus.type === 'success'
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-red-900/50 text-red-300'
                }`}>
                    {lastRequestStatus.message}
                </div>
            )}

            {/* Scrollable hints container */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {hints.length === 0 ? (
                    // Empty state message
                    <p className="text-gray-400 text-sm">
                        No hints received yet. Click "Request Hint" when you need help!
                    </p>
                ) : (
                    // List of received hints
                    <div className="space-y-2">
                        {hints.map((hint, index) => (
                            <div
                                key={index}
                                className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                            >
                                {/* Hint header with level badge and number */}
                                <div className="flex items-center gap-2 mb-1">
                                    {/* Color-coded hint level badge */}
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        hint.level === 'basic'
                                            ? 'bg-green-600 text-white'    // Green for basic
                                            : hint.level === 'medium'
                                                ? 'bg-yellow-600 text-white' // Yellow for medium
                                                : 'bg-red-600 text-white'    // Red for advanced
                                    }`}>
                                        {hint.level.toUpperCase()} HINT
                                    </span>
                                    {/* Hint number indicator */}
                                    <span className="text-gray-400 text-xs">
                                        Hint #{index + 1}
                                    </span>
                                </div>
                                {/* Hint content */}
                                <p className="text-gray-200 text-sm">{hint.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentHintPanel;