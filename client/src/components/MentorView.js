import React, {useState} from 'react';
import MonacoEditor from './MonacoEditor';

const MentorView = ({students, codeBlock, onStudentUpdate, onStudentSolved}) => {
    const [selectedStudent, setSelectedStudent] = useState(null);

    // If no students, show empty state
    if (!students || students.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <p className="text-xl mb-2">No students have joined yet</p>
                    <p>Waiting for students to connect...</p>
                </div>
            </div>
        );
    }

    // Select first student by default
    if (!selectedStudent && students.length > 0) {
        setSelectedStudent(students[0].socketId);
    }

    const currentStudent = students.find(s => s.socketId === selectedStudent);

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Student List Sidebar */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Students ({students.length})</h3>
                    <div className="space-y-2">
                        {students.map((student) => (
                            <button
                                key={student.socketId}
                                onClick={() => setSelectedStudent(student.socketId)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${
                                    selectedStudent === student.socketId
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{student.name}</span>
                                    {student.solved && (
                                        <span className="text-green-400" title="Solved!">✅</span>
                                    )}
                                </div>
                                {student.lastUpdate && (
                                    <div className="text-xs text-gray-400 mt-1">
                                        Last update: {new Date(student.lastUpdate).toLocaleTimeString()}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col">
                {currentStudent && (
                    <>
                        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-white">
                                    {currentStudent.name}'s Code
                                </h3>
                                {currentStudent.solved && (
                                    <span className="text-green-400 font-medium">
                                        ✅ Solution Correct!
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <MonacoEditor
                                value={currentStudent.code || codeBlock.initial_code}
                                options={{
                                    readOnly: true,
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
                    </>
                )}
            </div>
        </div>
    );
};

export default MentorView;