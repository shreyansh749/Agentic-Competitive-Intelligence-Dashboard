import axios from "axios";


const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL: BASE });

export const reportsAPI = {
  getAll: (competitor, limit) =>
    api.get("/reports", { params: { competitor, limit } }),

  getCompetitors: () => api.get("/competitors"),

  addCompetitor: (data) => api.post("/competitors", data),

  runAgent: (competitorName) =>
    api.post("/run-agent", null, {
      params: competitorName ? { competitor_name: competitorName } : {},
    }),

  getStats: () => api.get("/stats"),
};
