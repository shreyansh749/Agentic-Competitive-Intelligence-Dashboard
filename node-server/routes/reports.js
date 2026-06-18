const router = require("express").Router();
const bridge = require("../services/agentBridge");

// ── GET Reports ───────────────────────────────────────────────
router.get("/reports", async (req, res) => {
  try {
    const { competitor, limit, userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const data = await bridge.getReports(competitor, limit, userId);
    res.json(data);
  } catch (e) {
    console.error("[GET /reports]:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── GET Competitors ───────────────────────────────────────────
router.get("/competitors", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const data = await bridge.getCompetitors(userId);
    res.json(data);
  } catch (e) {
    console.error("[GET /competitors]:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── POST Competitor ───────────────────────────────────────────
router.post("/competitors", async (req, res) => {
  try {
    const { userId } = req.query;
    //console.log("[Route] userId from query:", userId); // debug
    console.log("[Route] body:", req.body);  
    if (!userId) return res.status(400).json({ error: "userId required" });

    console.log("[Route] data ", { ...req.body, user_id:userId }); // debug
    const data = await bridge.addCompetitor({ ...req.body, user_id:userId });
    res.json(data);
  } catch (e) {
    console.error("[POST /competitors]:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── POST Run Agent ────────────────────────────────────────────
router.post("/run-agent", async (req, res) => {
  try {
    const { competitor_name, userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });
    const data = await bridge.runAgent(competitor_name,userId);
    res.json(data);
  } catch (e) {
    console.error("[POST /run-agent]:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── GET Stats ─────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const { userId } = req.query;
    const data = await bridge.getStats(userId);
    res.json(data);
  } catch (e) {
    console.error("[GET /stats]:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── SSE Logs ──────────────────────────────────────────────────
router.get("/logs/:runId", (req, res) => {
  const { runId } = req.params;
  const PYTHON = process.env.PYTHON_AGENT_URL || "http://localhost:8000";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");

  const axios = require("axios");
  axios({
    method: "get",
    url: `${PYTHON}/logs/${runId}`,
    responseType: "stream",
    timeout: 0,
  })
    .then((response) => {
      response.data.pipe(res);
      req.on("close", () => {
        if (!response.data.destroyed) response.data.destroy();
      });
    })
    .catch(() => res.end());
});

module.exports = router;
