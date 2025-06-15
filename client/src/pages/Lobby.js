/**
 * Lobby Page Component
 *
 * The main landing page of the Coding Mentor Platform where users can:
 * - View all available code blocks
 * - Select a code block to start a coding session
 * - See loading and error states
 *
 * @component
 * @module pages/Lobby
 */

import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {codeBlockAPI} from '../services/api';

/**
 * Lobby Component - Displays available code blocks
 *
 * @component
 * @returns {JSX.Element} The lobby page with code block cards
 */
const Lobby = () => {
    /**
     * State for storing code blocks fetched from API
     * @type {[Array, Function]}
     */
    const [codeBlocks, setCodeBlocks] = useState([]);

    /**
     * Loading state for API calls
     * @type {[boolean, Function]}
     */
    const [loading, setLoading] = useState(true);

    /**
     * Error state for failed API calls
     * @type {[string|null, Function]}
     */
    const [error, setError] = useState(null);

    /**
     * React Router navigation hook
     */
    const navigate = useNavigate();

    /**
     * Fetch code blocks on component mount
     */
    useEffect(() => {
        fetchCodeBlocks();
    }, []);

    /**
     * Fetches all available code blocks from the API
     * Handles loading and error states
     *
     * @async
     * @function fetchCodeBlocks
     * @returns {Promise<void>}
     */
    const fetchCodeBlocks = async () => {
        try {
            setLoading(true);
            const response = await codeBlockAPI.getAllBlocks();
            setCodeBlocks(response.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to load code blocks. Please try again.');
            console.error('Error fetching code blocks:', err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handles navigation to selected code block
     *
     * @function handleBlockClick
     * @param {number} blockId - ID of the selected code block
     */
    const handleBlockClick = (blockId) => {
        navigate(`/block/${blockId}`);
    };

    /**
     * Returns an emoji icon based on the code block title
     *
     * @function getIcon
     * @param {string} title - Code block title
     * @returns {string} Emoji icon
     */
    const getIcon = (title) => {
        if (title.includes('Async')) return '⚡';
        if (title.includes('Array')) return '📊';
        if (title.includes('Promise')) return '🔄';
        if (title.includes('Closure')) return '🔒';
        return '💻';
    };

    // Loading state UI
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading code blocks...</p>
                </div>
            </div>
        );
    }

    // Error state UI
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl">{error}</p>
                    <button
                        onClick={fetchCodeBlocks}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Main lobby UI
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
                    Choose Code Block
                </h1>
                <p className="text-xl text-gray-400">
                    Select a JavaScript challenge to practice with real-time mentoring
                </p>
            </div>

            {/* Code blocks grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {codeBlocks.map((block) => (
                    <div
                        key={block.id}
                        onClick={() => handleBlockClick(block.id)}
                        className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                    >
                        {/* Card content */}
                        <div
                            className="bg-gray-800 rounded-xl p-6 border border-gray-700 group-hover:border-blue-500 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
                            <div className="flex items-center mb-4">
                                <span className="text-4xl mr-3">{getIcon(block.title)}</span>
                                <h2 className="text-2xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                    {block.title}
                                </h2>
                            </div>

                            <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                {block.description}
                            </p>

                            {/* Arrow indicator */}
                            <div
                                className="mt-4 flex items-center text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-sm mr-2">Start coding</span>
                                <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform"
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                </svg>
                            </div>
                        </div>

                        {/* Glow effect */}
                        <div
                            className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-16 text-center text-gray-500">
                <p>💡 First person to join becomes the mentor (read-only mode)</p>
            </div>
        </div>
    );
};

export default Lobby;