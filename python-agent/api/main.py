from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio
from db.mongo_client import (
    async_get_reports,
    async_get_competitors,
    async_save_competitor
)
from graph.pipeline import run_for_competitor

app = FastAPI(title="Competitive Intel Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ───────────────────────────────────────────────────────
class CompetitorIn(BaseModel):
    name:         str
    url:          str
    blog_rss_url: Optional[str] = ""
    category:     Optional[str] = "general"

# ── Endpoints ────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/reports")
async def get_reports(competitor: str = None, limit: int = 50):
    """Reports fetch karo — optionally filtered"""
    reports = await async_get_reports(competitor, limit)
    return {"reports": reports, "count": len(reports)}

@app.get("/competitors")
async def get_competitors():
    """Registered competitors list"""
    competitors = await async_get_competitors()
    return {"competitors": competitors}

@app.post("/competitors")
async def add_competitor(comp: CompetitorIn):
    """Naya competitor register karo"""
    await async_save_competitor(comp.dict())
    return {"message": f"{comp.name} registered successfully"}

@app.post("/run-agent")
async def run_agent(background_tasks: BackgroundTasks, competitor_name: str = None):
    """
    Agent manually trigger karo.
    competitor_name diya toh sirf usi ke liye,
    nahi diya toh sabke liye.
    """
    from db.mongo_client import get_all_competitors, sync_db

    if competitor_name:
        comp = sync_db.competitors.find_one(
            {"name": competitor_name}, {"_id": 0}
        )
        if not comp:
            raise HTTPException(status_code=404, detail="Competitor not found")
        competitors = [comp]
    else:
        competitors = get_all_competitors()

    if not competitors:
        raise HTTPException(status_code=400, detail="No competitors registered")

    # Background mein run karo taaki API immediately respond kare
    def run_bg():
        for c in competitors:
            try:
                run_for_competitor(c)
            except Exception as e:
                print(f"Error running agent for {c['name']}: {e}")

    background_tasks.add_task(run_bg)
    return {
        "message": f"Agent started for {len(competitors)} competitor(s)",
        "competitors": [c["name"] for c in competitors]
    }

@app.get("/stats")
async def get_stats():
    """Dashboard ke liye summary stats"""
    from db.mongo_client import async_db
    total_reports     = await async_db.reports.count_documents({})
    total_competitors = await async_db.competitors.count_documents({})

    # Average relevance score
    pipeline = [{"$group": {"_id": None, "avg_score": {"$avg": "$relevance_score"}}}]
    cursor = async_db.reports.aggregate(pipeline)
    result = await cursor.to_list(1)
    avg_score = result[0]["avg_score"] if result else 0

    return {
        "total_reports":     total_reports,
        "total_competitors": total_competitors,
        "avg_relevance_score": round(avg_score, 2)
    }