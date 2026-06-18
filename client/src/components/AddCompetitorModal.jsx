import { useState } from "react";
import { reportsAPI } from "../services/api";
import { X, Building2, Globe, Link2, Layers } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AddCompetitorModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    url: "",
    blog_rss_url: "",
    category: "general",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [activeInput, setActiveInput] = useState(null);

  const handleSubmit = async () => {
    if (!form.name || !form.url) {
      setError("Company Name and Website URL are required fields.");
      return;
    }
    try {
      setLoading(true);
      console.log("[Modal] Submitting with userId:", userId);
      await reportsAPI.addCompetitor(form, userId);
      onAdded?.();
      onClose();
    } catch (e) {
      setError(
        "Failed to register target profile. Please verify configuration.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CHANGED: Improved input structural fields layout styling
  const getInputStyle = (fieldName) => ({
    width: "100%",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#1e293b",
    background: "#fff",
    border:
      activeInput === fieldName ? "1px solid #3b82f6" : "1px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    marginTop: "5px",
    marginBottom: "16px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow:
      activeInput === fieldName
        ? "0 0 0 3px rgba(59, 130, 246, 0.12)"
        : "inset 0 1px 2px rgba(0,0,0,0.01)",
  });

  const labelStyle = {
    fontSize: "12px",
    color: "#475569",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        // 🔥 CHANGED: Applied premium glass background layer
        background: "rgba(15, 23, 42, 0.3)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px",
          width: "440px",
          position: "relative",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.02)",
          boxSizing: "border-box",
        }}
      >
        {/* 🔥 CHANGED: Clean responsive absolute close switch anchor element */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "#ef4444",
            border: "1px solid #ef4444",
            color: "#fff",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.borderColor = "#ef4444";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#0f172a";
          }}
        >
          <X size={15} strokeWidth={2.5} />
        </button>

        {/* Header Block Layout */}
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.3px",
            }}
          >
            Add New Target
          </h2>
          <p
            style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}
          >
            Configure tracking endpoints for automated matrix parsing.
          </p>
        </div>

        {/* Inputs Fields Structure Grid Layout */}
        <label style={labelStyle}>
          <Building2 size={13} color="#64748b" /> Company Name{" "}
          <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
        </label>
        <input
          style={getInputStyle("name")}
          placeholder="e.g. Zomato"
          value={form.name}
          onFocus={() => setActiveInput("name")}
          onBlur={() => setActiveInput(null)}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />

        <label style={labelStyle}>
          <Globe size={13} color="#64748b" /> Website Target URL{" "}
          <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
        </label>
        <input
          style={getInputStyle("url")}
          placeholder="https://zomato.com"
          value={form.url}
          onFocus={() => setActiveInput("url")}
          onBlur={() => setActiveInput(null)}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
        />

        <label style={labelStyle}>
          <Link2 size={13} color="#64748b" /> Blog RSS Endpoint{" "}
          <span
            style={{
              fontSize: "10px",
              color: "#94a3b8",
              fontWeight: "500",
              marginLeft: "4px",
            }}
          >
            (Optional)
          </span>
        </label>
        <input
          style={getInputStyle("rss")}
          placeholder="https://blog.zomato.com/feed"
          value={form.blog_rss_url}
          onFocus={() => setActiveInput("rss")}
          onBlur={() => setActiveInput(null)}
          onChange={(e) =>
            setForm((f) => ({ ...f, blog_rss_url: e.target.value }))
          }
        />

        <label style={labelStyle}>
          <Layers size={13} color="#64748b" /> Operational Industry Sector
        </label>
        <select
          style={{
            ...getInputStyle("category"),
            cursor: "pointer",
            appearance: "none",
            backgroundImage:
              "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px top 50%",
            backgroundSize: "10px auto",
          }}
          value={form.category}
          onFocus={() => setActiveInput("category")}
          onBlur={() => setActiveInput(null)}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        >
          <option value="general">General Marketplace</option>
          <option value="food-delivery">Food Logistics & Delivery</option>
          <option value="ecommerce">Hyperlocal E-Commerce</option>
          <option value="fintech">Fintech Infrastructure</option>
          <option value="edtech">Digital EdTech Systems</option>
        </select>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              padding: "10px 12px",
              color: "#b91c1c",
              fontSize: "12px",
              fontWeight: "500",
              marginBottom: "16px",
              animation: "shake 0.2s ease-in-out",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Action Commit Trigger */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading
              ? "#94a3b8"
              : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 12px rgba(37, 99, 235, 0.2)",
            transition: "all 0.15s ease",
            marginTop: "4px",
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(37, 99, 235, 0.3)";
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(37, 99, 235, 0.2)";
            }
          }}
        >
          {loading ? "Registering Agent..." : "Deploy Target Tracking"}
        </button>
      </div>
    </div>
  );
}
