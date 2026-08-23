import { useState, useMemo } from "react";
import { useReports } from "../hooks/useReports";
import { useCompetitors } from "../hooks/useCompetitors";
import StatsBar from "../components/StatsBar";
import ReportFeed from "../components/ReportFeed";
import ActivityChart from "../components/ActivityChart";
import { RunAllButton, RunCompanyButton } from "../components/RunAgentButton";
import AddCompetitorModal from "../components/AddCompetitorModal";
import AgentStepper from "../components/AgentStepper";
import LogsSidebar from "../components/LogsSidebar";
import FilterBar from "../components/FilterBar";
import {
  Plus,
  Terminal,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import MinimalProgressView from "../components/MinimalProgressView";
import { reportsAPI } from "../services/api";

export default function Dashboard() {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [stepperOpen, setStepperOpen] = useState(false);
  const [stepperComp, setStepperComp] = useState(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [activeRunId, setActiveRunId] = useState(null);
  const [isRunAll, setIsRunAll] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const { reports, loading, refetch } = useReports(selected);
  const { competitors, refetch: refetchComps } = useCompetitors();
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const navigate = useNavigate();

  // Client-side filtering mechanism logic
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        !search ||
        r.competitor?.toLowerCase().includes(search.toLowerCase()) ||
        r.summary?.toLowerCase().includes(search.toLowerCase());
      const matchSource = sourceFilter === "all" || r.source === sourceFilter;
      return matchSearch && matchSource;
    });
  }, [reports, search, sourceFilter]);

  // Handlers
  const handleRunCompany = async (name) => {
    try {
      setIsRunAll(false);
      setStepperComp(name);
      setStepperOpen(true);
      console.log(`[Dashboard] Sending run request for: ${name}`);

      const res = await fetch(
        `http://localhost:5000/api/run-agent?competitor_name=${encodeURIComponent(name)}&userId=${userId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        alert(`🚨 Express Server Error (${res.status}): ${errText}`);
        setStepperOpen(false);
        return;
      }

      const data = await res.json();
      const extractedRunId = data.run_id || (data.data && data.data.run_id);

      if (extractedRunId) {
        setActiveRunId(extractedRunId);
      } else {
        alert(`⚠️ Server responded successfully, but 'run_id' key is missing!`);
        setStepperOpen(false);
      }
    } catch (e) {
      alert(`❌ Connection Failed! Node.js server offline: ${e.message}`);
      setStepperOpen(false);
    }
  };

  const handleRunAll = async () => {
    try {
      setIsRunAll(true);
      setStepperOpen(true);
      setStepperComp(null);
      const res = await fetch(
        `http://localhost:5000/api/run-agent?userId=${userId}`,
        { method: "POST", credentials: "include" },
      );

      if (!res.ok) {
        const errText = await res.text();
        alert(`🚨 Express Global Runner Error (${res.status}): ${errText}`);
        setStepperOpen(false);
        return;
      }

      const data = await res.json();
      const extractedRunId = data.run_id || (data.data && data.data.run_id);

      if (extractedRunId) {
        setActiveRunId(extractedRunId);
      } else {
        alert(`⚠️ Global trigger missing dynamic token matching.`);
        setStepperOpen(false);
      }
    } catch (e) {
      alert(`❌ Connection Failed on Global Run! ${e.message}`);
      setStepperOpen(false);
    }
  };

  const handleClearAllReports = async () => {
    try {
      setClearingAll(true);
      await Promise.all(
        competitors.map((c) => reportsAPI.clearCompanyReports(c.name, userId)),
      );
      setShowClearAllModal(false);
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(at 0% 0%, rgba(243, 244, 246, 1) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(239, 246, 255, 1) 0, transparent 50%), #f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Premium Glass Navbar Layout */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(99,102,241,0.1)",
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 20px rgba(99,102,241,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>🔍</span> Competitive Intelligent Agent
          </span>
        </div>

        {/* Action Controls Menu Control Group */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={() => {
              if (!activeRunId) return; 
              setShowLogs(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: !activeRunId ? "#94a3b8" : "#0f172a",
              color: "#f8fafc",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              cursor: !activeRunId ? "not-allowed" : "pointer", 
              opacity: !activeRunId ? 0.7 : 1,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: activeRunId
                ? "0 4px 12px rgba(15, 23, 42, 0.15)"
                : "none",
              pointerEvents: "auto", 
            }}
            title={
              !activeRunId ? "Run an agent first" : "Open terminal console"
            }
          >
            <Terminal size={13} /> System Logs
          </button>

          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
              transition: "transform 0.15s ease, boxShadow 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(37, 99, 235, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(37, 99, 235, 0.2)";
            }}
          >
            <Plus size={14} color="#fff" strokeWidth={2.5} /> Add Competitor
          </button>

          <RunAllButton onDone={refetch} onClick={handleRunAll} />

          {/* User Profile Avatar Frame */}
          <button
            onClick={() => navigate("/profile")}
            title={user?.name || "View Profile"}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              color: "#fff",
              border: "2px solid #fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 4,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {initials}
          </button>
        </div>
      </div>

      {/* Main Framework Dashboard Grid Content */}
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "36px 40px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <StatsBar />
        </div>
        <div
          style={{
            marginBottom: 32,
            background: "#fff",
            borderRadius: 16,
            padding: "24px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
          }}
        >
          <ActivityChart reports={reports} />
        </div>
        {/* Competitor Control Chips Filter Rack */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setSelected(null)}
              style={{
                padding: "8px 20px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background:
                  selected === null
                    ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
                    : "#fff",
                color: selected === null ? "#fff" : "#475569",
                border: selected === null ? "none" : "1px solid #e2e8f0",
                boxShadow:
                  selected === null
                    ? "0 4px 12px rgba(15, 23, 42, 0.15)"
                    : "0 2px 4px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
              }}
            >
              🎯 All Targets
            </button>

            {competitors.map((c) => (
              <div
                key={c.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background:
                    selected === c.name ? "rgba(37, 99, 235, 0.06)" : "#fff",
                  borderRadius: 99,
                  padding: "3px 4px 3px 4px",
                  border: `1px solid ${selected === c.name ? "#bfdbfe" : "#e2e8f0"}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                  transition: "all 0.2s ease",
                }}
              >
                <button
                  onClick={() =>
                    navigate(`/company/${encodeURIComponent(c.name)}`)
                  }
                  style={{
                    padding: "5px 14px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "transparent",
                    color: "#475569",
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#1d4ed8")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#475569")}
                >
                  {c.name}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 28 }}>
          <FilterBar
            search={search}
            setSearch={setSearch}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
          />
        </div>
        {/* Reports header section mein */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            padding: "0 4px",
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Aggregated Intelligence Feed
            <span
              style={{
                color: "#3b82f6",
                background: "#eff6ff",
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 99,
                border: "1px solid #dbeafe",
              }}
            >
              {filteredReports.length} Items
            </span>
          </h2>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Clear All Reports button */}
            <button
              onClick={() => setShowClearAllModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Trash2 size={12} /> Clear All Reports
            </button>

            {/* Sync Dashboard */}
            <button
              onClick={refetch}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={12} /> Sync Dashboard
            </button>
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.02)",
            overflow: "hidden",
          }}
        >
          <ReportFeed
            reports={filteredReports}
            loading={loading}
            onRunCompany={handleRunCompany}
          />
        </div>
      </div>

      {/* Overlay Portals Layer Hooks */}
      {showModal && (
        <AddCompetitorModal
          onClose={() => setShowModal(false)}
          onAdded={() => {
            refetchComps();
            setShowModal(false);
          }}
        />
      )}

      {stepperOpen && isRunAll && (
        <MinimalProgressView
          competitors={competitors.map((c) => c.name)}
          runId={activeRunId}
          onClose={() => {
            setStepperOpen(false);
            setIsRunAll(false);
          }}
          onDone={() => {
            refetch();
          }}
        />
      )}

      {/* Single competitor → existing AgentStepper */}
      {stepperOpen && !isRunAll && (
        <AgentStepper
          running={stepperOpen}
          competitor={stepperComp}
          runId={activeRunId}
          onClose={() => {
            setStepperOpen(false);
            refetch();
          }}
        />
      )}

      {showLogs && (
        <LogsSidebar
          open={showLogs}
          onClose={() => {
            setShowLogs(false);
            setActiveRunId(null);
          }}
          runId={activeRunId}
        />
      )}

      {showClearAllModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "28px 32px",
              width: 380,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111",
                marginBottom: 8,
              }}
            >
              Clear all reports?
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
              This will permanently delete ALL {filteredReports.length} reports
              across all competitors. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowClearAllModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllReports}
                disabled={clearingAll}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#dc2626",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                {clearingAll ? "Clearing..." : "Yes, delete all"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
