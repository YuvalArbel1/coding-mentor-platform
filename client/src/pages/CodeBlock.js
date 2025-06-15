import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {codeBlockAPI} from '../services/api';
import socketService from '../services/socket';
import MentorView from '../components/MentorView';

const CodeBlock = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [codeBlock, setCodeBlock] = useState(null);
    const [code, setCode] = useState('');
    const [role, setRole] = useState('');
    const [isConnecting, setIsConnecting] = useState(true);
    const [roomInfo, setRoomInfo] = useState({studentCount: 0, students: []});
    const [showCelebration, setShowCelebration] = useState(false);
    const [isSolutionCorrect, setIsSolutionCorrect] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mentor-specific state
    const [students, setStudents] = useState([]);

    useEffect(() => {
        // Connect to socket
        socketService.connect();

        // Setup socket listeners FIRST (before joining room)
        setupSocketListeners();

        // Fetch code block data
        fetchCodeBlock();

        // Join the room after a small delay to ensure listeners are ready
        const joinTimeout = setTimeout(() => {
            socketService.joinRoom(parseInt(id));
        }, 100);

        // Cleanup
        return () => {
            clearTimeout(joinTimeout);
            socketService.removeAllListeners();
            socketService.disconnect();
        };
    }, [id]);

    // Add a useEffect to handle role-based updates
    useEffect(() => {
        if (role === 'mentor' && roomInfo.students) {
            const currentStudentIds = roomInfo.students.map(s => s.socketId);

            setStudents(prevStudents => {
                // Remove students who left
                const updatedStudents = prevStudents.filter(s =>
                    currentStudentIds.includes(s.socketId)
                );

                // Add any new students that aren't in our list
                roomInfo.students.forEach(roomStudent => {
                    if (!updatedStudents.find(s => s.socketId === roomStudent.socketId)) {
                        updatedStudents.push({
                            socketId: roomStudent.socketId,
                            name: roomStudent.name,
                            code: '// Loading...',
                            lastUpdate: new Date()
                        });
                    }
                });

                return updatedStudents;
            });
        }
    }, [role, roomInfo]);

    const fetchCodeBlock = async () => {
        try {
            setLoading(true);
            const response = await codeBlockAPI.getBlockById(id);

            // ADD THIS VALIDATION
            if (!response.data || parseInt(id) > 4 || parseInt(id) < 1) {
                setError('Invalid code block');
                setLoading(false);
                return;
            }

            setCodeBlock(response.data);
            if (!code && response.data.initial_code) {
                setCode(response.data.initial_code);
            }
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
            setIsConnecting(false);

            if (data.role === 'mentor') {
                // Mentor receives list of students
                setStudents(data.students || []);
            } else {
                // Student receives their code
                setCode(data.code || '// Loading code...');
            }
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

        // For students: Solution matched
        socketService.onSolutionMatched(() => {
            setShowCelebration(true);
            setIsSolutionCorrect(true);
            setTimeout(() => setShowCelebration(false), 5000);
        });

        // For mentors: Student code updates
        socketService.onStudentCodeUpdate((data) => {
            setStudents(prevStudents => {
                const updated = [...prevStudents];
                const studentIndex = updated.findIndex(s => s.socketId === data.socketId);

                if (studentIndex >= 0) {
                    updated[studentIndex] = {
                        ...updated[studentIndex],
                        code: data.code,
                        lastUpdate: new Date()
                    };
                } else {
                    // New student
                    updated.push({
                        socketId: data.socketId,
                        name: data.name,
                        code: data.code,
                        lastUpdate: new Date()
                    });
                }

                return updated;
            });
        });

        // For mentors: Student solved
        socketService.onStudentSolved((data) => {
            setStudents(prevStudents => {
                const updated = [...prevStudents];
                const studentIndex = updated.findIndex(s => s.socketId === data.socketId);

                if (studentIndex >= 0) {
                    updated[studentIndex] = {
                        ...updated[studentIndex],
                        solved: true
                    };
                }

                return updated;
            });
        });

        // For mentors: Student left
        socketService.onStudentLeft((data) => {
            setStudents(prevStudents => {
                const filtered = prevStudents.filter(s => s.socketId !== data.socketId);
                return filtered;
            });
        });
    };

    const handleCodeChange = (newCode) => {
        if (role === 'student') {
            setCode(newCode);
            socketService.sendCodeChange(parseInt(id), newCode);
        }
    };

    if (loading || isConnecting) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">
                        {isConnecting ? 'Connecting to room...' : 'Loading code editor...'}
                    </p>
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
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{codeBlock.title}</h1>
                        <p className="text-gray-400 mt-1">{codeBlock.description}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Role Badge - Only show when role is set */}
                        {role && (
                            <div className={`px-4 py-2 rounded-lg font-medium ${
                                role === 'mentor'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-green-600 text-white'
                            }`}>
                                {role === 'mentor' ? '👨‍🏫 Mentor (Read-only)' : '👨‍🎓 Student'}
                            </div>
                        )}

                        {/* Solution Status - Only for students */}
                        {role === 'student' && (
                            <div className="bg-gray-700 px-4 py-2 rounded-lg">
                                <span className="text-gray-300">Solution: </span>
                                <span
                                    className={`font-bold ${isSolutionCorrect ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {isSolutionCorrect ? '✅ Correct!' : '⏳ Keep trying...'}
                                </span>
                            </div>
                        )}

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

            {/* Main Content - Different for mentor vs student */}
            {role === 'mentor' ? (
                <MentorView
                    students={students}
                    codeBlock={codeBlock}
                />
            ) : (
                /* Student View - Code Editor */
                <div className="flex-1 overflow-hidden">
                    {code ? (
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            theme="vs-dark"
                            value={code}
                            onChange={handleCodeChange}
                            options={{
                                readOnly: false,
                                minimap: {enabled: false},
                                fontSize: 16,
                                lineNumbers: 'on',
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: {top: 20, bottom: 20},
                            }}
                            loading={<div className="flex items-center justify-center h-full text-gray-400">Loading
                                editor...</div>}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-400">Loading code...</div>
                        </div>
                    )}
                </div>
            )}

            {/* Celebration Overlay - Only for students */}
            {showCelebration && role === 'student' && (
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