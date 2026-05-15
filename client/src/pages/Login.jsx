import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const FEATURES = [
  "Event lifecycle management",
  "Team & player registrations",
  "Live scores & results",
  "Role-based dashboards",
];

export default function Login() {
  const { user, login, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field error on typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (serverError) setServerError("");
  };

  // ── Client-side validation ──
  const validate = () => {
    const e = {};

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address";
    }

    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      showToast("Please fix the errors in the form.", "warning");
      return;
    }

    const result = await login(form.email, form.password);

    if (result.success) {
      showToast("Welcome back! Login successful.", "success");
      navigate("/dashboard");
    } else {
      setServerError(result.message);
      showToast(result.message, "error");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "var(--bg-primary)", overflow: "hidden",
    }}>

      {/* ── Left brand panel (hidden on mobile) ── */}
      <div style={{
        flex: "0 0 400px", position: "relative", overflow: "hidden",
        background: "var(--bg-secondary)", borderRight: "1px solid var(--border)",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: 48, gap: 28, display: "flex",
      }}
        className="hidden md:flex"
      >
        {/* orbs */}
        <div style={{ position:"absolute",width:400,height:400,top:-80,left:-80,borderRadius:"50%",
          filter:"blur(80px)",opacity:0.12,background:"var(--brand-primary)",pointerEvents:"none" }} />
        <div style={{ position:"absolute",width:250,height:250,bottom:-60,right:-60,borderRadius:"50%",
          filter:"blur(80px)",opacity:0.1,background:"var(--brand-accent)",pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:320 }}>
          {/* Logo */}
          <div style={{
            width:72, height:72, borderRadius:20, margin:"0 auto 24px",
            background:"var(--brand-gradient)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:36, boxShadow:"0 8px 32px rgba(124,58,237,0.4)",
          }}>🏆</div>

          <h1 style={{ fontSize:30, fontWeight:900, color:"var(--text-primary)", marginBottom:10 }}>
            TechSportia
          </h1>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:32 }}>
            The all-in-one platform for managing college sports events, teams, and results.
          </p>

          {/* Feature list */}
          {FEATURES.map((f) => (
            <div key={f} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"10px 14px", marginBottom:8,
              background:"var(--bg-card)", borderRadius:10,
              border:"1px solid var(--border)", textAlign:"left",
            }}>
              <span style={{ color:"var(--success)", flexShrink:0, fontWeight:700 }}>✓</span>
              <span style={{ fontSize:13, color:"var(--text-secondary)" }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Login form ── */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"48px 24px", minWidth:0,
      }}>
        <div className="animate-fade-in-up" style={{ width:"100%", maxWidth:420 }}>

          {/* Mobile logo */}
          <div style={{ textAlign:"center", marginBottom:32 }} className="md:hidden">
            <div style={{
              width:52, height:52, borderRadius:14, margin:"0 auto 12px",
              background:"var(--brand-gradient)", fontSize:28,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>🏆</div>
            <h2 style={{ fontWeight:800, fontSize:22, color:"var(--text-primary)" }}>TechSportia</h2>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:26, fontWeight:800, color:"var(--text-primary)", marginBottom:6 }}>
              Welcome back 👋
            </h2>
            <p style={{ fontSize:14, color:"var(--text-secondary)" }}>
              Sign in to your TechSportia account
            </p>
          </div>

          {/* Server error banner */}
          {serverError && (
            <div style={{
              marginBottom: 20,
              padding: "12px 16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "var(--danger)",
              animation: "fadeInUp 0.3s ease",
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Input
              label="Email Address"
              name="email" type="text"
              value={form.email} onChange={handle}
              placeholder="you@college.edu"
              icon={<Mail size={18} />}
              error={errors.email}
              showAsterisk={true}
            />

            <Input
              label="Password"
              name="password"
              type={showPwd ? "text" : "password"}
              value={form.password} onChange={handle}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.password}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              showAsterisk={true}
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} style={{ marginTop:4 }}>
              Sign In
            </Button>
          </form>

          <p style={{ textAlign:"center", marginTop:24, fontSize:14, color:"var(--text-secondary)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color:"var(--brand-primary)", fontWeight:600, textDecoration:"none" }}>
              Register →
            </Link>
          </p>
          <p style={{ textAlign:"center", marginTop:10, fontSize:12 }}>
            <Link to="/" style={{ color:"var(--text-muted)", textDecoration:"none" }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}