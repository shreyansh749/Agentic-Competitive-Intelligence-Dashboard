import { useEffect, useState } from "react";
import { reportsAPI } from "../services/api";
import { FileText, Building2, Star, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function StatsBar() {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    reportsAPI
      .getStats(userId)
      .then((r) => setStats(r.data))
      .catch((e) => console.error("Stats error:", e));
  }, [user]);

  if (!stats) return null;

  const items = [
    {
      icon: <FileText size={16} />,
      label: "Total Reports",
      value: stats.total_reports,
    },
    {
      icon: <Building2 size={16} />,
      label: "Competitors",
      value: stats.total_competitors,
    },
    {
      icon: <Star size={16} />,
      label: "Avg Data Quality",
      value: `${(stats.avg_relevance_score * 100).toFixed(0)}%`,
    },
    {
      icon: <Zap size={16} />,
      label: "Today's Runs",
      value: stats.runs_today ?? 0,
    }, 
  ];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            flex: 1,
            background: "#fff",
            border: "0.5px solid #e5e7eb",
            borderRadius: 10,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ color: "#6b7280" }}>{item.icon}</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#111" }}>
              {item.value}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
