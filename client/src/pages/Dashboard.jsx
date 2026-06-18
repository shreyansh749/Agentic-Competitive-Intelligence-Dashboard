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
import { Plus, Terminal, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [stepperOpen, setStepperOpen] = useState(false);
  const [stepperComp, setStepperComp] = useState(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentRunId, setCurrentRunId] = useState(null);

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
        setCurrentRunId(extractedRunId);
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
      setStepperComp("All Selected Profiles");
      setStepperOpen(true);

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
        setCurrentRunId(extractedRunId);
      } else {
        alert(`⚠️ Global trigger missing dynamic token matching.`);
        setStepperOpen(false);
      }
    } catch (e) {
      alert(`❌ Connection Failed on Global Run! ${e.message}`);
      setStepperOpen(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        // Gradient ambient glow setup
        background:
          "radial-gradient(at 0% 0%, rgba(243, 244, 246, 1) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(239, 246, 255, 1) 0, transparent 50%), #f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Premium Glass Navbar Layout */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          padding: "14px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.02)",
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
            <span>🔍</span> Competitive Intel Matrix
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#3b82f6",
              background: "#eff6ff",
              padding: "3px 8px",
              borderRadius: "6px",
              letterSpacing: "0.3px",
              border: "1px solid #dbeafe",
            }}
          >
            LangGraph + CRAG Engine
          </span>
        </div>

        {/* Action Controls Menu Control Group */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={() => setShowLogs(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: !currentRunId ? "#94a3b8" : "#0f172a",
              color: "#f8fafc",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              opacity: !currentRunId ? 0.7 : 1,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: currentRunId
                ? "0 4px 12px rgba(15, 23, 42, 0.15)"
                : "none",
            }}
            title={
              !currentRunId
                ? "Trigger an agent run first to view real-time logs"
                : "Open terminal console"
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
                  onClick={() => setSelected(c.name)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background:
                      selected === c.name
                        ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                        : "transparent",
                    color: selected === c.name ? "#fff" : "#475569",
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {c.name}
                </button>
                <RunCompanyButton
                  competitorName={c.name}
                  onClick={() => handleRunCompany(c.name)}
                />
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

        {/* Table/Feed Metadata Aggregation SubHeader */}
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
            {selected
              ? `📊 ${selected} Core Feed Reports`
              : " Aggregated Intelligence Feed"}
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
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#475569";
            }}
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />{" "}
            Sync Dashboard
          </button>
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

      <AgentStepper
        running={stepperOpen}
        competitor={stepperComp}
        runId={currentRunId}
        onClose={() => {
          setStepperOpen(false);
          refetch();
        }}
      />

      {showLogs && (
        <LogsSidebar
          open={showLogs}
          onClose={() => {
            setShowLogs(false);
            setCurrentRunId(null);
            refetch();
          }}
          runId={currentRunId}
        />
      )}
    </div>
  );
}
