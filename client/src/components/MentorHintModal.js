import React, {useState} from 'react';

/**
 * MentorHintModal Component
 *
 * A modal dialog that appears when a student requests a hint. Allows mentors to:
 * - See which student is requesting help
 * - View the student's request history
 * - Select from available hints (basic, medium, advanced)
 * - Send a hint or decline the request
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.hintRequest - The hint request object from the student
 *   @param {string} props.hintRequest.studentId - Socket ID of the requesting student
 *   @param {string} props.hintRequest.studentName - Name of the requesting student
 *   @param {string} props.hintRequest.blockId - ID of the current code block
 *   @param {number} props.hintRequest.requestNumber - Which hint request this is (1st, 2nd, 3rd)
 *   @param {string} props.hintRequest.recommendedLevel - Suggested hint level based on request number
 *   @param {Array} props.hintRequest.availableHints - Array of available hints to choose from
 *     @param {number} props.hintRequest.availableHints[].id - Unique hint ID
 *     @param {string} props.hintRequest.availableHints[].level - Hint level ('basic', 'medium', 'advanced')
 *     @param {boolean} props.hintRequest.availableHints[].alreadySent - Whether this hint was already sent
 *   @param {number} props.hintRequest.totalSentHints - Total hints already sent to this student
 * @param {Function} props.onSendHint - Callback when mentor sends a hint (studentId, hintId, blockId)
 * @param {Function} props.onDecline - Callback when mentor declines the request (studentId, blockId)
 * @param {Function} props.onClose - Callback to close the modal without action
 *
 */
const MentorHintModal = ({hintRequest, onSendHint, onDecline, onClose}) => {
    // State to track which hint the mentor has selected
    const [selectedHintId, setSelectedHintId] = useState(null);

    // Don't render if there's no hint request
    if (!hintRequest) return null;

    /**
     * Handles sending the selected hint to the student
     * Only proceeds if a hint has been selected and hasn't been sent already
     */
    const handleSend = () => {
        if (selectedHintId) {
            // Double-check the hint hasn't been sent
            const selectedHint = hintRequest.availableHints.find(h => h.id === selectedHintId);
            if (!selectedHint?.alreadySent) {
                onSendHint(hintRequest.studentId, selectedHintId, hintRequest.blockId);
                onClose();
            }
        }
    };

    /**
     * Handles declining the student's hint request
     * Notifies the student that their request was declined
     */
    const handleDecline = () => {
        onDecline(hintRequest.studentId, hintRequest.blockId);
        onClose();
    };

    /**
     * Find the recommended hint based on the recommendation algorithm
     * - 1st request: basic hint
     * - 2nd request: medium hint
     * - 3rd request: advanced hint
     */
    const recommendedHint = hintRequest.availableHints.find(
        h => h.level === hintRequest.recommendedLevel && !h.alreadySent
    );

    return (
        // Modal backdrop with semi-transparent black overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {/* Modal content container */}
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl">
                {/* Modal header */}
                <h2 className="text-2xl font-bold text-white mb-4">
                    Hint Request from {hintRequest.studentName}
                </h2>

                {totalRequests > 1 && (
                    <p className="text-yellow-400 text-sm mb-2">
                        📋 {totalRequests - 1} more request{totalRequests > 2 ? 's' : ''} in queue
                    </p>
                )}

                {/* Request information section */}
                <div className="mb-4">
                    <p className="text-gray-300">
                        This is their <span className="font-bold text-yellow-400">
                            request #{hintRequest.requestNumber}
                        </span>
                        {/* Show how many hints were already sent to this student */}
                        {hintRequest.totalSentHints > 0 && (
                            <span className="text-gray-400">
                                {' '}• Already sent: {hintRequest.totalSentHints}/3 hints
                            </span>
                        )}
                    </p>
                    {/* Display the recommended hint level */}
                    <p className="text-gray-400 text-sm mt-1">
                        Recommended: <span className="text-blue-400">
                            {hintRequest.recommendedLevel} hint
                        </span>
                    </p>
                </div>

                {/* Hint selection area */}
                <div className="space-y-3 mb-6">
                    {hintRequest.availableHints.map((hint) => (
                        <label
                            key={hint.id}
                            className={`block p-3 rounded-lg border-2 transition-all ${
                                hint.alreadySent
                                    ? 'cursor-not-allowed opacity-50 border-gray-600 bg-gray-800'
                                    : selectedHintId === hint.id
                                        ? 'cursor-pointer border-blue-500 bg-blue-900/20'
                                        : 'cursor-pointer border-gray-600 hover:border-gray-500'
                            }`}
                        >
                            {/* Hidden radio input for accessibility */}
                            <input
                                type="radio"
                                name="hint"
                                value={hint.id}
                                checked={selectedHintId === hint.id}
                                onChange={() => !hint.alreadySent && setSelectedHintId(hint.id)}
                                disabled={hint.alreadySent}
                                className="sr-only"
                            />
                            {/* Hint display content */}
                            <div className="flex items-center justify-between">
                                {/* Hint level badge with color coding */}
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    hint.level === 'basic'
                                        ? 'bg-green-600 text-white'    // Green for basic hints
                                        : hint.level === 'medium'
                                            ? 'bg-yellow-600 text-white' // Yellow for medium hints
                                            : 'bg-red-600 text-white'    // Red for advanced hints
                                }`}>
                                    {hint.level.toUpperCase()}
                                </span>
                                {/* Hint status indicators */}
                                <div className="flex items-center gap-2">
                                    {/* Show checkmark if hint was already sent */}
                                    {hint.alreadySent && (
                                        <span className="text-xs text-green-400 font-semibold">
                                            ✓ Already sent
                                        </span>
                                    )}
                                    {/* Show star for recommended hint (only if not already sent) */}
                                    {hint.id === recommendedHint?.id && !hint.alreadySent && (
                                        <span className="text-xs text-blue-400">
                                            ⭐ Recommended
                                        </span>
                                    )}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    {/* Send Hint button - disabled if no hint selected or if selected hint was already sent */}
                    <button
                        onClick={handleSend}
                        disabled={!selectedHintId || hintRequest.availableHints.find(h => h.id === selectedHintId)?.alreadySent}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedHintId && !hintRequest.availableHints.find(h => h.id === selectedHintId)?.alreadySent
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Send Hint
                    </button>
                    {/* Decline button - always enabled */}
                    <button
                        onClick={handleDecline}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Decline
                    </button>
                    {/* Cancel button - closes modal without action */}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MentorHintModal;