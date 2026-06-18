import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  ArrowLeft,
  Save,
  LogOut,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({ name });
      setMsg("Profile updated successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(at 0% 0%, rgba(243, 244, 246, 1) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(239, 246, 255, 1) 0, transparent 50%), #f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Top Header Navbar */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          padding: "14px 40px",
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            fontSize: "13px",
            fontWeight: "600",
            color: "#475569",
            cursor: "pointer",
            transition: "all 0.15s ease",
            padding: "6px 12px",
            borderRadius: "8px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#475569";
          }}
        >
          <ArrowLeft size={15} strokeWidth={2.5} /> Back to Dashboard
        </button>
      </div>

      {/* Main Body Grid Container */}
      <div
        style={{ maxWidth: 940, margin: "0 auto", padding: "40px 24px 60px" }}
      >
        {/* Modern Two-Column Split Layout Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "240px 1fr",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN: Modern Compact Profile Avatar Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              border: "1px solid rgba(226, 232, 240, 0.8)",
              padding: "32px 20px",
              textAlign: "center",
              boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.02)",
              position: "sticky",
              top: "90px",
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                margin: "0 auto 18px",
                boxShadow: "0 10px 25px -5px rgba(29, 78, 216, 0.25)",
                border: "4px solid #f8fafc",
              }}
            >
              {initials}
            </div>

            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 6px 0",
                letterSpacing: "-0.4px",
                lineHeight: "1.3",
              }}
            >
              {user?.name}
            </h2>

            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: user?.role === "admin" ? "#b45309" : "#2563eb",
                background: user?.role === "admin" ? "#fef3c7" : "#eff6ff",
                padding: "4px 10px",
                borderRadius: 99,
                border: `1px solid ${user?.role === "admin" ? "#fde68a" : "#dbeafe"}`,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <Shield size={11} />
              {user?.role === "admin" ? "Admin" : "Member"}
            </div>
          </div>

          {/* RIGHT COLUMN: Configuration Form Blocks */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Account Details Panel */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(226, 232, 240, 0.8)",
                padding: "32px",
                boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.02)",
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 24px 0",
                  letterSpacing: "-0.2px",
                }}
              >
                Account Information
              </h3>

              {/* Input: Name */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#475569",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Username
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    color={isFocused ? "#2563eb" : "#94a3b8"}
                    size={14}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      transition: "color 0.15s ease",
                      zIndex: 10,
                    }}
                  />
                  <input
                    value={name}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px 11px 38px",
                      background: "#fff", // Fixed dark theme canvas bug from image_28aa03.jpg
                      border: isFocused
                        ? "1px solid #2563eb"
                        : "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: "500",
                      outline: "none",
                      boxSizing: "border-box",
                      color: "#0f172a",
                      transition: "all 0.15s ease",
                      boxShadow: isFocused
                        ? "0 0 0 3px rgba(37, 99, 235, 0.12)"
                        : "none",
                    }}
                  />
                </div>
              </div>

              {/* Input: Email */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#475569",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    color="#cbd5e1"
                    size={14}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    value={user?.email || ""}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "11px 14px 11px 38px",
                      border: "1px solid #f1f5f9",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: "500",
                      outline: "none",
                      boxSizing: "border-box",
                      color: "#94a3b8",
                      background: "#f8fafc",
                      cursor: "not-allowed",
                    }}
                  />
                </div>
              </div>

              {/* Metadata Timeline */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#64748b",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  padding: "8px 14px",
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <Calendar color="#64748b" size={13} />
                <span>Member Since:</span>
                <span style={{ color: "#0f172a" }}>
                  {user?.createdAt
                    ? format(new Date(user.createdAt), "dd MMM yyyy")
                    : "—"}
                </span>
              </div>

              {msg && (
                <div
                  style={{
                    background: msg.includes("Failed") ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${msg.includes("Failed") ? "#fca5a5" : "#bbf7d0"}`,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: "500",
                    color: msg.includes("Failed") ? "#b91c1c" : "#16a34a",
                    marginBottom: 20,
                  }}
                >
                  {msg.includes("Failed") ? "🚨" : "✨"} {msg}
                </div>
              )}

              <div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: saving
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: saving
                      ? "none"
                      : "0 4px 12px rgba(37, 99, 235, 0.2)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    if (!saving)
                      e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseOut={(e) => {
                    if (!saving)
                      e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Save size={14} strokeWidth={2.5} />
                  {saving ? "Updating Parameters..." : "save changes"}
                </button>
              </div>
            </div>

            {/* Session Actions Panel */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(226, 232, 240, 0.8)",
                padding: "24px 32px",
                boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.02)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fef2f2",
                  color: "#ef4444",
                  border: "1px solid #fee2e2",
                  borderRadius: 8,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#ef4444";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "#ef4444";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#fef2f2";
                  e.currentTarget.style.color = "#ef4444";
                  e.currentTarget.style.borderColor = "#fee2e2";
                }}
              >
                <LogOut size={14} strokeWidth={2.5} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
