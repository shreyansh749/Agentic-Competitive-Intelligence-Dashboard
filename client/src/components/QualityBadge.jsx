export default function QualityBadge({ score }) {
  const config =
    score >= 0.8
      ? { label: "High Quality", bg: "#EAF3DE", color: "#3B6D11" }
      : score >= 0.5
        ? { label: "Supplemented", bg: "#FAEEDA", color: "#854F0B" }
        : { label: "Web Fallback", bg: "#FCEBEB", color: "#A32D2D" };

  return (
    <span
      style={{
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 10px",
        borderRadius: 99,
        whiteSpace: "nowrap",
      }}
    >
      {config.label} · {(score * 100).toFixed(0)}%
    </span>
  );
}
