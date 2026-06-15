const router = require("express").Router();
const bridge = require("../services/agentBridge");

// ── GET: Fetch Analytics Reports ─────────────────────────────────
router.get("/reports", async (req, res) => {
  try {
    const { competitor, limit } = req.query;
    const data = await bridge.getReports(competitor, limit);
    return res.json(data);
  } catch (error) {
    console.error(`[Express Router Error - GET /reports]: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Failed to retrieve reports from upstream service." });
  }
});

// ── GET: Fetch Registered Competitors ────────────────────────────
router.get("/competitors", async (req, res) => {
  try {
    const data = await bridge.getCompetitors();
    return res.json(data);
  } catch (error) {
    console.error(
      `[Express Router Error - GET /competitors]: ${error.message}`,
    );
    return res
      .status(500)
      .json({ error: "Failed to retrieve competitors list." });
  }
});

// ── POST: Register New Competitor Profile ────────────────────────
router.post("/competitors", async (req, res) => {
  try {
    const data = await bridge.addCompetitor(req.body);
    return res.json(data);
  } catch (error) {
    console.error(
      `[Express Router Error - POST /competitors]: ${error.message}`,
    );
    return res
      .status(500)
      .json({ error: "Schema payload parsing validation failed." });
  }
});

// ── POST: Manually Trigger LangGraph Core Agent ──────────────────
router.post("/run-agent", async (req, res) => {
  try {
    const { competitor_name } = req.query;
    const data = await bridge.runAgent(competitor_name);
    return res.json(data); // Returns valid schema mapping: { run_id, message, competitors }
  } catch (error) {
    console.error(`[Express Router Error - POST /run-agent]: ${error.message}`);
    return res
      .status(500)
      .json({
        error: "Could not initialize execution thread context wrapper.",
      });
  }
});

// ── GET: Dashboard Summary Analytics Cards ──────────────────────
router.get("/stats", async (req, res) => {
  try {
    const data = await bridge.getStats();
    return res.json(data);
  } catch (error) {
    console.error(`[Express Router Error - GET /stats]: ${error.message}`);
    return res
      .status(500)
      .json({ error: "Failed to compile aggregate metrics database cursor." });
  }
});

// ── GET: Real-Time Telemetry Stream Proxy Broker (SSE Pipe) ──────
router.get("/logs/:runId", (req, res) => {
  const { runId } = req.params;
  const PYTHON = process.env.PYTHON_AGENT_URL || "http://localhost:8000";

  // Standard Server-Sent Events headers registration
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Direct stream processing verification
  res.setHeader("Access-Control-Allow-Origin", "*");

  const axios = require("axios");
  const url = `${PYTHON}/logs/${runId}`;

  console.log(`[Express Proxy] Tapping into Python SSE: ${url}`);

  // Direct downstream connection pipe setup
  axios({
    method: "get",
    url,
    responseType: "stream",
    timeout: 0, // Prevent gateway server timeouts for continuous pipelines
  })
    .then((response) => {
      // Connect python output pipe stream directly to express connection stream response
      response.data.pipe(res);

      // Cleanup buffer context if user closes front-end drawer window
      req.on("close", () => {
        console.log(
          `[Express Proxy] Client disconnected from session: ${runId}`,
        );
        if (!response.data.destroyed) {
          response.data.destroy();
        }
      });
    })
    .catch((err) => {
      console.error(
        `[SSE Streaming Proxy Failure - runId: ${runId}]: ${err.message}`,
      );
      res.end();
    });
});

module.exports = router;
