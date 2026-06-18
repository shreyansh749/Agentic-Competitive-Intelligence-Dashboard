import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("All fields required");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await login(form.email, form.password);
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    width: "100%",
    padding: "11px 14px 11px 40px",
    background: "#fff", // Fixed explicit layout canvas error
    border:
      focusedField === fieldName ? "1px solid #2563eb" : "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: "500",
    outline: "none",
    boxSizing: "border-box",
    color: "#0f172a",
    transition: "all 0.15s ease",
    boxShadow:
      focusedField === fieldName ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background:
          "radial-gradient(at 0% 0%, rgba(243, 244, 246, 1) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(239, 246, 255, 1) 0, transparent 50%), #f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px",
          width: 400,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: 28,
              marginBottom: 8,
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.05))",
            }}
          >
            🔍
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Competitive Intel
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              marginTop: 6,
              fontWeight: "500",
            }}
          >
            Sign in to your dashboard console
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: "500",
              color: "#b91c1c",
              marginBottom: 20,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 18 }}>
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
              size={14}
              color={focusedField === "email" ? "#2563eb" : "#94a3b8"}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                transition: "color 0.15s",
              }}
            />
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={getInputStyle("email")}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              display: "block",
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Lock
              size={14}
              color={focusedField === "password" ? "#2563eb" : "#94a3b8"}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                transition: "color 0.15s",
              }}
            />
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={getInputStyle("password")}
            />
            <button
              onClick={() => setShowPass((s) => !s)}
              type="button"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Submit */}
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
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: loading ? "none" : "0 4px 12px rgba(37, 99, 235, 0.2)",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            if (!loading) e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <LogIn size={15} strokeWidth={2.5} />
          {loading ? "Authenticating..." : "Sign In"}
        </button>

        {/* Signup link */}
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#64748b",
            marginTop: 24,
            fontWeight: "500",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "#2563eb",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
