from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

db = client["codeshare"]  # database
history_collection = db["version_history"]  # collection

def save_version(code: str, explanation: str):
    """Save each code/explanation pair to MongoDB"""
    history = {
        "code": code,
        "explanation": explanation,
        "timestamp": datetime.utcnow()
    }
    history_collection.insert_one(history)
    return True

def get_all_versions():
    """Fetch all saved code versions"""
    versions = list(history_collection.find({}, {"_id": 0}))
    return versions
