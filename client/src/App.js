import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Lobby from './pages/Lobby';
import CodeBlock from './pages/CodeBlock';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-900 text-white">
                <Routes>
                    <Route path="/" element={<Lobby/>}/>
                    <Route path="/block/:id" element={<CodeBlock/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;