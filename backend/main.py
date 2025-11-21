# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import re
import json
import random
import string
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import socketio
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# ==================================================
# Load environment variables
# ==================================================
load_dotenv()
genai_api_key = os.getenv("GEMINI_API_KEY")
if genai_api_key:
    genai.configure(api_key=genai_api_key)
else:
    print("⚠️ GEMINI_API_KEY is not set in .env")

# ==================================================
# MongoDB Setup
# ==================================================
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URL)
db = client["code_explainer"]

history_collection = db["history"]
comments_collection = db["comments"]
rooms_collection = db["rooms"]     # Stores room code + canonical doc content

# ==================================================
# FastAPI + Socket.IO Setup
# ==================================================
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
fastapi_app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

fastapi_app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = socketio.ASGIApp(sio, fastapi_app)

# ==================================================
# Request Models
# ==================================================
class CodeRequest(BaseModel):
    code: str
    action: str

# ==================================================
# Utility: Generate a room code
# ==================================================
def generate_room_code(length=6) -> str:
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))

# ==================================================
# Room Management
# ==================================================
@fastapi_app.post("/create-room")
def create_room():
    for _ in range(20):
        code = generate_room_code()
        if not rooms_collection.find_one({"room": code}):
            rooms_collection.insert_one({"room": code, "created": datetime.utcnow(), "content": ""})
            return {"room": code}
    raise HTTPException(500, "Could not generate unique room code")

@fastapi_app.get("/validate-room/{room_code}")
def validate_room(room_code: str):
    return {"valid": bool(rooms_collection.find_one({"room": room_code}))}

# ==================================================
# LLM Endpoint (optional)
# ==================================================
@fastapi_app.post("/process-code")
def process_code(req: CodeRequest):
    if not genai_api_key:
        raise HTTPException(500, "Gemini API key not configured")

    model = genai.GenerativeModel("models/gemini-2.5-flash")

    prompt = f"""
Return only valid JSON like this:

{{
 "code": "...",
 "what_it_does": "...",
 "visual_flow": "...",
 "steps": "...",
 "key_idea": "...",
 "output": "..."
}}

User wants to {req.action} this code:

{req.code}
"""

    response = model.generate_content(prompt)
    text = response.text.strip()
    cleaned = re.sub(r"```json|```", "", text).strip()

    try:
        parsed = json.loads(cleaned)
    except Exception:
        history_collection.insert_one({
            "code": req.code,
            "action": req.action,
            "raw_response": response.text,
            "timestamp": datetime.utcnow()
        })
        return {"error": "Model did not return valid JSON", "raw": response.text}

    history_collection.insert_one({
        "code": req.code,
        "action": req.action,
        "timestamp": datetime.utcnow(),
        "result": parsed
    })

    return {"result": parsed}

@fastapi_app.get("/history")
def get_history():
    rec = list(history_collection.find({}, {"_id": 0}))
    return {"history": rec}

# ==================================================
# SOCKET.IO EVENTS
# ==================================================
@sio.event
async def connect(sid, environ):
    print(f"🔌 Client connected {sid}")

@sio.event
async def disconnect(sid):
    print(f"❌ Client disconnected {sid}")

@sio.event
async def join(sid, data):
    print("JOIN EVENT:", data)
    if not isinstance(data, dict) or "room" not in data:
        await sio.emit("join_error", {"msg": "invalid join payload"}, room=sid)
        return

    room = data["room"]
    doc = rooms_collection.find_one({"room": room})

    if not doc:
        await sio.emit("join_error", {"msg": "room does not exist"}, room=sid)
        return

    sio.enter_room(sid, room)
    print(f"User {sid} joined room {room}")

    # send comments
    comments = list(comments_collection.find({"room": room}, {"_id": 0}).sort("timestamp", 1))
    await sio.emit("room_history", comments, room=sid)

    # send canonical full document
    canonical_text = doc.get("content", "")
    await sio.emit("editor_full", {"content": canonical_text}, room=sid)

@sio.event
async def leave(sid, data):
    if isinstance(data, dict) and "room" in data:
        sio.leave_room(sid, data["room"])
        print(f"{sid} left room {data['room']}")

@sio.event
async def comment(sid, data):
    if not isinstance(data, dict):
        return
    room = data.get("room")
    text = data.get("text")
    if not room or not text:
        return
    if not rooms_collection.find_one({"room": room}):
        return
    comment_doc = {
        "room": room,
        "author": data.get("author", "User"),
        "text": text,
        "timestamp": datetime.utcnow()
    }
    comments_collection.insert_one(comment_doc)
    await sio.emit("new_comment", comment_doc, room=room)

# ==================================================
# Apply patch helper
# ==================================================
def apply_patch(content: str, start: int, removed: int, new_text: str) -> str:
    if start < 0: start = 0
    if removed < 0: removed = 0
    if start > len(content):
        start = len(content)
    end = start + removed
    if end > len(content):
        end = len(content)
    return content[:start] + new_text + content[end:]

# ==================================================
# GOOGLE DOCS STYLE PATCH SYNC
# ==================================================
@sio.event
async def editor_broadcast(sid, data):
    print("🔥 PATCH RECEIVED:", data)

    room = data.get("room")
    if not room:
        print("❌ Patch missing room")
        return

    try:
        start = int(data.get("start", 0))
        removedLength = int(data.get("removedLength", 0))
    except Exception:
        print("❌ invalid start/removedLength in patch:", data)
        return

    text = data.get("text", "")

    # Fetch current authoritative content
    room_doc = rooms_collection.find_one({"room": room})
    if not room_doc:
        print("❌ room not found in DB during patch")
        return

    content = room_doc.get("content", "")

    # Apply patch to server's canonical state (use helper to be safe)
    new_content = apply_patch(content, start, removedLength, text)

    # Save updated canonical content
    rooms_collection.update_one({"room": room}, {"$set": {"content": new_content}})

    print("📌 NEW CONTENT IN DB LENGTH:", len(new_content))

    # Broadcast patch to entire room (including others)
    patch = {"start": start, "removedLength": removedLength, "text": text}
    print("📤 Broadcasting patch to room:", room, patch)
    # emit to room (do NOT skip; other clients must receive)
    await sio.emit("editor_update", patch, room=room)
