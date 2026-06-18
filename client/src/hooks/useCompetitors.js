import { useState, useEffect, useCallback } from "react";
import { reportsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useCompetitors() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // 🔥 Logged-in user nikala
  const userId = user?.id || user?._id; // 🔥 UserId extract ki

  const fetch = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await reportsAPI.getCompetitors(userId); 
      setCompetitors(res.data.competitors);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  return { competitors, loading, refetch: fetch };
}
