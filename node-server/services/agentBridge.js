const axios = require("axios");

const PYTHON_URL = process.env.PYTHON_AGENT_URL || "http://localhost:8000";

const agentBridge = {
  // ── GET: Fetch Analytics Reports ─────────────────────────────────
  getReports: async (competitor = null, limit = 50) => {
    try {
      const params = { limit };
      if (competitor) params.competitor = competitor;

      const res = await axios.get(`${PYTHON_URL}/reports`, { params });
      return res.data;
    } catch (error) {
      console.error(`[AgentBridge Error - getReports]: ${error.message}`);
      throw error; // Let Express controller handle the HTTP status conversion
    }
  },

  // ── GET: Fetch Active Competitors Profiles ───────────────────────
  getCompetitors: async () => {
    try {
      const res = await axios.get(`${PYTHON_URL}/competitors`);
      return res.data;
    } catch (error) {
      console.error(`[AgentBridge Error - getCompetitors]: ${error.message}`);
      throw error;
    }
  },

  // ── POST: Register New Target Competitor ─────────────────────────
  addCompetitor: async (data) => {
    try {
      const res = await axios.post(`${PYTHON_URL}/competitors`, data);
      return res.data;
    } catch (error) {
      console.error(`[AgentBridge Error - addCompetitor]: ${error.message}`);
      throw error;
    }
  },

  // ── POST: Safely Trigger LangGraph Execution Workflow ──────────
  runAgent: async (competitorName = null) => {
    try {
      // Configuration structure inject parameters clearly for FastAPI Query injection
      const config = {
        params: competitorName ? { competitor_name: competitorName } : {},
      };

      // POST format pattern: axios.post(url, data, config)
      const res = await axios.post(`${PYTHON_URL}/run-agent`, null, config);
      return res.data; // Securely returns layout: { run_id, message, competitors }
    } catch (error) {
      console.error(`[AgentBridge Error - runAgent]: ${error.message}`);
      throw error;
    }
  },

  // ── GET: Compile Summary Metadata Analytics ──────────────────────
  getStats: async () => {
    try {
      const res = await axios.get(`${PYTHON_URL}/stats`);
      return res.data;
    } catch (error) {
      console.error(`[AgentBridge Error - getStats]: ${error.message}`);
      throw error;
    }
  },
};

module.exports = agentBridge;
