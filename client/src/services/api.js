import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

export const reportsAPI = {
  getAll: (competitor, limit, userId) =>
    api.get("/reports", { params: { competitor, limit, userId } }),

  getCompetitors: (userId) => api.get("/competitors", { params: { userId } }),

  addCompetitor: (data, userId) =>
    api.post(`/competitors?userId=${userId}`, data),

  runAgent: (competitorName, userId) =>
    api.post("/run-agent", null, {
      params: competitorName
        ? { competitor_name: competitorName, userId }
        : { userId },
    }),

  getStats: (userId) => api.get("/stats", { params: { userId } }),
};
