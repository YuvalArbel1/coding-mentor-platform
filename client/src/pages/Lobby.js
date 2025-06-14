import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {codeBlockAPI} from '../services/api';

const Lobby = () => {
    const [codeBlocks, setCodeBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCodeBlocks();
    }, []);

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

    const handleBlockClick = (blockId) => {
        navigate(`/block/${blockId}`);
    };

    // Block icons based on title
    const getIcon = (title) => {
        if (title.includes('Async')) return '⚡';
        if (title.includes('Array')) return '📊';
        if (title.includes('Promise')) return '🔄';
        if (title.includes('Closure')) return '🔒';
        return '💻';
    };

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

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
                    Choose Code Block
                </h1>
                <p className="text-gray-400 text-lg">
                    Select a JavaScript challenge to practice with real-time collaboration
                </p>
            </div>

            {/* Code Blocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {codeBlocks.map((block) => (
                    <div
                        key={block.id}
                        onClick={() => handleBlockClick(block.id)}
                        className="group relative bg-gray-800 rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 border border-gray-700 hover:border-blue-500"
                    >
                        {/* Decorative gradient */}
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="flex items-center mb-3">
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