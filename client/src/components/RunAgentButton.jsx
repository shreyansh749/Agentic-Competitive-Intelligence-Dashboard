import { useState } from "react";
import { reportsAPI } from "../services/api";
import { Play, Loader, RefreshCw } from "lucide-react";

// Per-company small button
export function RunCompanyButton({ competitorName, onDone, onClick }) {
  const [running, setRunning] = useState(false);

  const handle = async () => {
    try {
      setRunning(true);
      // onClick prop hai toh woh call karo (Dashboard ka handleRunCompany)
      if (onClick) {
        await onClick(); // ← handleRunCompany(name) chalega
      } else {
        await reportsAPI.runAgent(competitorName);
        onDone?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={running}
      title={`Run agent for ${competitorName}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: running ? "#f3f4f6" : "#eff6ff",
        color: running ? "#9ca3af" : "#1a56db",
        border: `1px solid ${running ? "#e5e7eb" : "#bfdbfe"}`,
        borderRadius: 6,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 500,
        cursor: running ? "not-allowed" : "pointer",
      }}
    >
      {running ? (
        <>
          <Loader size={11} className="spin" /> Running...
        </>
      ) : (
        <>
          <Play size={11} /> Run
        </>
      )}
    </button>
  );
}

// Global run all button
export function RunAllButton({ onDone }) {
  const [running, setRunning] = useState(false);

  const handle = async () => {
    try {
      setRunning(true);
      await reportsAPI.runAgent(null);
      setTimeout(() => {
        setRunning(false);
        onDone?.();
      }, 60000);
    } catch {
      setRunning(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={running}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: running ? "#9ca3af" : "#1a56db",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: 500,
        cursor: running ? "not-allowed" : "pointer",
      }}
    >
      {running ? (
        <>
          <Loader size={14} className="spin" /> Running All...
        </>
      ) : (
        <>
          <RefreshCw size={14} /> Run All
        </>
      )}
    </button>
  );
}

// Default export for backward compat
export default RunAllButton;
