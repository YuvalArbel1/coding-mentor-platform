/**
 * Mentor View Component
 *
 * This component provides the mentor (Tom) with a comprehensive view of all students
 * in the coding session. It displays:
 * - A list of all connected students
 * - Real-time code updates from each student
 * - Visual indicators for solved solutions
 * - Read-only code viewer for selected student
 *
 * @component
 * @module components/MentorView
 */

import React, {useState, useEffect} from 'react';
import Editor from '@monaco-editor/react';

/**
 * MentorView - Dashboard for mentors to monitor student progress
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.students - Array of student objects
 *   @param {string} props.students[].socketId - Unique socket ID for the student
 *   @param {string} props.students[].name - Student's display name
 *   @param {string} props.students[].code - Student's current code
 *   @param {Date} props.students[].joinedAt - When student joined
 *   @param {Date} props.students[].lastUpdate - Last code update timestamp
 *   @param {boolean} props.students[].solved - Whether student solved the problem
 * @param {Object} props.codeBlock - Current code block information
 *   @param {string} props.codeBlock.title - Title of the code block
 *   @param {string} props.codeBlock.initial_code - Initial code template
 *
 * @returns {JSX.Element} The mentor view dashboard
 */
const MentorView = ({students, codeBlock}) => {
    /**
     * Currently selected student for code viewing
     * @type {[Object|null, Function]}
     */
    const [currentStudent, setCurrentStudent] = useState(null);

    /**
     * Update current student when students array changes
     * Ensures the selected student's data stays up-to-date
     */
    useEffect(() => {
        if (currentStudent && students.length > 0) {
            // Find and update current student data
            const updated = students.find(s => s.socketId === currentStudent.socketId);
            if (updated) {
                setCurrentStudent(updated);
            } else {
                // Current student left - select first available student
                setCurrentStudent(students[0]);
            }
        } else if (!currentStudent && students.length > 0) {
            // Auto-select first student if none selected
            setCurrentStudent(students[0]);
        } else if (students.length === 0) {
            // No students left - clear current student
            setCurrentStudent(null);
        }
    }, [students, currentStudent]);

    return (
        <div className="flex h-full">
            {/* Students Sidebar */}
            <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Students ({students.length})
                    </h2>

                    {/* Student list */}
                    <div className="space-y-2">
                        {students.map((student) => (
                            <button
                                key={student.socketId}
                                onClick={() => setCurrentStudent(student)}
                                className={`w-full text-left p-3 rounded-lg transition-all ${
                                    currentStudent?.socketId === student.socketId
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                            >
                                {/* Student info header */}
                                <div className="font-medium">
                                    <div className="flex items-center justify-between">
                                        <span>{student.name}</span>
                                        {student.solved && (
                                            <span className="text-green-400" title="Solution Correct">
                                                ✅
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Last update timestamp */}
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
                        {/* Header with student info */}
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

                        {/* Monaco Editor - Read Only */}
                        <div className="flex-1">
                            <Editor
                                theme="vs-dark"
                                language="javascript"
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