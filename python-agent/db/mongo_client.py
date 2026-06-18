from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")

# Sync client (scheduler ke liye)
sync_client = MongoClient(MONGO_URI)
sync_db = sync_client["competitive_intel"]

# Async client (FastAPI ke liye)
async_client = AsyncIOMotorClient(MONGO_URI)
async_db = async_client["competitive_intel"]

# ── Sync functions (scheduler use karega) ──────────────────────

def save_report(data: dict):
    """Ek competitor ka report save karo"""
    sync_db.reports.insert_one(data)

def get_last_report(competitor: str, user_id: str) -> str:
    """Last saved report nikalo comparison ke liye"""
    doc = sync_db.reports.find_one(
        {"competitor": competitor, "user_id": user_id},
        sort=[("timestamp", -1)]
    )
    if doc:
        return doc.get("analysis", "No previous data available.")
    return "No previous data available."

def get_all_competitors(user_id: str) -> list:
    """Saare registered competitors nikalo"""
    return list(sync_db.competitors.find({"user_id": user_id}, {"_id": 0}))

def upsert_competitor(data: dict):
    """Competitor add ya update karo"""
    sync_db.competitors.update_one(
        {"name": data["name"], "user_id": data["user_id"]},
        {"$set": data},
        upsert=True
    )

# ── Async functions (FastAPI use karega) ───────────────────────

async def async_save_report(data: dict):
    """Ek competitor ka report save karo async mein"""
    # Dono keys ka jhanjhat khatam karne ke liye hum dono set kar dete hain
    if "competitor_name" in data and "competitor" not in data:
        data["competitor"] = data["competitor_name"]
    elif "competitor" in data and "competitor_name" not in data:
        data["competitor_name"] = data["competitor"]
        
    await async_db.reports.insert_one(data)
    
async def async_get_reports(competitor: str = None, limit: int = 50, user_id: str = None):
    """Reports fetch karo — filtered by competitor or competitor_name"""
    query = {}
    if competitor:
        # Case-insensitive search ke liye regex
        regex_query = {"$regex": f"^{competitor}$", "$options": "i"}
        # Agar db mein competitor_name se save hua ho ya competitor se, dono utha lega
        query = {
            "$or": [
                {"competitor": regex_query},
                {"competitor_name": regex_query}
            ]
        }
        
    if user_id:
        query["user_id"] = user_id

    cursor = async_db.reports.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)
    return await cursor.to_list(length=limit)

async def async_get_competitors(user_id: str = None):
    """Saare competitors async mein nikalo"""
    query = {}
    if user_id:
        query["user_id"] = user_id
    cursor = async_db.competitors.find(query, {"_id": 0})
    return await cursor.to_list(length=100)

async def async_save_competitor(data: dict):
    await async_db.competitors.update_one(
        {"name": data["name"], "user_id": data["user_id"]},
        {"$set": data},
        upsert=True
    )