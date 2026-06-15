import { useState } from "react";
import { reportsAPI } from "../services/api";
import { X } from "lucide-react";

export default function AddCompetitorModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    url: "",
    blog_rss_url: "",
    category: "general",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.url) {
      setError("Name and URL required");
      return;
    }
    try {
      setLoading(true);
      await reportsAPI.addCompetitor(form);
      onAdded?.();
      onClose();
    } catch (e) {
      setError("Failed to add competitor");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    fontSize: 13,
    border: "0.5px solid #d1d5db",
    borderRadius: 8,
    outline: "none",
    boxSizing: "border-box",
    marginTop: 4,
    marginBottom: 12,
  };

  return (
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
          padding: 28,
          width: 420,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>
          Add Competitor
        </h2>

        <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
          Company Name *
        </label>
        <input
          style={inputStyle}
          placeholder="e.g. Zomato"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />

        <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
          Website URL *
        </label>
        <input
          style={inputStyle}
          placeholder="https://zomato.com"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
        />

        <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
          Blog RSS URL (optional)
        </label>
        <input
          style={inputStyle}
          placeholder="https://blog.zomato.com/feed"
          value={form.blog_rss_url}
          onChange={(e) =>
            setForm((f) => ({ ...f, blog_rss_url: e.target.value }))
          }
        />

        <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
          Category
        </label>
        <select
          style={inputStyle}
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        >
          <option value="general">General</option>
          <option value="food-delivery">Food Delivery</option>
          <option value="ecommerce">E-Commerce</option>
          <option value="fintech">Fintech</option>
          <option value="edtech">EdTech</option>
        </select>

        {error && (
          <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "#9ca3af" : "#1a56db",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Adding..." : "Add Competitor"}
        </button>
      </div>
    </div>
  );
}
