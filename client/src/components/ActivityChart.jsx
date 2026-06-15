import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

export default function ActivityChart({ reports }) {
  // Group reports by date
  const grouped = reports.reduce((acc, r) => {
    const date = format(new Date(r.timestamp), "MMM dd");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(grouped)
    .slice(-14) // Last 14 days
    .map(([date, count]) => ({ date, count }));

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #e5e7eb",
        borderRadius: 10,
        padding: "18px 20px",
        marginBottom: 24,
      }}
    >
      <h3
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "#374151",
          marginBottom: 16,
        }}
      >
        Activity — Last 14 days
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#1a56db" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
