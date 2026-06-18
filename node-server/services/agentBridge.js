const axios = require("axios");
const PYTHON = process.env.PYTHON_AGENT_URL || "http://localhost:8000";

const agentBridge = {
  getReports: async (competitor = null, limit = 50, userId) => {
    try {
      const params = { limit };
      if (competitor) params.competitor = competitor;
      if (userId) params.user_id = userId;
      const res = await axios.get(`${PYTHON}/reports`, { params });
      return res.data;
    } catch (error) {
      console.error(`[AgentBridge Error - getReports]: ${error.message}`);
      throw error;
    }
  },

  getCompetitors: async (userId) => {
    try {
      const params = {};
      if (userId) params.user_id = userId;
      const res = await axios.get(`${PYTHON}/competitors`, { params });
      return res.data;
    } catch (error) {
      console.error(`[AgentBridge Error - getCompetitors]: ${error.message}`);
      throw error;
    }
  },

  addCompetitor: async (data) => {
    try {
      console.log("[AgentBridge] Adding competitor:", data);
      const res = await axios.post(`${PYTHON}/competitors`, data);
      return res.data;
    } catch (error) {
      console.error(`[AgentBridge Error - addCompetitor]: ${error.message}`);
      throw error;
    }
  },

  runAgent: async (competitorName = null, userId) => {
    try {
      const params = {};
      if (competitorName) params.competitor_name = competitorName;
      if (userId) params.user_id = userId;
      const res = await axios.post(`${PYTHON}/run-agent`, null, { params });
      return res.data;
    } catch (error) {
      console.error(`[AgentBridge Error - runAgent]: ${error.message}`);
      throw error;
    }
  },

  getStats: async (userId) => {
    try {
      const params = {};
      if (userId) params.user_id = userId;
      const res = await axios.get(`${PYTHON}/stats`, { params });
      return res.data;
    } catch (error) {
      console.error(`[AgentBridge Error - getStats]: ${error.message}`);
      throw error;
    }
  },
};

module.exports = agentBridge;
