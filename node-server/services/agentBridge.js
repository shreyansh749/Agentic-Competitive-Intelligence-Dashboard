const axios = require("axios");

const PYTHON_URL = process.env.PYTHON_AGENT_URL || "http://localhost:8000";

const agentBridge = {
  getReports: async (competitor = null, limit = 50) => {
    const params = { limit };
    if (competitor) params.competitor = competitor;
    const res = await axios.get(`${PYTHON_URL}/reports`, { params });
    return res.data;
  },

  getCompetitors: async () => {
    const res = await axios.get(`${PYTHON_URL}/competitors`);
    return res.data;
  },

  addCompetitor: async (data) => {
    const res = await axios.post(`${PYTHON_URL}/competitors`, data);
    return res.data;
  },

  runAgent: async (competitorName = null) => {
    const params = competitorName ? { competitor_name: competitorName } : {};
    const res = await axios.post(`${PYTHON_URL}/run-agent`, null, { params });
    return res.data;
  },

  getStats: async () => {
    const res = await axios.get(`${PYTHON_URL}/stats`);
    return res.data;
  },
};

module.exports = agentBridge;
