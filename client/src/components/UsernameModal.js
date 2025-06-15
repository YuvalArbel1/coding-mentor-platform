/**
 * Username Modal Component
 *
 * A modal dialog that prompts students to enter their name when joining
 * a coding session. This ensures proper identification in the collaborative
 * environment and helps mentors track individual student progress.
 *
 * @component
 * @module components/UsernameModal
 */

import React, {useState} from 'react';

/**
 * UsernameModal - Modal for username entry
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback function called with the username
 *                                     when form is submitted
 *
 * @returns {JSX.Element} Modal dialog with username form
 */
const UsernameModal = ({onSubmit}) => {
    /**
     * Username input state
     * @type {[string, Function]}
     */
    const [username, setUsername] = useState('');

    /**
     * Error message state for validation
     * @type {[string, Function]}
     */
    const [error, setError] = useState('');

    /**
     * Handles form submission with validation
     *
     * Validates that:
     * - Username is not empty
     * - Username is at least 2 characters long
     * - Username is not more than 20 characters
     *
     * @function handleSubmit
     * @param {Event} e - Form submit event
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: Check if username is empty
        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }

        // Validation: Minimum length
        if (username.trim().length < 2) {
            setError('Username must be at least 2 characters');
            return;
        }

        // Validation: Maximum length
        if (username.trim().length > 20) {
            setError('Username must be less than 20 characters');
            return;
        }

        // Submit trimmed username
        onSubmit(username.trim());
    };

    return (
        // Modal backdrop with semi-transparent overlay
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {/* Modal content */}
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
                {/* Modal header */}
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Student! 👋</h2>
                <p className="text-gray-400 mb-6">Enter your name to join the coding session</p>

                {/* Username form */}
                <form onSubmit={handleSubmit}>
                    {/* Username input field */}
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError(''); // Clear error on input change
                        }}
                        placeholder="Your name"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                        maxLength={20}
                        autoFocus
                    />

                    {/* Error message display */}
                    {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}

                    {/* Submit button */}
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