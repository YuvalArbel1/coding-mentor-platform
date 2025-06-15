/**
 * Main Application Component
 *
 * This is the root component of the Coding Mentor Platform.
 * It sets up the routing structure and global styling for the entire application.
 *
 * @component
 * @module App
 *
 * @description
 * The App component serves as the entry point for the React application.
 * It configures:
 * - React Router for client-side navigation
 * - Global dark theme styling
 * - Route definitions for all pages
 *
 * @returns {JSX.Element} The complete application wrapped in Router with all routes
 */

import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Lobby from './pages/Lobby';
import CodeBlock from './pages/CodeBlock';

/**
 * App Component - Root application component
 *
 * @returns {JSX.Element} Router-wrapped application
 */
function App() {
    return (
        <Router>
            {/* Global dark theme container */}
            <div className="min-h-screen bg-gray-900 text-white">
                <Routes>
                    {/* Lobby page - Lists all available code blocks */}
                    <Route path="/" element={<Lobby/>}/>

                    {/* Code block page - Individual coding session */}
                    {/* :id param determines which code block to load */}
                    <Route path="/block/:id" element={<CodeBlock/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;