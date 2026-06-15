import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Globe, Rss, GitMerge } from "lucide-react";
import QualityBadge from "./QualityBadge";
import { RunCompanyButton } from "./RunAgentButton";

const SourceIcon = ({ source }) => {
  if (source === "web_search") return <Globe size={11} />;
  if (source === "merged") return <GitMerge size={11} />;
  return <Rss size={11} />;
};

function ReportCard({ report, onRun }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setTab] = useState("summary");

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e5e7eb",
        borderRadius: 10,
        overflow: "hidden",
        transition: "box-shadow 0.15s",
      }}
    >
      {/* Card Header — always visible */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "14px 18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: open ? "#f9fafb" : "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>
            {report.competitor}
          </span>
          <QualityBadge score={report.relevance_score} />
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              color: "#9ca3af",
            }}
          >
            <SourceIcon source={report.source} />
            {report.source}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {report.timestamp
              ? format(new Date(report.timestamp), "dd MMM, hh:mm a")
              : "—"}
          </span>
          {open ? (
            <ChevronUp size={16} color="#9ca3af" />
          ) : (
            <ChevronDown size={16} color="#9ca3af" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop: "0.5px solid #f3f4f6" }}>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "0.5px solid #f3f4f6",
              padding: "0 18px",
            }}
          >
            {["summary", "analysis"].map((tab) => (
              <button
                key={tab}
                onClick={() => setTab(tab)}
                style={{
                  padding: "10px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: activeTab === tab ? "#1a56db" : "#6b7280",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === tab ? "#1a56db" : "transparent"}`,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {tab === "summary" ? "Executive Summary" : "Full Analysis"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: "16px 18px" }}>
            {activeTab === "summary" && (
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.9 }}>
                {report.summary
                  ?.split("\n")
                  .filter((l) => l.trim())
                  .map((line, i) => (
                    <div key={i} style={{ marginBottom: 4 }}>
                      {line}
                    </div>
                  ))}
              </div>
            )}
            {activeTab === "analysis" && (
              <div
                style={{
                  fontSize: 12,
                  color: "#4b5563",
                  lineHeight: 1.8,
                  background: "#f9fafb",
                  borderRadius: 8,
                  padding: "14px 16px",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {report.analysis || "No detailed analysis available."}
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
      <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
        Loading reports...
      </div>
    );
  if (!reports.length)
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
        No reports yet. Run the agent to get started.
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {reports.map((r, i) => (
        <ReportCard key={i} report={r} onRun={onRunCompany} />
      ))}
    </div>
  );
}
