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
from auth import router as auth_router
import time

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
rooms_collection = db["rooms"]

# ==================================================
# FastAPI + Socket.IO Setup
# ==================================================
fastapi_app = FastAPI()
fastapi_app.include_router(auth_router)

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

# Only mount if frontend directory exists
if FRONTEND_DIR.exists():
    fastapi_app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO setup (only once!)
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode="asgi"
)

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
            rooms_collection.insert_one({
                "room": code,
                "created": datetime.utcnow(),
                "content": ""
            })
            return {"room": code}
    raise HTTPException(500, "Could not generate unique room code")

@fastapi_app.get("/validate-room/{room_code}")
def validate_room(room_code: str):
    return {"valid": bool(rooms_collection.find_one({"room": room_code}))}

# ==================================================
# Rate limiting helper
# ==================================================
last_api_call = {"time": 0}
MIN_API_INTERVAL = 4  # 4 seconds between calls

def check_rate_limit():
    now = time.time()
    time_since_last = now - last_api_call["time"]

    if time_since_last < MIN_API_INTERVAL:
        wait_time = MIN_API_INTERVAL - time_since_last
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit: Please wait {wait_time:.1f} seconds before next request"
        )

    last_api_call["time"] = now

# ==================================================
# LLM Endpoint with Better Error Handling
# ==================================================
@fastapi_app.post("/process-code")
def process_code(req: CodeRequest):
    if not genai_api_key:
        raise HTTPException(500, "Gemini API key not configured")

    check_rate_limit()

    # Define prompt BEFORE try/except
    prompt = f"""
You are a code explanation expert. Return ONLY valid JSON with no markdown, no backticks, no extra text.

Structure:
{{
  "code": "the code",
  "what_it_does": "brief explanation",
  "visual_flow": "execution flow",
  "steps": "breakdown of steps",
  "key_idea": "main concept",
  "output": "expected output"
}}

Action: {req.action}

Code:
{req.code}
"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")

        print("🔄 Sending to Gemini (model: gemini-2.0-flash)...")
        response = model.generate_content(prompt)

        if not response or not response.text:
            raise HTTPException(500, "Empty response from API")

        text = response.text.strip()
        cleaned = re.sub(r"```json|```", "", text).strip()

        parsed = json.loads(cleaned)

        history_collection.insert_one({
            "code": req.code,
            "action": req.action,
            "timestamp": datetime.utcnow(),
            "result": parsed
        })

        return {"result": parsed}

    except Exception as e:
        error_msg = str(e)
        print("❌ Error:", error_msg)

        history_collection.insert_one({
            "code": req.code,
            "action": req.action,
            "prompt": prompt,
            "error": error_msg,
            "timestamp": datetime.utcnow()
        })

        raise HTTPException(500, f"Failed: {error_msg}")

# ==================================================
# History
# ==================================================
@fastapi_app.get("/history")
def get_history():
    records = list(history_collection.find({}, {"_id": 0})
                   .sort("timestamp", -1).limit(50))
    return {"history": records}

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
async def leave(sid, data):
    if isinstance(data, dict) and "room" in data:
        await sio.leave_room(sid, data["room"])
        print(f"{sid} left room {data['room']}")

@sio.event
async def comment(sid, data):
    if not isinstance(data, dict):
        return
    room = data.get("room")
    text = data.get("text", "").trim() if hasattr(str, "trim") else data.get("text", "").strip()

    if not room or not text or len(text) > 1000:
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

# Patch helper
def apply_patch(content: str, start: int, removed: int, new_text: str) -> str:
    start = max(0, min(start, len(content)))
    removed = max(0, removed)
    end = min(start + removed, len(content))
    return content[:start] + new_text + content[end:]

# ==================================================
# COLLABORATIVE EDITING
# ==================================================
@sio.event
async def join(sid, data):
    print(f"🚪 JOIN: {sid} → {data.get('room')}")

    if not isinstance(data, dict) or "room" not in data:
        await sio.emit("join_error", {"msg": "invalid join payload"}, room=sid)
        return

    room = data["room"]
    doc = rooms_collection.find_one({"room": room})

    if not doc:
        await sio.emit("join_error", {"msg": "room does not exist"}, room=sid)
        return

    await sio.enter_room(sid, room)
    print(f"✅ {sid} entered room '{room}'")

    # Send comment history
    comments = list(comments_collection.find(
        {"room": room},
        {"_id": 0}
    ).sort("timestamp", 1))
    await sio.emit("room_history", comments, room=sid)

    # Send document content
    canonical_text = doc.get("content", "")
    await sio.emit("editor_full", {"content": canonical_text}, room=sid)
    print(f"📨 Sent content to {sid} ({len(canonical_text)} chars)")

@sio.event
async def editor_broadcast(sid, data):
    print(f"📡 EDIT from {sid}")

    room = data.get("room")
    if not room:
        return

    try:
        start = int(data.get("start", 0))
        removedLength = int(data.get("removedLength", 0))
    except:
        print("❌ Invalid patch data")
        return

    text = data.get("text", "")

    room_doc = rooms_collection.find_one({"room": room})
    if not room_doc:
        return

    content = room_doc.get("content", "")
    new_content = apply_patch(content, start, removedLength, text)

    rooms_collection.update_one({"room": room}, {"$set": {"content": new_content}})

    patch = {
        "start": start,
        "removedLength": removedLength,
        "text": text
    }

    await sio.emit("editor_update", patch, room=room, skip_sid=sid)
    print(f"✅ Broadcast to room '{room}'")

# ==================================================
# WRAP BOTH APPS TOGETHER
# ==================================================
app = socketio.ASGIApp(sio, fastapi_app)
