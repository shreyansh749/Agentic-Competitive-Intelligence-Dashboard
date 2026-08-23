import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reportsAPI } from "../services/api";
import ReportFeed from "../components/ReportFeed";
import AgentStepper from "../components/AgentStepper";
import LogsSidebar from "../components/LogsSidebar";
import {
  ArrowLeft,
  Play,
  Trash2,
  Loader,
  Terminal,
  UserMinus,
} from "lucide-react";

export default function CompanyPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const companyName = decodeURIComponent(name);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [stepperOpen, setStepperOpen] = useState(false);
  const [currentRunId, setCurrentRunId] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removing, setRemoving] = useState(false);

  const fetchReports = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await reportsAPI.getAll(companyName, 100, userId);
      setReports(res.data.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [companyName, userId]);

  const handleRun = async () => {
    try {
      setRunning(true);
      setStepperOpen(true);
      const res = await fetch(
        `http://localhost:5000/api/run-agent?competitor_name=${encodeURIComponent(companyName)}&userId=${userId}`,
        { method: "POST", credentials: "include" },
      );
      const data = await res.json();
      const runId = data.run_id || data?.data?.run_id;
      if (runId) setCurrentRunId(runId);
    } catch (e) {
      console.error(e);
      setStepperOpen(false);
    } finally {
      setRunning(false);
    }
  };

  const handleClear = async () => {
    try {
      setClearing(true);
      await reportsAPI.clearCompanyReports(companyName, userId);
      setReports([]);
      setConfirmClear(false);
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);
      await reportsAPI.removeCompetitor(companyName, userId);
      navigate("/"); 
    } catch (e) {
      console.error(e);
    } finally {
      setRemoving(false);
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
      {/* Navbar */}
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
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            fontSize: 14,
            color: "#374151",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Dashboard
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          {/* System logs */}
          <button
            onClick={() => setShowLogs(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: currentRunId ? "#111827" : "#9ca3af",
              color: "#e6edf3",
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              opacity: currentRunId ? 1 : 0.6,
              position: "relative",
            }}
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
                }}
              />
            )}
          </button>

          {/* Run button */}
          <button
            onClick={handleRun}
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
                <Loader size={14} className="spin" /> Running...
              </>
            ) : (
              <>
                <Play size={14} /> Run Agent
              </>
            )}
          </button>

          {/* Clear All */}
          <button
            onClick={() => setConfirmClear(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Trash2 size={14} /> Clear All
          </button>

          {/* Remove Competitor */}
          <button
            onClick={() => setShowRemoveModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#f7e6e6",
              color: "#ff0404",
              border: "1px solid #f7b9b9",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <UserMinus size={14} /> Remove Competitor
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* Company header */}
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 4px",
            }}
          >
            {companyName}
          </h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
            {reports.length} reports · Click Run Agent to fetch latest
            intelligence
          </p>
        </div>

        {/* Reports */}
        <ReportFeed reports={reports} loading={loading} />
      </div>

      {/* Confirm clear modal */}
      {confirmClear && (
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
              This will permanently delete all {reports.length} reports for{" "}
              {companyName}. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmClear(false)}
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
                onClick={handleClear}
                disabled={clearing}
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
                {clearing ? "Clearing..." : "Yes, delete all"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AgentStepper
        running={stepperOpen}
        competitor={companyName}
        runId={currentRunId}
        onClose={() => {
          setStepperOpen(false);
          fetchReports();
        }}
      />

      {showLogs && (
        <LogsSidebar
          open={showLogs}
          onClose={() => {
            setShowLogs(false);
            setCurrentRunId(null);
            fetchReports();
          }}
          runId={currentRunId}
        />
      )}

      {showRemoveModal && (
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
              width: 400,
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
              Remove {companyName}?
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
              This will permanently remove <strong>{companyName}</strong> from
              your tracking list and delete all{" "}
              <strong>{reports.length} reports</strong>. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowRemoveModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#cececf",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
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
                {removing ? "Removing..." : "Yes, remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
