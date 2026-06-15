import { useEffect, useState } from "react";
import { CheckCircle, Circle, Loader } from "lucide-react";

const STEPS = [
  {
    id: "scraper",
    label: "Scraping Website",
    detail: "BeautifulSoup + Playwright",
    keyword: "[Node: Scraper]",
  },
  {
    id: "news",
    label: "Fetching News",
    detail: "Google RSS + NewsAPI",
    keyword: "[Node: News]",
  },
  {
    id: "crag",
    label: "CRAG Quality Evaluation",
    detail: "LLM relevance scoring",
    keyword: "[Node: CRAG Grader]",
  },
  {
    id: "fallback",
    label: "Data Correction",
    detail: "Web search / merge fallback",
    keyword: "[Node: Web Search]",
  },
  {
    id: "analyzer",
    label: "Analyzing Changes",
    detail: "Diff old vs new",
    keyword: "[Node: Analyzer]",
  },
  {
    id: "summarizer",
    label: "Generating Summary",
    detail: "Executive bullets",
    keyword: "[Node: Summarizer]",
  },
  {
    id: "store",
    label: "Saving to MongoDB",
    detail: "Report persisted",
    keyword: "[Node: Store]",
  },
];

export default function AgentStepper({ running, competitor, onClose, runId }) {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [activeStep, setActiveStep] = useState(null);
  const [cragScore, setCragScore] = useState(null);
  const [source, setSource] = useState(null);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Reset on new run
    setCompletedSteps(new Set());
    setActiveStep(null);
    setCragScore(null);
    setSource(null);
    setDone(false);
    setLogs([]);

    if (!running || !runId) return;

    // SSE se real logs subscribe karo
    const url = `http://localhost:5000/api/logs/${runId}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data);
        const msg = entry.message || "";

        // Done signal
        if (msg.startsWith("__STATUS__")) {
          const s = msg.replace("__STATUS__", "").trim();
          if (s === "done") setDone(true);
          es.close();
          return;
        }

        setLogs((prev) => [...prev, msg]);

        // ── Step tracking — keyword match ──────────────────────
        STEPS.forEach((step, i) => {
          if (msg.includes(step.keyword)) {
            setActiveStep(i);
            // Pichle saare steps complete mark karo
            setCompletedSteps((prev) => {
              const next = new Set(prev);
              for (let j = 0; j < i; j++) next.add(j);
              return next;
            });
          }
        });

        // Store complete hone pe sab done
        if (msg.includes("[Node: Store] Report saved")) {
          setCompletedSteps(new Set([0, 1, 2, 3, 4, 5, 6]));
          setActiveStep(null);
        }

        // ── CRAG real score extract karo ──────────────────────
        // Log: "[Node: CRAG Grader] Score: 0.72 — ⚠️ Ambiguous"
        if (msg.includes("[Node: CRAG Grader] Score:")) {
          const match = msg.match(/Score:\s*([\d.]+)/);
          if (match) setCragScore(parseFloat(match[1]).toFixed(2));
        }

        // ── Real source track karo ────────────────────────────
        if (msg.includes("[CRAG Router] Direct to analyzer"))
          setSource("scraped");
        if (msg.includes("[CRAG Router] Full web search"))
          setSource("web_search");
        if (msg.includes("[CRAG Router] Merging with web")) setSource("merged");
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    es.onerror = () => {
      setDone(true);
      es.close();
    };

    return () => es.close();
  }, [running, runId]);

  if (!running && !done) return null;

  // Source badge config
  const sourceBadge = {
    scraped: {
      label: "✅ Direct Scraped",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    web_search: {
      label: "🔍 Web Search Fallback",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
    merged: {
      label: "🔀 Merged Sources",
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.1)",
    },
  }[source];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#111827",
          borderRadius: 14,
          padding: "28px 32px",
          width: 480,
          boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 4 }}>
            LangGraph Execution
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
            {competitor
              ? `Running agent for ${competitor}`
              : "Running all agents"}
          </div>
          {/* Real source badge */}
          {sourceBadge && (
            <div
              style={{
                marginTop: 10,
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 500,
                color: sourceBadge.color,
                background: sourceBadge.bg,
                border: `1px solid ${sourceBadge.color}33`,
              }}
            >
              Data Source: {sourceBadge.label}
            </div>
          )}
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {STEPS.map((step, i) => {
            const isDone = completedSteps.has(i);
            const isActive = activeStep === i;
            const isPending = !isDone && !isActive;

            return (
              <div
                key={step.id}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div style={{ marginTop: 1, flexShrink: 0 }}>
                  {isDone && <CheckCircle size={18} color="#10b981" />}
                  {isActive && (
                    <Loader size={18} color="#60a5fa" className="spin" />
                  )}
                  {isPending && <Circle size={18} color="#374151" />}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: isPending
                        ? "#6b7280"
                        : isDone
                          ? "#d1fae5"
                          : "#fff",
                    }}
                  >
                    {step.label}

                    {/* Real CRAG score */}
                    {step.id === "crag" && cragScore && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          color:
                            cragScore > 0.8
                              ? "#10b981"
                              : cragScore > 0.5
                                ? "#f59e0b"
                                : "#ef4444",
                          background: "rgba(255,255,255,0.08)",
                          padding: "1px 7px",
                          borderRadius: 99,
                        }}
                      >
                        Score: {cragScore}
                      </span>
                    )}

                    {/* Real source tag on fallback step */}
                    {step.id === "fallback" && source && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          color: source === "scraped" ? "#10b981" : "#f59e0b",
                          background: "rgba(255,255,255,0.08)",
                          padding: "1px 7px",
                          borderRadius: 99,
                        }}
                      >
                        {source === "scraped"
                          ? "Skipped"
                          : source === "web_search"
                            ? "Triggered"
                            : "Merged"}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 1 }}>
                    {step.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Done */}
        {done && (
          <div style={{ marginTop: 24 }}>
            <div
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid #10b981",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: "#10b981",
                marginBottom: 14,
              }}
            >
              ✅ Report saved to MongoDB. Refresh dashboard to see results.
            </div>
            <button
              onClick={() => {
                setDone(false);
                onClose();
              }}
              style={{
                width: "100%",
                padding: "10px",
                background: "#1a56db",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              View Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
