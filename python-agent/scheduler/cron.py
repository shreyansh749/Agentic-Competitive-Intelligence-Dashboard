from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from db.mongo_client import get_all_competitors
from graph.pipeline import run_for_competitor
from datetime import datetime, timezone
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BlockingScheduler()

def run_all_agents():
    """Saare registered competitors ke liye agent run karo"""
    logger.info(f"[Scheduler] Starting run at {datetime.now(timezone.utc)}")

    competitors = get_all_competitors()
    if not competitors:
        logger.warning("[Scheduler] No competitors registered!")
        return

    for comp in competitors:
        try:
            logger.info(f"[Scheduler] Running agent for: {comp['name']}")
            run_for_competitor(comp)
            logger.info(f"[Scheduler] Done: {comp['name']}")
        except Exception as e:
            logger.error(f"[Scheduler] Failed for {comp['name']}: {e}")

    logger.info("[Scheduler] All agents complete.")

# Roz subah 8AM IST (2:30 UTC)
scheduler.add_job(
    run_all_agents,
    CronTrigger(hour=2, minute=30),
    id="daily_intel_run",
    name="Daily Competitive Intelligence Run"
)

if __name__ == "__main__":
    logger.info("[Scheduler] Starting... Press Ctrl+C to stop")
    scheduler.start()