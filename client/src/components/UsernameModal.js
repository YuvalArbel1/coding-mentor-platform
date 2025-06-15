import React, {useState} from 'react';

const UsernameModal = ({onSubmit}) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }

        if (username.trim().length < 2) {
            setError('Username must be at least 2 characters');
            return;
        }

        if (username.trim().length > 20) {
            setError('Username must be less than 20 characters');
            return;
        }

        onSubmit(username.trim());
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Student! 👋</h2>
                <p className="text-gray-400 mb-6">Enter your name to join the coding session</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError('');
                        }}
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                        maxLength={20}
                        autoFocus
                    />

                    {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Join Session
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UsernameModal;