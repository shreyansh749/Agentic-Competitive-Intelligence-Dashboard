import { useState, useEffect, useCallback } from "react";
import { reportsAPI } from "../services/api";

export function useReports(competitor = null) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportsAPI.getAll(competitor, 100);
      setReports(res.data.reports);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [competitor]);

  useEffect(() => {
    fetch();
  }, [fetch]);
  return { reports, loading, error, refetch: fetch };
}
