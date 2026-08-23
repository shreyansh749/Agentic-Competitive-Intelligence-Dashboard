import { useState } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Globe,
  Rss,
  GitMerge,
  FileText,
  BarChart2,
} from "lucide-react";
import QualityBadge from "./QualityBadge";
import { RunCompanyButton } from "./RunAgentButton";

const SourceIcon = ({ source }) => {
  if (source === "web_search") return <Globe size={12} color="#3b82f6" />;
  if (source === "merged") return <GitMerge size={12} color="#8b5cf6" />;
  return <Rss size={12} color="#f59e0b" />;
};

function renderAnalysis(text) {
  if (!text || text.includes("No significant changes")) {
    return (
      <div
        style={{
          padding: "16px 20px",
          background: "#ffffff",
          border: "1px dashed #cbd5e1",
          borderRadius: 10,
          fontSize: 13,
          color: "#64748b",
          fontStyle: "italic",
          textAlign: "center",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        No significant changes detected this cycle
      </div>
    );
  }

  const blocks = text.split(/\*\*(.+?)\*\*/).filter((s) => s.trim());

  const parsed = [];
  for (let i = 0; i < blocks.length; i += 2) {
    const category = blocks[i]?.trim();
    const content = blocks[i + 1]?.trim();
    if (category && content) {
      parsed.push({ category, content });
    }
  }

  if (parsed.length === 0) {
    return (
      <div
        style={{
          fontSize: 13,
          color: "#334155",
          lineHeight: 1.7,
          background: "#ffffff",
          padding: "16px",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {text}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {parsed.map((block, i) => {
        const whatMatch = block.content.match(
          /What changed:\s*(.+?)(?=Impact:|$)/s,
        );
        const impactMatch = block.content.match(/Impact:\s*(.+?)$/s);

        const what =
          whatMatch?.[1]?.trim() ||
          block.content.replace(/Impact:\s*(.+?)$/s, "").trim();
        const impact = impactMatch?.[1]?.trim();

        return (
          <div
            key={i}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "14px 18px",
              boxShadow:
                "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
              transition: "border-color 0.15s ease",
            }}
          >
            {/* Category badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.02em",
                padding: "3px 10px",
                borderRadius: 6,
                marginBottom: 10,
                border: "1px solid #dbeafe",
                textTransform: "uppercase",
              }}
            >
              {block.category}
            </div>

            {what && (
              <div
                style={{
                  fontSize: 13.5,
                  color: "#1e293b",
                  lineHeight: 1.6,
                  fontWeight: 400,
                  marginBottom: impact ? 10 : 0,
                }}
              >
                {what}
              </div>
            )}

            {impact && (
              <div
                style={{
                  fontSize: 12.5,
                  color: "#475569",
                  lineHeight: 1.55,
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  borderRadius: 6,
                  padding: "8px 12px",
                  marginTop: 6,
                }}
              >
                <span
                  style={{ fontWeight: 600, color: "#0f172a", marginRight: 4 }}
                >
                  Impact:
                </span>
                {impact}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReportCard({ report, onRun }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setTab] = useState("summary");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#fff",
        border: open ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
        borderRadius: 12,
        overflow: "hidden",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: open
          ? "0 10px 25px -5px rgba(59, 130, 246, 0.08)"
          : isHovered
            ? "0 4px 12px -2px rgba(0, 0, 0, 0.04)"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.01)",
        transform: isHovered && !open ? "translateY(-1px)" : "none",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "16px 20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: open
            ? "linear-gradient(to right, #f8fafc, #fff)"
            : "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "#0f172a",
              letterSpacing: "-0.2px",
            }}
          >
            {report.competitor}
          </span>
          <QualityBadge score={report.relevance_score} />

          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: "#64748b",
              background: "#f1f5f9",
              padding: "3px 8px",
              borderRadius: 6,
              textTransform: "uppercase",
              letterSpacing: "0.3px",
            }}
          >
            <SourceIcon source={report.source} />
            {report.source?.replace("_", " ")}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>
            {report.timestamp
              ? format(new Date(report.timestamp), "dd MMM, hh:mm a")
              : "—"}
          </span>
          <div
            style={{
              background: open ? "#eff6ff" : "#f8fafc",
              padding: 6,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {open ? (
              <ChevronUp size={14} color="#2563eb" strokeWidth={2.5} />
            ) : (
              <ChevronDown size={14} color="#64748b" strokeWidth={2.5} />
            )}
          </div>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #f1f5f9", background: "#fff" }}>
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #f1f5f9",
              padding: "0 20px",
              background: "#f8fafc",
              gap: 8,
            }}
          >
            {[
              {
                id: "summary",
                label: "Executive Summary",
                icon: <FileText size={13} />,
              },
              {
                id: "analysis",
                label: "Full Matrix Analysis",
                icon: <BarChart2 size={13} />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: activeTab === tab.id ? "#2563eb" : "#64748b",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === tab.id ? "#2563eb" : "transparent"}`,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "24px" }}>
            {activeTab === "summary" && (
              <div
                style={{
                  fontSize: 13,
                  color: "#e2e8f0",
                  lineHeight: "1.9",
                  background: "#0f172a", 
                  borderRadius: 10,
                  padding: "20px",
                  fontFamily: "Inter, system-ui, sans-serif", 
                  whiteSpace: "pre-wrap",
                  border: "1px solid #1e293b",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {report.summary
                  ?.split("\n")
                  .filter((l) => l.trim())
                  .map((line, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          color: "#38bdf8",
                          fontWeight: "bold",
                          fontSize: 16,
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        •
                      </span>

                      <span style={{ flex: 1, lineHeight: 1.6 }}>
                        {line
                          .replace(/\*\*/g, "") 
                          .replace(/^[•\*\-\s]+/, "") 
                          .trim()}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === "analysis" && (
              <div style={{ padding: "16px 18px" }}>
                {report.analysis && report.analysis.trim() ? (
                  renderAnalysis(report.analysis)
                ) : (
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "#f9fafb",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#9ca3af",
                      fontStyle: "italic",
                    }}
                  >
                    No analysis available for this report.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportFeed({ reports, loading, onRunCompany }) {
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>
          Synchronizing secure intelligence pipelines...
        </div>
      </div>
    );
  if (!reports.length)
    return (
      <div
        style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: 4,
          }}
        >
          No Data Matrix Captured
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          Trigger the multi-agent network scanner to build your target matrix
          tracking.
        </div>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {reports.map((r, i) => (
        <ReportCard key={i} report={r} onRun={onRunCompany} />
      ))}
    </div>
  );
}
