import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const DEMOS = [
  { label: "🏃 Player",     email: "player@college.edu"   },
  { label: "🎯 Organizer",  email: "priya@college.edu"    },
  { label: "🛡️ SuperAdmin", email: "admin@techsportia.com" },
];

const FEATURES = [
  "Event lifecycle management",
  "Team & player registrations",
  "Live scores & results",
  "Role-based dashboards",
];

export default function Login() {
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      showToast("Welcome back! Login successful.", "success");
      navigate("/dashboard");
    } catch {
      showToast("Invalid credentials. Please try again.", "error");
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

          {/* Demo pills */}
          <div style={{
            marginBottom:24, padding:14,
            background:"var(--bg-elevated)", borderRadius:12,
            border:"1px solid var(--border)",
          }}>
            <p style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)",
              letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>
              🎮 Quick Demo Login
            </p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {DEMOS.map(({ label, email }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ email, password:"demo1234" })}
                  style={{
                    background:"var(--bg-card)", border:"1px solid var(--border)",
                    borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:600,
                    cursor:"pointer", color:"var(--text-secondary)", transition:"all 0.2s",
                    fontFamily:"Inter, sans-serif",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--brand-primary)";e.currentTarget.style.color="var(--text-primary)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-secondary)";}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <Input
              label="Email Address"
              name="email" type="email"
              value={form.email} onChange={handle}
              placeholder="you@college.edu"
              icon={<Mail size={18} />} required
            />

            <Input
              label="Password"
              name="password"
              type={showPwd ? "text" : "password"}
              value={form.password} onChange={handle}
              placeholder="••••••••"
              icon={<Lock size={18} />}
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
              required
            />

            {/* Errors are now handled by Toast */}

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