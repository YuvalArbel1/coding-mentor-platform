import React, {useState} from 'react';

const MentorHintModal = ({hintRequest, onSendHint, onDecline, onClose}) => {
    const [selectedHintId, setSelectedHintId] = useState(null);

    if (!hintRequest) return null;

    const handleSend = () => {
        if (selectedHintId) {
            onSendHint(hintRequest.studentId, selectedHintId, hintRequest.blockId);
            onClose();
        }
    };

    const handleDecline = () => {
        onDecline(hintRequest.studentId, hintRequest.blockId);
        onClose();
    };

    // Find the recommended hint based on level
    const recommendedHint = hintRequest.availableHints.find(
        h => h.level === hintRequest.recommendedLevel
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">
                    Hint Request from {hintRequest.studentName}
                </h2>

                <div className="mb-4">
                    <p className="text-gray-300">
                        This is their <span className="font-bold text-yellow-400">
                            request #{hintRequest.requestNumber}
                        </span>
                        {hintRequest.totalSentHints > 0 && (
                            <span className="text-gray-400">
                                {' '}• Already sent: {hintRequest.totalSentHints}/3 hints
                            </span>
                        )}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                        Recommended: <span className="text-blue-400">
                            {hintRequest.recommendedLevel} hint
                        </span>
                    </p>
                </div>

                <div className="space-y-3 mb-6">
                    {hintRequest.availableHints.map((hint) => (
                        <label
                            key={hint.id}
                            className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedHintId === hint.id
                                    ? 'border-blue-500 bg-blue-900/20'
                                    : 'border-gray-600 hover:border-gray-500'
                            }`}
                        >
                            <input
                                type="radio"
                                name="hint"
                                value={hint.id}
                                checked={selectedHintId === hint.id}
                                onChange={() => setSelectedHintId(hint.id)}
                                className="sr-only"
                            />
                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    hint.level === 'basic'
                                        ? 'bg-green-600 text-white'
                                        : hint.level === 'medium'
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-red-600 text-white'
                                }`}>
                                    {hint.level.toUpperCase()}
                                </span>
                                <div className="flex items-center gap-2">
                                    {hint.alreadySent && (
                                        <span className="text-xs text-green-400">
                                            ✓ Already sent
                                        </span>
                                    )}
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

                <div className="flex gap-3">
                    <button
                        onClick={handleSend}
                        disabled={!selectedHintId}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedHintId
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Send Hint
                    </button>
                    <button
                        onClick={handleDecline}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Decline
                    </button>
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