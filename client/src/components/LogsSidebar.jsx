import { useEffect, useRef, useState } from "react";
import { X, Terminal, Trash2 } from "lucide-react";

export default function LogsSidebar({ open, onClose, runId }) {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | running | done | error
  const bottomRef = useRef(null);
  const esRef = useRef(null);

  useEffect(() => {
    // Active connections garbage collection cycle clear karo
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    console.log(1);
    if (!open) return
    console.log(2);
    if (!runId) {
      setLogs([
        {
          text: "⚠️ System logs viewer activated. No active background session trace found. Trigger an agent loop from dashboard grid tabs.",
          time: new Date().toLocaleTimeString(),
          type: "warn",
        },
      ]);
      setStatus("idle");
      return;
    }
    console.log(3);
    // Reset layout attributes initially
    setLogs([]);
    setStatus("running");
    console.log(4);
    // Connect securely directly through Node Express Pipeline Proxy (Port 5000)
    const url = `http://localhost:5000/api/logs/${runId}`;
    console.log("[LogsSidebar] Connecting EventSource to:", url);
    console.log(5);
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        // Safe check for missing or null event data signals
        if (!event.data) return;

        // Defensive text pattern matching before running structural object conversions
        if (
          typeof event.data === "string" &&
          event.data.startsWith("__STATUS__")
        ) {
          const s = event.data.replace("__STATUS__", "").trim();
          setStatus(s);
          es.close();
          return;
        }

        // Run object construction parameters safely inside sandbox framework
        const entry = JSON.parse(event.data);

        // Backup parsing support for alternative key-value string variants
        if (entry.message?.startsWith("__STATUS__")) {
          const s = entry.message.replace("__STATUS__", "").trim();
          setStatus(s);
          es.close();
          return;
        }

        setLogs((prev) => [
          ...prev,
          {
            text: entry.message || "Processing telemetry checkpoint...",
            time: entry.time
              ? new Date(entry.time).toLocaleTimeString()
              : new Date().toLocaleTimeString(),
            type: entry.level || "info",
          },
        ]);
      } catch (parseError) {
        // Safe alternative string handler layout to prevent frontend loop drops
        const rawText = event.data.toString();

        if (rawText.includes("__STATUS__")) {
          const fallbackStatus = rawText.replace("__STATUS__", "").trim();
          setStatus(fallbackStatus);
          es.close();
        } else {
          setLogs((prev) => [
            ...prev,
            {
              text: rawText,
              time: new Date().toLocaleTimeString(),
              type: "info",
            },
          ]);
        }
      }
    };

    es.onerror = (error) => {
      console.error("[EventSource Handshake Broken/Closed Downstream]:", error);
      setStatus("error");
      if (esRef.current) esRef.current.close();
    };

    return () => {
      if (esRef.current) esRef.current.close();
    };
  }, [open, runId]);

  // Handle smooth auto-scroll parameters efficiently
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  if (!open) return null;

  const logColor = (type) =>
    ({
      success: "#10b981",
      done: "#10b981",
      warn: "#f59e0b",
      error: "#ef4444",
      info: "#9ca3af",
    })[type] || "#9ca3af";

  const statusBadge = {
    running: { label: "LIVE", bg: "rgba(35,134,54,0.15)", color: "#238636" },
    done: { label: "DONE", bg: "rgba(16,185,129,0.15)", color: "#10b981" },
    error: { label: "ERROR", bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    idle: { label: "IDLE", bg: "rgba(75,85,99,0.15)", color: "#6b7280" },
  }[status] || { label: "IDLE", bg: "rgba(75,85,99,0.15)", color: "#6b7280" };

  return (
    <>
      {/* Overlay Background Backdrop Layer */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 3000,
          backdropFilter: "blur(1px)",
        }}
      />

      {/* Side Terminal Drawer Container */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 520, // Slightly expanded space parameters for standard text alignment layouts
          height: "100vh",
          background: "#0d1117",
          zIndex: 3001,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-12px 0 42px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header Block Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1px solid #21262d",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Terminal size={16} color="#58a6ff" />
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#e6edf3",
                letterSpacing: "0.2px",
              }}
            >
              System Logs Stream
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 99,
                background: statusBadge.bg,
                color: statusBadge.color,
              }}
            >
              {statusBadge.label}
            </span>
          </div>

          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <button
              onClick={() => setLogs([])}
              title="Clear Console"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#484f58",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#484f58")}
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#8b949e",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Parameter Sub-Header Trace Bar */}
        {runId && (
          <div
            style={{
              padding: "8px 22px",
              borderBottom: "1px solid #21262d",
              fontSize: 11,
              color: "#8b949e",
              fontFamily: "monospace",
              background: "#161b22",
            }}
          >
            session_token: <span style={{ color: "#58a6ff" }}>{runId}</span>
          </div>
        )}

        {/* Real-Time Live Data Streaming Text Output Console */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 22px",
            fontFamily:
              "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
            fontSize: 12,
            lineHeight: 1.8,
            background: "#090d13",
          }}
        >
          {logs.length === 0 && status === "running" && (
            <div style={{ color: "#8b949e", fontStyle: "italic" }}>
              ⌛ Syncing channel pipeline graph nodes... Waiting for telemetry
              markers...
            </div>
          )}

          {logs.map((log, i) => (
            <div
              key={i}
              style={{
                marginBottom: 6,
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <span
                style={{ color: "#484f58", flexShrink: 0, userSelect: "none" }}
              >
                [{log.time}]
              </span>
              <span
                style={{ color: logColor(log.type), wordBreak: "break-word" }}
              >
                {log.text}
              </span>
            </div>
          ))}

          {status === "running" && (
            <div
              style={{
                color: "#58a6ff",
                marginTop: 4,
                animation: "pulse 1s infinite",
              }}
            >
              ▌
            </div>
          )}

          {status === "done" && (
            <div
              style={{
                marginTop: 14,
                padding: "12px 16px",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 8,
                color: "#10b981",
                fontSize: 12,
              }}
            >
              🎉 <strong>Execution Complete:</strong> LangGraph multi-agent
              orchestration successfully stored profiles onto cluster dashboard
              state.
            </div>
          )}

          {status === "error" && (
            <div
              style={{
                marginTop: 14,
                padding: "12px 16px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                color: "#ef4444",
                fontSize: 12,
              }}
            >
              🚨 <strong>Stream Interrupted:</strong> The telemetry pipe gateway
              connection dropped down. Review cluster diagnostics traces inside
              your terminal window.
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Footer Tracking Indicators Layer */}
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid #21262d",
            fontSize: 11,
            color: "#484f58",
            display: "flex",
            justifyContent: "space-between",
            background: "#161b22",
            userSelect: "none",
          }}
        >
          <span>Orchestration: LangGraph Engine V1</span>
          <span>{logs.length} tracking events captured</span>
        </div>
      </div>
    </>
  );
}
