import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {codeBlockAPI} from '../services/api';
import socketService from '../services/socket';

const CodeBlock = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [codeBlock, setCodeBlock] = useState(null);
    const [code, setCode] = useState('');
    const [role, setRole] = useState('');
    const [roomInfo, setRoomInfo] = useState({studentCount: 0});
    const [showCelebration, setShowCelebration] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Connect to socket and join room
        const socket = socketService.connect();

        // Fetch code block data
        fetchCodeBlock();

        // Setup socket listeners
        setupSocketListeners();

        // Join the room
        socketService.joinRoom(parseInt(id));

        // Cleanup
        return () => {
            socketService.removeAllListeners();
            socketService.disconnect();
        };
    }, [id]);

    const fetchCodeBlock = async () => {
        try {
            setLoading(true);
            const response = await codeBlockAPI.getBlockById(id);
            setCodeBlock(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load code block');
            console.error('Error fetching code block:', err);
        } finally {
            setLoading(false);
        }
    };

    const setupSocketListeners = () => {
        // When joined room
        socketService.onJoinRoom((data) => {
            setRole(data.role);
            setCode(data.code);
        });

        // Code changes from other users
        socketService.onCodeChange((data) => {
            setCode(data.code);
        });

        // Room info updates
        socketService.onRoomInfo((data) => {
            setRoomInfo(data);
        });

        // When mentor leaves
        socketService.onMentorLeft(() => {
            alert('The mentor has left the room. Redirecting to lobby...');
            navigate('/');
        });

        // Solution matched
        socketService.onSolutionMatched(() => {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 5000);
        });
    };

    const handleCodeChange = (newCode) => {
        if (role === 'student') {
            setCode(newCode);
            socketService.sendCodeChange(parseInt(id), newCode);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading code editor...</p>
                </div>
            </div>
        );
    }

    if (error || !codeBlock) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl">{error || 'Code block not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Back to Lobby
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{codeBlock.title}</h1>
                        <p className="text-gray-400 mt-1">{codeBlock.description}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Role Badge */}
                        <div className={`px-4 py-2 rounded-lg font-medium ${
                            role === 'mentor'
                                ? 'bg-purple-600 text-white'
                                : 'bg-green-600 text-white'
                        }`}>
                            {role === 'mentor' ? '👨‍🏫 Mentor (Read-only)' : '👨‍🎓 Student'}
                        </div>

                        {/* Student Count */}
                        <div className="bg-gray-700 px-4 py-2 rounded-lg">
                            <span className="text-gray-300">Students: </span>
                            <span className="text-white font-bold">{roomInfo.studentCount}</span>
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </header>

            {/* Code Editor */}
            <div className="flex-1 relative">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    options={{
                        readOnly: role === 'mentor',
                        minimap: {enabled: false},
                        fontSize: 16,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: {top: 20, bottom: 20},
                    }}
                />
            </div>

            {/* Celebration Overlay */}
            {showCelebration && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="text-center animate-bounce-slow">
                        <div className="text-9xl mb-4 celebrate">🎉</div>
                        <h2 className="text-5xl font-bold text-green-400 mb-2">
                            Congratulations!
                        </h2>
                        <p className="text-2xl text-gray-300">
                            You solved the challenge! 🚀
                        </p>
                    </div>

                    {/* Confetti effect background */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-pulse-slow"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 4}s`,
                                }}
                            >
                                {['🎊', '🎈', '⭐', '✨'][Math.floor(Math.random() * 4)]}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeBlock;