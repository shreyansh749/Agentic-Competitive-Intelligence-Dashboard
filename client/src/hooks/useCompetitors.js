import { useState, useEffect, useCallback } from "react";
import { reportsAPI } from "../services/api";

export function useCompetitors() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await reportsAPI.getCompetitors();
      setCompetitors(res.data.competitors);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);
  return { competitors, loading, refetch: fetch };
}
