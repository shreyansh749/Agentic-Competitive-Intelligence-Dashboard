import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff, User, Mail, Lock } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async () => {
    console.log("front 1");
    if (!form.name || !form.email || !form.password) {
      setError("All fields required");
      return;
    }
    console.log("front 2");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    console.log("front 3");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await signup(form.name, form.email, form.password);
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    width: "100%",
    padding: "11px 14px 11px 40px",
    background: "#fff", // Fixed canvas overlay dynamic error mapping Screenshot (462).png
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

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "#475569",
    display: "block",
    marginBottom: 6,
  };

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
          width: 420,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
        }}
      >
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
            Create Account
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              marginTop: 6,
              fontWeight: "500",
            }}
          >
            Start tracking your competitors system profiles
          </p>
        </div>

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

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Full Name</label>
          <div style={{ position: "relative" }}>
            <User
              size={14}
              color={focusedField === "name" ? "#2563eb" : "#94a3b8"}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                transition: "color 0.15s",
              }}
            />
            <input
              style={getInputStyle("name")}
              placeholder="John Doe"
              value={form.name}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email Address</label>
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
              style={getInputStyle("email")}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Password</label>
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
              style={getInputStyle("password")}
              type={showPass ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={form.password}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
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

        {/* Confirm */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Confirm Password</label>
          <div style={{ position: "relative" }}>
            <Lock
              size={14}
              color={focusedField === "confirm" ? "#2563eb" : "#94a3b8"}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                transition: "color 0.15s",
              }}
            />
            <input
              style={getInputStyle("confirm")}
              type="password"
              placeholder="Re-enter password"
              value={form.confirm}
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField(null)}
              onChange={(e) =>
                setForm((f) => ({ ...f, confirm: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>

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
          <UserPlus size={15} strokeWidth={2.5} />
          {loading
            ? "Creating platform profile..."
            : "Create Account"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#64748b",
            marginTop: 24,
            fontWeight: "500",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#2563eb",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
