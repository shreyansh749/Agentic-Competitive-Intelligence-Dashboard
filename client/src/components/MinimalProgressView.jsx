import { useEffect, useState } from "react";
import { CheckCircle, Loader, XCircle, Clock } from "lucide-react";

export default function MinimalProgressView({
  competitors,
  runId,
  onClose,
  onDone,
}) {
  const [status, setStatus] = useState(
    Object.fromEntries(competitors.map((c) => [c, "queued"])),
  );
  const [done, setDone] = useState(false);

  // useEffect(() => {
  //   if (!runId) return;

  //   // Reset on new run
  //   setStatus(Object.fromEntries(competitors.map((c) => [c, "queued"])));
  //   setDone(false);

  //   const es = new EventSource(`http://localhost:5000/api/logs/${runId}`);

  //   es.onmessage = (event) => {
  //     try {
  //       const entry = JSON.parse(event.data);
  //       const msg = entry.message || "";

  //       console.log("[SSE]", msg); // ← temporarily add karo
  //       // ── Done signal — pehle check karo ───────────────────
  //       if (
  //         msg.includes("All done —") ||
  //         msg.startsWith("__STATUS__") ||
  //         entry.level === "done"
  //       ) {
  //         // Saare remaining competitors force complete karo
  //         setStatus((prev) => {
  //           const updated = { ...prev };
  //           Object.keys(updated).forEach((name) => {
  //             if (updated[name] === "running" || updated[name] === "queued") {
  //               updated[name] = "completed";
  //             }
  //           });
  //           return updated;
  //         });
  //         setDone(true);
  //         es.close();
  //         return;
  //       }

  //       // ── Per-competitor status track ───────────────────────
  //       competitors.forEach((name) => {
  //         // Running
  //         if (
  //           msg.includes(`Dispatching: ${name}`) ||
  //           msg.includes(`Starting run for ${name}`)
  //         ) {
  //           setStatus((prev) => ({ ...prev, [name]: "running" }));
  //         }

  //         // Completed — saare possible patterns
  //         if (
  //           msg.includes(`Completed: ${name}`) ||
  //           msg.includes(`Complete for ${name}`) ||
  //           msg.includes(`completed for ${name}`)
  //         ) {
  //           setStatus((prev) => ({ ...prev, [name]: "completed" }));
  //         }

  //         // Failed
  //         if (
  //           msg.includes(`ERROR for ${name}`) ||
  //           msg.includes(`failed for ${name}`) ||
  //           msg.includes(`Failed for ${name}`)
  //         ) {
  //           setStatus((prev) => ({ ...prev, [name]: "failed" }));
  //         }
  //       });
  //     } catch (e) {
  //       console.error("[MinimalProgressView] Parse error:", e);
  //     }
  //   };

  //   es.onerror = () => {
  //     console.error("[MinimalProgressView] SSE error");
  //     es.close();
  //   };

  //   return () => es.close();
  // }, [runId]);

  useEffect(() => {
    if (!runId) return;

    setStatus(Object.fromEntries(competitors.map((c) => [c, "queued"])));
    setDone(false);

    const es = new EventSource(`http://localhost:5000/api/logs/${runId}`);

    es.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data);
        const msg = entry.message || "";

        console.log("[SSE]", msg); // ← temporarily add karo

        // Done signal
        if (
          msg.includes("All done —") ||
          msg.includes("__STATUS__") ||
          entry.level === "done"
        ) {
          setStatus((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((k) => {
              if (updated[k] !== "failed") updated[k] = "completed";
            });
            return updated;
          });
          setDone(true);
          es.close();
          return;
        }

        // Per competitor tracking
        competitors.forEach((name) => {
          if (
            msg.includes(`Dispatching: ${name}`) ||
            msg.includes(`Starting run for ${name}`)
          ) {
            setStatus((prev) => ({ ...prev, [name]: "running" }));
          }
          if (
            msg.includes(`Completed: ${name}`) ||
            msg.includes(`Complete for ${name}`)
          ) {
            setStatus((prev) => ({ ...prev, [name]: "completed" }));
          }
          if (
            msg.includes(`ERROR for ${name}`) ||
            msg.includes(`failed for ${name}`)
          ) {
            setStatus((prev) => ({ ...prev, [name]: "failed" }));
          }
        });
      } catch (e) {}
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, [runId]); // ← SIRF runId dependency — competitors nahi
  
  const total = competitors.length;
  const completed = Object.values(status).filter(
    (s) => s === "completed",
  ).length;
  const failed = Object.values(status).filter((s) => s === "failed").length;
  const percent = Math.round((completed / total) * 100);

  const getIcon = (s) => {
    if (s === "completed") return <CheckCircle size={16} color="#10b981" />;
    if (s === "running")
      return <Loader size={16} color="#60a5fa" className="spin" />;
    if (s === "failed") return <XCircle size={16} color="#ef4444" />;
    return <Clock size={16} color="#6b7280" />;
  };

  const getStyle = (s) => ({
    background:
      s === "completed"
        ? "rgba(16,185,129,0.12)"
        : s === "running"
          ? "rgba(96,165,250,0.12)"
          : s === "failed"
            ? "rgba(239,68,68,0.12)"
            : "rgba(107,114,128,0.08)",
    color:
      s === "completed"
        ? "#10b981"
        : s === "running"
          ? "#60a5fa"
          : s === "failed"
            ? "#ef4444"
            : "#6b7280",
  });

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
          width: 440,
          boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
            LangGraph Parallel Execution
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
            Running all agents
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: "#9ca3af",
              marginBottom: 8,
            }}
          >
            <span>
              {completed} of {total} completed
            </span>
            <span>{percent}%</span>
          </div>
          <div
            style={{
              height: 6,
              background: "#1f2937",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${percent}%`,
                background:
                  failed > 0
                    ? "linear-gradient(90deg,#10b981,#ef4444)"
                    : "linear-gradient(90deg,#10b981,#34d399)",
                borderRadius: 99,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Competitor grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
            marginBottom: done ? 20 : 0,
          }}
        >
          {competitors.map((name) => {
            const s = status[name];
            const style = getStyle(s);
            return (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: style.background,
                  transition: "background 0.3s ease",
                }}
              >
                {getIcon(s)}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: style.color,
                  }}
                >
                  {name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Done state */}
        {done && (
          <div>
            <div
              style={{
                background:
                  failed > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                border: `1px solid ${failed > 0 ? "#ef4444" : "#10b981"}`,
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: failed > 0 ? "#ef4444" : "#10b981",
                marginBottom: 14,
              }}
            >
              {failed > 0
                ? `⚠️ ${completed} completed, ${failed} failed`
                : `✅ All ${total} agents completed successfully`}
            </div>
            <button
              onClick={() => {
                onDone?.();
                onClose?.();
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
              View Reports
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
