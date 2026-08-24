import asyncio
import time
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import os
import json
import uuid
from datetime import datetime, timezone
from graph.logger_store import active_agent_logs, active_agent_status
from concurrent.futures import ThreadPoolExecutor, as_completed
from utils.cache import cache

run_logs: dict[str, list] = {}
run_status: dict[str, str] = {}

from db.mongo_client import (
    async_get_reports,
    async_get_competitors,
    async_save_competitor
)
from graph.pipeline import run_for_competitor_with_logs

app = FastAPI(title="Competitive Intel Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Timing middleware ─────────────────────────────────────────────
@app.middleware("http")
async def timing_middleware(request, call_next):
    start    = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    print(f"[Timing] {request.method} {request.url.path} — {duration:.1f}ms")
    return response

# ── Startup ────────────────────────────────
@app.on_event("startup")
async def startup():
    from db.mongo_client import create_indexes
    await create_indexes()

# ── Log publisher ─────────────────────────────────────────────────
def publish_log(run_id: str, message: str, level: str = "info"):
    if run_id not in active_agent_logs:
        active_agent_logs[run_id] = []
    active_agent_logs[run_id].append({
        "time":    datetime.now(timezone.utc).isoformat(),
        "message": message,
        "level":   level
    })
    print(f"[{run_id[:8]}] {message}")

# ── Models ────────────────────────────────────────────────────────
class CompetitorIn(BaseModel):
    name:         str
    url:          str
    blog_rss_url: Optional[str] = ""
    category:     Optional[str] = "general"
    user_id:      Optional[str] = None

# ── Health ────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}

# ── Cache Stats ───────────────────────────────────────────────────
@app.get("/cache-stats")
def get_cache_stats():
    return {
        "hits":     cache.hits,
        "misses":   cache.misses,
        "hit_rate": cache.hit_rate,
        "size":     cache.size
    }

#____ Remove competitor_____________________________________________ 
@app.delete("/competitors/{competitor_name}")
async def remove_competitor(competitor_name: str, user_id: str = None):
    try:
        from db.mongo_client import async_db

        # Competitor delete
        await async_db.competitors.delete_one({
            "name":    competitor_name,
            "user_id": user_id
        })

        # delete competitor's reports
        result = await async_db.reports.delete_many({
            "competitor": competitor_name,
            "user_id":    user_id
        })

        # Cache invalidate
        cache.delete_pattern(f"competitors:{user_id}")
        cache.delete_pattern(f"reports:{user_id}")
        cache.delete_pattern(f"stats:{user_id}")

        print(f"[Delete] Removed {competitor_name} + {result.deleted_count} reports")

        return {
            "message": f"Removed {competitor_name} and {result.deleted_count} reports"
        }
    except Exception as e:
        print(f"[Delete Error]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ── GET Reports ───────────────────────────────────────────────────
@app.get("/reports")
async def get_reports(competitor: str = None, limit: int = 50, user_id: str = None):
    cache_key = f"reports:{user_id}:{competitor}:{limit}"

    cached = cache.get(cache_key)
    if cached:
        print(f"[Cache HIT] {cache_key}")
        return cached

    print(f"[Cache MISS] {cache_key}")
    reports = await async_get_reports(competitor, limit, user_id)
    result  = {"reports": reports, "count": len(reports)}
    cache.set(cache_key, result, ttl=300)  # 5 minutes
    return result

# ── GET Competitors ───────────────────────────────────────────────
@app.get("/competitors")
async def get_competitors(user_id: str = None):
    cache_key = f"competitors:{user_id}"

    cached = cache.get(cache_key)
    if cached:
        print(f"[Cache HIT] {cache_key}")
        return cached

    print(f"[Cache MISS] {cache_key}")
    competitors = await async_get_competitors(user_id)
    result      = {"competitors": competitors}
    cache.set(cache_key, result, ttl=600)  # 10 minutes
    return result

# ── POST Competitor ───────────────────────────────────────────────
@app.post("/competitors")
async def add_competitor(comp: CompetitorIn):
    print(f"[Debug] Received competitor data: {comp.dict()}")
    await async_save_competitor(comp.dict())

    # Cache invalidate — new competitor added
    cache.delete_pattern(f"competitors:{comp.user_id}")
    cache.delete_pattern(f"stats:{comp.user_id}")
    print(f"[Cache INVALIDATED] competitors + stats for user {comp.user_id}")

    return {"message": f"{comp.name} registered successfully"}

# ── GET Stats ─────────────────────────────────────────────────────
@app.get("/stats")
async def get_stats(user_id: str = None):
    cache_key = f"stats:{user_id}"

    cached = cache.get(cache_key)
    if cached:
        print(f"[Cache HIT] {cache_key}")
        return cached

    print(f"[Cache MISS] {cache_key}")
    try:
        from db.mongo_client import async_db

        query       = {"user_id": user_id} if user_id else {}
        today_start = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        total_reports     = await async_db.reports.count_documents(query)
        total_competitors = await async_db.competitors.count_documents(query)
        runs_today        = await async_db.reports.count_documents({
            **query,
            "timestamp": {"$gte": today_start}
        })

        pipeline  = [
            {"$match": query},
            {"$group": {"_id": None, "avg_score": {"$avg": "$relevance_score"}}}
        ]
        cursor    = async_db.reports.aggregate(pipeline)
        res       = await cursor.to_list(1)
        avg_score = res[0]["avg_score"] if res else 0

        result = {
            "total_reports":       total_reports,
            "total_competitors":   total_competitors,
            "avg_relevance_score": round(avg_score, 2),
            "runs_today":          runs_today
        }

        cache.set(cache_key, result, ttl=120)  # 2 minutes
        return result

    except Exception as e:
        print(f"[Stats Error]: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ── DELETE Reports ────────────────────────────────────────────────
@app.delete("/reports/{competitor_name}")
async def clear_reports(competitor_name: str, user_id: str = None):
    try:
        from db.mongo_client import async_db
        result = await async_db.reports.delete_many({
            "competitor": competitor_name,
            "user_id":    user_id
        })

        # Cache invalidate — reports + stats are deleted 
        cache.delete_pattern(f"reports:{user_id}")
        cache.delete_pattern(f"stats:{user_id}")
        print(f"[Cache INVALIDATED] reports + stats after delete for {competitor_name}")

        return {"message": f"Deleted {result.deleted_count} reports for {competitor_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── GET Latest Reports ────────────────────────────────────────────
@app.get("/reports/latest")
async def get_latest_reports(user_id: str = None):
    cache_key = f"reports_latest:{user_id}"

    cached = cache.get(cache_key)
    if cached:
        print(f"[Cache HIT] {cache_key}")
        return cached

    print(f"[Cache MISS] {cache_key}")
    try:
        from db.mongo_client import async_db
        pipeline = [
            {"$match": {"user_id": user_id} if user_id else {}},
            {"$sort":  {"timestamp": -1}},
            {"$group": {"_id": "$competitor", "doc": {"$first": "$$ROOT"}}},
            {"$replaceRoot": {"newRoot": "$doc"}},
            {"$project": {"_id": 0}}
        ]
        cursor  = async_db.reports.aggregate(pipeline)
        reports = await cursor.to_list(length=100)
        result  = {"reports": reports, "count": len(reports)}

        cache.set(cache_key, result, ttl=300)  # 5 minutes
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── POST Run Agent ────────────────────────────────────────────────
@app.post("/run-agent")
async def run_agent(
    background_tasks: BackgroundTasks,
    competitor_name: str = None,
    user_id: str = None
):
    from db.mongo_client import get_all_competitors, sync_db

    if competitor_name:
        comp = sync_db.competitors.find_one(
            {"name": competitor_name, "user_id": user_id}, {"_id": 0}
        )
        if not comp:
            raise HTTPException(status_code=404, detail="Competitor not found")
        competitors = [comp]
    else:
        competitors = list(get_all_competitors(user_id))

    if not competitors:
        raise HTTPException(status_code=400, detail="No competitors registered")

    run_id = str(uuid.uuid4())
    active_agent_logs[run_id]   = []
    active_agent_status[run_id] = "running"

    is_single = len(competitors) == 1

    publish_log(run_id, f"[System] {'Single' if is_single else 'Parallel'} run starting for {len(competitors)} competitor(s)...", "info")

    def run_single(c):
        c_name = c.get("name", "Unknown")
        try:
            publish_log(run_id, f"[Scheduler] Dispatching: {c_name}", "info")
            run_for_competitor_with_logs(c, run_id)
            publish_log(run_id, f"[Scheduler] ✅ Completed: {c_name}", "success")
            return {"name": c_name, "status": "success"}
        except Exception as e:
            publish_log(run_id, f"[Scheduler] ❌ ERROR for {c_name}: {str(e)}", "error")
            return {"name": c_name, "status": "error"}

    def run_bg():
        try:
            valid = [c for c in competitors if c and "name" in c]

            if is_single:
                result = run_single(valid[0])
                if result["status"] == "success":
                    publish_log(run_id, f"[Scheduler] Pipeline complete for {valid[0]['name']}", "info")
            else:
                publish_log(run_id, f"[Scheduler] Running {len(valid)} competitors in parallel (max 3 at a time)...", "info")
                with ThreadPoolExecutor(max_workers=3) as executor:
                    futures = {
                        executor.submit(run_single, c): c.get("name", "Unknown")
                        for c in valid
                    }
                    success_count = error_count = 0
                    for future in as_completed(futures):
                        result = future.result()
                        if result["status"] == "success": success_count += 1
                        else:                             error_count   += 1

                publish_log(
                    run_id,
                    f"[Scheduler] All done — ✅ {success_count} success, ❌ {error_count} failed",
                    "info" if error_count == 0 else "warn"
                )

            # ── Cache invalidate after run ────────────────────
            cache.delete_pattern(f"reports:{user_id}")
            cache.delete_pattern(f"reports_latest:{user_id}")
            cache.delete_pattern(f"stats:{user_id}")
            print(f"[Cache INVALIDATED] reports + stats for user {user_id} after run")

            active_agent_status[run_id] = "done"

        except Exception as global_error:
            publish_log(run_id, f"FATAL ERROR: {str(global_error)}", "error")
            active_agent_status[run_id] = "error"

    background_tasks.add_task(run_bg)

    return {
        "run_id":      run_id,
        "message":     f"{'Single' if is_single else 'Parallel'} agent run started for {len(competitors)} competitor(s)",
        "competitors": [c.get("name", "Unknown") for c in competitors]
    }

# SSE Logs 
@app.get("/logs/{run_id}")
async def stream_logs(run_id: str):
    async def event_generator():
        sent_index = 0
        from graph.logger_store import active_agent_logs, active_agent_status

        for _ in range(240):
            logs = active_agent_logs.get(run_id, [])

            while sent_index < len(logs):
                entry = logs[sent_index]
                yield f"data: {json.dumps(entry)}\n\n"
                sent_index += 1

            status = active_agent_status.get(run_id, "running")
            if status in ("done", "error"):
                yield f"data: {json.dumps({'message': f'__STATUS__{status}', 'level': status, 'time': datetime.now(timezone.utc).isoformat()})}\n\n"
                break

            await asyncio.sleep(0.5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":               "no-cache",
            "Connection":                  "keep-alive",
            "X-Accel-Buffering":           "no",
            "Access-Control-Allow-Origin": "*",
        }
    )