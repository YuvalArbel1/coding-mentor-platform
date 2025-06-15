import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import fixMonacoResize from './utils/fixMonaco';

// Fix Monaco Editor ResizeObserver errors
fixMonacoResize();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App/>
);