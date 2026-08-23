import { useState, useEffect, useCallback } from "react";
import { reportsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useReports(competitor = null) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); 
  const userId = user?.id || user?._id; 

  const fetch = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await reportsAPI.getAll(competitor, 100,userId); 
      setReports(res.data.reports);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [competitor, userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  return { reports, loading, error, refetch: fetch };
}
