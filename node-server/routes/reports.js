const router = require("express").Router();
const bridge = require("../services/agentBridge");

router.get("/reports", async (req, res) => {
  const { competitor, limit } = req.query;
  const data = await bridge.getReports(competitor, limit);
  res.json(data);
});

router.get("/competitors", async (req, res) => {
  res.json(await bridge.getCompetitors());
});

router.post("/competitors", async (req, res) => {
  res.json(await bridge.addCompetitor(req.body));
});

router.post("/run-agent", async (req, res) => {
  const { competitor_name } = req.query;
  res.json(await bridge.runAgent(competitor_name));
});

router.get("/stats", async (req, res) => {
  res.json(await bridge.getStats());
});

module.exports = router;
