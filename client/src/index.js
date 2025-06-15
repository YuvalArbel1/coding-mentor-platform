/**
 * Application Entry Point
 *
 * This file serves as the main entry point for the React application.
 * It handles:
 * - React DOM rendering
 * - Monaco Editor initialization fixes
 * - Root component mounting
 *
 * @module index
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import fixMonacoResize from './utils/fixMonaco';

/**
 * Fix Monaco Editor ResizeObserver errors
 * This must be called before the app renders to prevent console errors
 * from Monaco Editor's resize observer implementation
 */
fixMonacoResize();

/**
 * Create React root and render the application
 * Using React 18's createRoot API for concurrent features
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * Render the App component
 * Note: StrictMode is intentionally omitted to avoid double socket connections
 * in development mode
 */
root.render(
    <App/>
);