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

  // ── Handlers: Single Company Trigger ──────────────────────────
  // ── Dashboard.jsx ke dono handlers ko complete override kijiye ──

  const handleRunCompany = async (name) => {
    try {
      setStepperComp(name);
      setStepperOpen(true);
      console.log(`[Dashboard] Sending run request for: ${name}`);

      // CORS aur dynamic mapping errors se bachne ke liye direct Axios/Fetch parsing verify karein
      const res = await fetch(
        `http://localhost:5000/api/run-agent?competitor_name=${encodeURIComponent(name)}`,
        { method: "POST" },
      );

      // Check karo server ne error 500 ya 404 toh nahi diya?
      if (!res.ok) {
        const errText = await res.text();
        alert(`🚨 Express Server Error (${res.status}): ${errText}`);
        setStepperOpen(false);
        return;
      }

      const data = await res.json();
      console.log("[Dashboard Debug] Full API Payload Received:", data);

      // Python schema structure variations safe bypass checking
      const extractedRunId = data.run_id || (data.data && data.data.run_id);

      if (extractedRunId) {
        console.log(`[Dashboard] Success! Captured Token: ${extractedRunId}`);
        setCurrentRunId(extractedRunId);
        //setShowLogs(true); // Automatic sidebar reveal
      } else {
        // Agar backend se response toh aaya par run_id gayab hai
        alert(
          `⚠️ Server responded successfully, but 'run_id' key is missing inside the payload object! Look at your browser console.`,
        );
        console.error(
          "[Dashboard Critical] Payload content shape mismatch:",
          data,
        );
        setStepperOpen(false);
      }
    } catch (e) {
      alert(
        `❌ Connection Failed! Node.js server (Port 5000) block is offline or unreachable: ${e.message}`,
      );
      console.error("[Dashboard Single Trigger Error Exception]:", e);
      setStepperOpen(false);
    }
  };

  const handleRunAll = async () => {
    try {
      setStepperComp("All Selected Profiles");
      setStepperOpen(true);
      console.log("[Dashboard] Sending global network run request...");

      const res = await fetch(`http://localhost:5000/api/run-agent`, {
        method: "POST",
      });

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
        //setShowLogs(true);
      } else {
        alert(
          `⚠️ Global trigger payload returned data, but missing dynamic token matching.`,
        );
        console.error(
          "[Dashboard Critical] Global response keys broken:",
          data,
        );
        setStepperOpen(false);
      }
    } catch (e) {
      alert(`❌ Connection Failed on Global Run! ${e.message}`);
      console.error("[Dashboard Global Run Error Exception]:", e);
      setStepperOpen(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Navbar Structure */}
      <div
        style={{
          background: "#fff",
          borderBottom: "0.5px solid #e5e7eb",
          padding: "13px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>
            🔍 Competitive Intel Matrix
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 10 }}>
            LangGraph + CRAG Hub
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* 🔥 FIX: Disabled condition injected dynamically */}
          <button
            onClick={() => setShowLogs(true)}
            //disabled={!currentRunId} // Jab tak runId null ya empty hai, yeh disabled rahega
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: !currentRunId ? "#9ca3af" : "#111827", // Disabled hone par gray, active hone par dark
              color: "#e6edf3",
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              //cursor: !currentRunId ? "not-allowed" : "pointer", // Disabled cursor style change
              opacity: !currentRunId ? 0.6 : 1, // Visual indication for disabled state
              transition: "all 0.2s ease-in-out",
            }}
            title={
              !currentRunId
                ? "Trigger an agent run first to view real-time logs"
                : "Open terminal console"
            }
          >
            <Terminal size={13} /> System Logs
            {currentRunId && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "#10b981",
                  borderRadius: "50%",
                  position: "absolute",
                  top: 6,
                  right: 6,
                  boxShadow: "0 0 4px #10b981",
                }}
              />
            )}
          </button>

          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Plus size={14} /> Add Competitor
          </button>

          <RunAllButton onDone={refetch} onClick={handleRunAll} />
        </div>
      </div>

      {/* Main Containers Grid Dashboard */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 24px" }}>
        <StatsBar />
        <ActivityChart reports={reports} />

        {/* Competitor Profile Chips Navigation Slider */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            <button
              onClick={() => setSelected(null)}
              style={{
                padding: "6px 16px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                background: selected === null ? "#1a56db" : "#f3f4f6",
                color: selected === null ? "#fff" : "#374151",
                border: `1px solid ${selected === null ? "#1a56db" : "#e5e7eb"}`,
              }}
            >
              All Targets
            </button>

            {competitors.map((c) => (
              <div
                key={c.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f3f4f6",
                  borderRadius: 99,
                  paddingRight: 4,
                }}
              >
                <button
                  onClick={() => setSelected(c.name)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    background: selected === c.name ? "#1a56db" : "transparent",
                    color: selected === c.name ? "#fff" : "#374151",
                    border: "none",
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

        {/* Filters Optimization Dashboard Toolbelt */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
        />

        {/* Dynamic Aggregations Analytics Metadata Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
            {selected
              ? `${selected} Core Feed Reports`
              : "Aggregated Intelligence Feed"}
            <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: 8 }}>
              ({filteredReports.length} items parsed)
            </span>
          </h2>
          <button
            onClick={refetch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              fontSize: 12,
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={12} /> Sync Dashboard
          </button>
        </div>

        {/* Core Multi-Agent Reports Feed Grid */}
        <ReportFeed
          reports={filteredReports}
          loading={loading}
          onRunCompany={handleRunCompany}
        />
      </div>

      {/* ── Overlay Portals Layover Layer Hooks ───────────────────────── */}
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
      {/* Stable Continuous Sidebar Call - Handles internal fallbacks seamlessly */}
      {showLogs && (
        <LogsSidebar
          open={showLogs}
          onClose={() => {
            setShowLogs(false);
            setCurrentRunId(null); // Reset track on close context
            refetch();
          }}
          runId={currentRunId}
        />
      )}
    </div>
  );
}
