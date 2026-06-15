import { Search } from "lucide-react";

export default function FilterBar({
  search,
  setSearch,
  sourceFilter,
  setSourceFilter,
}) {
  return (
    <div
      style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#fff",
          border: "0.5px solid #e5e7eb",
          borderRadius: 8,
          padding: "7px 12px",
          flex: 1,
          minWidth: 200,
        }}
      >
        <Search size={14} color="#9ca3af" />
        <input
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "#374151",
            background: "transparent",
            width: "100%",
          }}
        />
      </div>

      {/* Source filter */}
      <select
        value={sourceFilter}
        onChange={(e) => setSourceFilter(e.target.value)}
        style={{
          padding: "7px 12px",
          fontSize: 12,
          fontWeight: 500,
          border: "0.5px solid #e5e7eb",
          borderRadius: 8,
          color: "#374151",
          background: "#fff",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="all">All Sources</option>
        <option value="scraped">Scraped Only</option>
        <option value="web_search">Web Search Only</option>
        <option value="merged">Merged Only</option>
      </select>
    </div>
  );
}
