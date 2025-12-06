# 🚀 Code Explainer - AI-Powered Collaborative Code Editor

> A real-time collaborative code editing platform with AI-powered code explanations using Google Gemini AI, built with FastAPI and Socket.IO.


## ✨ Features

### Core Features
- 🤖 **AI-Powered Code Explanation** - Get instant, detailed explanations of any code snippet using Google Gemini AI
- 👥 **Real-Time Collaboration** - Multiple users can edit code simultaneously with Google Docs-style sync
- 💬 **Live Comments** - Discuss code with team members in real-time
- 🔐 **Secure Authentication** - Email/Password and Google OAuth 2.0 support
- 📝 **History Tracking** - Keep track of all code explanations and edits
- 🚪 **Room-Based Collaboration** - Create private rooms with unique codes for team collaboration

### Technical Features
- ⚡ **WebSocket Communication** - Real-time updates using Socket.IO
- 🔒 **JWT Authentication** - Secure token-based auth system
- 📊 **MongoDB Integration** - Robust data persistence
- 🛡️ **Rate Limiting** - Built-in protection against API abuse
- 📱 **CORS Enabled** - Ready for frontend integration
- 🎯 **RESTful API** - Clean, documented API endpoints

---

## 🎬 Demo

### Code Explanation Flow
```
User → Submit Code → Gemini AI Analysis → Detailed Breakdown
                                         ↓
                   ┌────────────────────────────────────┐
                   │ • What it does                     │
                   │ • Visual flow                      │
                   │ • Step-by-step breakdown          │
                   │ • Key concepts                     │
                   │ • Expected output                  │
                   └────────────────────────────────────┘
```

### Real-Time Collaboration
```
User A types → Server receives → Broadcasts to room → User B sees changes
                                                    → User C sees changes
```

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Socket.IO** - Real-time bidirectional event-based communication
- **MongoDB** - NoSQL database for flexible data storage
- **PyMongo** - Python driver for MongoDB

### AI & ML
- **Google Gemini AI** (gemini-2.0-flash) - Advanced language model for code analysis

### Authentication & Security
- **bcrypt** - Password hashing
- **PyJWT** - JSON Web Token implementation
- **Google OAuth 2.0** - Third-party authentication

### Other Tools
- **Pydantic** - Data validation using Python type annotations
- **python-dotenv** - Environment variable management
- **Uvicorn** - ASGI server implementation

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **MongoDB** (Local or Atlas) ([Download](https://www.mongodb.com/try/download/community))
- **pip** (Python package manager - comes with Python)
- **Git** (optional, for cloning)

### Required API Keys
- **Google Gemini API Key** - Get it free at [Google AI Studio](https://ai.google.dev/)
- **Google OAuth Credentials** (Optional) - For Google login at [Google Cloud Console](https://console.cloud.google.com/)

---

## 🚀 Installation

### Step 1: Clone the Repository (or download files)

```bash
cd your-project-directory
cd backend
```

### Step 2: Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
# Upgrade pip first
pip install --upgrade pip

# Install all requirements
pip install -r requirements.txt
```

### Step 4: Verify Installation

```bash
python test_setup.py
```

This will check:
- ✅ All packages installed
- ✅ Environment variables configured
- ✅ MongoDB connection
- ✅ Gemini API access

---


### Socket.IO Events

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connect` | - | Client connects to server |
| `join` | `{"room": "ABC123"}` | Join a collaboration room |
| `leave` | `{"room": "ABC123"}` | Leave a room |
| `comment` | `{"room": "ABC123", "author": "John", "text": "Great code!"}` | Send comment |
| `editor_broadcast` | `{"room": "ABC123", "start": 0, "removedLength": 2, "text": "new"}` | Send code edit |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `room_history` | `[{comments}]` | Receive room's comment history |
| `editor_full` | `{"content": "code..."}` | Receive full document content |
| `editor_update` | `{"start": 0, "removedLength": 2, "text": "new"}` | Receive code edit from others |
| `new_comment` | `{comment_object}` | Receive new comment |
| `join_error` | `{"msg": "error"}` | Join failed |

---

## 📁 Project Structure

```
backend/
├── main.py                 # Main FastAPI + Socket.IO application
├── auth.py                 # Authentication routes and logic
├── mongodb_info.py         # Database utilities (legacy)
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (create this)
├── test_setup.py           # Setup verification script
└── README.md              # This file

Database Collections:
├── users                   # User accounts
├── rooms                   # Collaboration rooms
├── comments               # Room comments
└── history                # Code explanation history
```

## 📊 API Rate Limits

### Gemini API (Free Tier)

| Metric | Limit |
|--------|-------|
| Requests per minute | 15 |
| Tokens per minute | 1,000,000 |
| Requests per day | 1,500 |

**Built-in Protection:** Server enforces 4-second delay between requests.

### MongoDB Atlas (Free Tier - M0)

| Metric | Limit |
|--------|-------|
| Storage | 512 MB |
| RAM | Shared |
| Connections | 500 |

---

## 📞 Support

- **Documentation:** This README + [FastAPI Docs](https://fastapi.tiangolo.com/)
- **Gemini API:** https://ai.google.dev/docs
- **Issues:** Open an issue on GitHub
- **Email:** sriramsaladi28@gmail.com

---

<div align="center">

**Made with ❤️ using FastAPI, Socket.IO, and Google Gemini AI**

⭐ Star this repo if you found it helpful!

</div>