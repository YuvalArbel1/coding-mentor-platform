import React, { useState, useEffect } from 'react';

const StudentHintPanel = ({ hints, onRequestHint, studentName }) => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [lastRequestStatus, setLastRequestStatus] = useState(null);
    const [canRequestMore, setCanRequestMore] = useState(true);
    const [hintsRemaining, setHintsRemaining] = useState(3);

    useEffect(() => {
        // Update based on received hints
        if (hints.length > 0) {
            const lastHint = hints[hints.length - 1];
            setCanRequestMore(lastHint.canRequestMore ?? (hints.length < 3));
            setHintsRemaining(3 - (lastHint.totalHintsReceived ?? hints.length));
        }
    }, [hints]);

    const handleRequestHint = () => {
        if (!canRequestMore) {
            setLastRequestStatus({
                type: 'error',
                message: 'You have received all available hints (3/3)'
            });
            return;
        }

        setIsRequesting(true);
        setLastRequestStatus(null);
        onRequestHint();

        // Reset requesting state after 2 seconds
        setTimeout(() => setIsRequesting(false), 2000);
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 max-h-48 flex flex-col">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div>
                    <h3 className="text-lg font-semibold text-white">💡 Hints</h3>
                    <p className="text-xs text-gray-400">
                        {hints.length}/3 hints used
                    </p>
                </div>
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

            {lastRequestStatus && (
                <div className={`mb-2 p-2 rounded-lg text-sm flex-shrink-0 ${
                    lastRequestStatus.type === 'success'
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-red-900/50 text-red-300'
                }`}>
                    {lastRequestStatus.message}
                </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0">
                {hints.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                        No hints received yet. Click "Request Hint" when you need help!
                    </p>
                ) : (
                    <div className="space-y-2">
                        {hints.map((hint, index) => (
                            <div
                                key={index}
                                className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        hint.level === 'basic'
                                            ? 'bg-green-600 text-white'
                                            : hint.level === 'medium'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-red-600 text-white'
                                    }`}>
                                        {hint.level.toUpperCase()} HINT
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                        Hint #{index + 1}
                                    </span>
                                </div>
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