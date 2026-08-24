from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")

sync_client = MongoClient(MONGO_URI)
sync_db     = sync_client["competitive_intel"]

async_client = AsyncIOMotorClient(MONGO_URI)
async_db     = async_client["competitive_intel"]


# ── Sync functions ────────────────────────────────────────────────

def save_report(data: dict):
    sync_db.reports.insert_one(data)


def get_last_report(competitor: str, user_id: str) -> str:
    doc = sync_db.reports.find_one(
        {"competitor": competitor, "user_id": user_id},
        sort=[("timestamp", -1)]
    )
    if doc:
        return doc.get("analysis", "No previous data available.")
    return "No previous data available."


def get_all_competitors(user_id: str) -> list:
    return list(sync_db.competitors.find({"user_id": user_id}, {"_id": 0}))


def upsert_competitor(data: dict):
    sync_db.competitors.update_one(
        {"name": data["name"], "user_id": data["user_id"]},
        {"$set": data},
        upsert=True
    )


# ── Async functions ───────────────────────────────────────────────

async def create_indexes():
    await async_db.reports.create_index([("user_id", 1), ("timestamp", -1)])
    await async_db.reports.create_index([("competitor", 1), ("user_id", 1)])
    await async_db.competitors.create_index([("user_id", 1)])
    print("[MongoDB] Indexes created")


async def async_save_report(data: dict):
    # Normalize both competitor field variants for consistency
    if "competitor_name" in data and "competitor" not in data:
        data["competitor"] = data["competitor_name"]
    elif "competitor" in data and "competitor_name" not in data:
        data["competitor_name"] = data["competitor"]
    await async_db.reports.insert_one(data)


async def async_get_reports(competitor: str = None, limit: int = 50, user_id: str = None):
    query = {}
    if competitor:
        # Case-insensitive match against both field variants
        regex_query = {"$regex": f"^{competitor}$", "$options": "i"}
        query = {
            "$or": [
                {"competitor":      regex_query},
                {"competitor_name": regex_query}
            ]
        }
    if user_id:
        query["user_id"] = user_id

    cursor = async_db.reports.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit)
    return await cursor.to_list(length=limit)


async def async_get_competitors(user_id: str = None):
    query = {"user_id": user_id} if user_id else {}
    cursor = async_db.competitors.find(query, {"_id": 0})
    return await cursor.to_list(length=100)


async def async_save_competitor(data: dict):
    await async_db.competitors.update_one(
        {"name": data["name"], "user_id": data["user_id"]},
        {"$set": data},
        upsert=True
    )