# 🚀 Coding Mentor Platform

A real-time collaborative coding platform that enables mentors to guide students through JavaScript challenges with live code synchronization, solution validation, and an advanced hint system.

## 🌟 Live Demo

[Deploy URL will go here]

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Testing Solutions](#testing-solutions)
- [Bonus Feature](#bonus-feature)
- [Screenshots](#screenshots)
- [API Documentation](#api-documentation)

## 🎯 Overview

This platform was built to help Tom, a JavaScript lecturer, continue mentoring his students remotely from Thailand. The application provides:

- **Real-time collaboration** between mentors and students
- **Live code synchronization** using WebSockets
- **Automatic role assignment** (first user becomes mentor)
- **Solution validation** with visual feedback
- **Advanced hint system** for guided learning

## ✨ Features

### Core Requirements ✅
- **Lobby Page**: Lists 4 JavaScript coding challenges
- **Role Management**: First user becomes read-only mentor, others are students
- **Real-time Sync**: Code changes appear instantly for all users
- **Syntax Highlighting**: Beautiful code editor with JavaScript support
- **Student Counter**: Shows active students in each room
- **Solution Checking**: Displays celebration animation when correct
- **Mentor Protection**: Students redirect to lobby if mentor leaves

### 🎁 Bonus Feature: Advanced Hint System
- **Smart Hint Requests**: Students can request hints when stuck
- **3-Tier Hint Levels**: Basic → Medium → Advanced
- **Request Limits**: Maximum 3 hints per student per challenge
- **Mentor Control**: Approve/decline hint requests with visual modal
- **Duplicate Prevention**: Already-sent hints are disabled
- **Visual Feedback**: Color-coded hints with clear status indicators

## 🛠 Tech Stack

### Frontend
- **React 19.1.0** - UI framework
- **Socket.io-client** - Real-time communication
- **Monaco Editor** - VS Code's editor (syntax highlighting)
- **React Router v7** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **PostgreSQL** - Database (hosted on Neon)
- **ES Modules** - Modern JavaScript

### Deployment
- **Frontend**: Vercel/Netlify ready
- **Backend**: Railway/Render ready
- **Database**: Neon PostgreSQL

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Client   │────▶│  Express Server │────▶│  PostgreSQL DB  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │
        │    WebSocket          │
        └────────────────────────┘
```

### Directory Structure
```
coding-mentor-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API & Socket services
│   │   └── utils/        # Helper functions
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Database config
│   ├── controllers/      # Request handlers
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Constants & logger
│   └── index.js         # Entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/coding-mentor-platform.git
   cd coding-mentor-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. **Set up environment variables**

   Create `.env` in server directory:
   ```env
   PORT=3001
   DATABASE_URL=postgresql://user:pass@host/dbname
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   ```

   Create `.env` in client directory:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_SOCKET_URL=http://localhost:3001
   ```

4. **Initialize the database**
   ```bash
   # Run the SQL scripts in your PostgreSQL database
   # Files: server/db/init.sql and server/db/hints.sql
   ```

5. **Start the application**
   ```bash
   # From root directory
   npm run dev

   # Or start separately:
   # Terminal 1 - Server
   cd server && npm run dev

   # Terminal 2 - Client
   cd client && npm start
   ```

## 🧪 Testing Solutions

### Code Block Solutions (EXACT - Copy & Paste)

#### 1. Async Case
```javascript
// Write an async function that fetches user data
async function getUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}
```

#### 2. Array Methods
```javascript
// Use map to double all numbers in the array
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
```

#### 3. Promise Handling
```javascript
// Create a promise that resolves after 2 seconds
function delay() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Done!");
    }, 2000);
  });
}
```

#### 4. Closure Example
```javascript
// Create a counter function using closure
function createCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}
```



## 🎨 Screenshots

### Lobby Page
- Clean interface with 4 coding challenges
- Dark theme for comfortable coding
- Clear navigation

### Code Block Page - Student View
- Editable Monaco editor
- Hint panel with request button
- Real-time student counter
- Solution status indicator

### Code Block Page - Mentor View
- Read-only code viewer
- Student list sidebar
- Real-time code monitoring
- Hint approval modal

### Hint System
- Color-coded hints (Green: Basic, Yellow: Medium, Red: Advanced)
- Request limit indicator
- Clear status messages
- Modal for mentor approval

## 📡 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blocks` | Get all code blocks |
| GET | `/api/blocks/:id` | Get specific code block |
| POST | `/api/blocks/:id/check` | Validate solution |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Join a code block room |
| `code-change` | Client → Server | Send code updates |
| `request-hint` | Client → Server | Request a hint |
| `send-hint` | Client → Server | Approve and send hint |
| `solution-matched` | Server → Client | Solution is correct |
| `hint-received` | Server → Client | Receive approved hint |

## 🏆 What Makes This Project Special

1. **Complete Feature Set**: All requirements implemented perfectly
2. **Advanced Hint System**: Sophisticated bonus feature with request management
3. **Production Ready**: Proper error handling, loading states, and edge case management
4. **Clean Architecture**: Well-organized code with clear separation of concerns
5. **Beautiful UI**: Dark theme with smooth animations and responsive design
6. **Real-time Performance**: Smooth synchronization even with multiple users

## 🔧 Technical Highlights

- **WebSocket Optimization**: Efficient real-time communication
- **State Management**: Proper React state handling with hooks
- **Error Boundaries**: Graceful error handling
- **Database Design**: Normalized schema with proper relationships
- **Security**: Input validation and safe socket connections
- **Responsive Design**: Works on all screen sizes

## 👨‍💻 Author

**Yuval Arbel**

## 📄 License

This project is licensed under the MIT License.