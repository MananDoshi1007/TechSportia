import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

const MOCK_COLLEGES = [
  { id: 1, name: "CHARUSAT University",  events: 4, users: 120, status: "Approved" },
  { id: 2, name: "Nirma University",     events: 2, users: 85,  status: "Approved" },
  { id: 3, name: "DDIT",                events: 1, users: 40,  status: "Approved" },
  { id: 4, name: "GTU",                 events: 0, users: 0,   status: "Pending"  },
];

const ACTIVITY = [
  { time: "30m ago", msg: "GTU requested platform access",                  icon: "🏫" },
  { time: "2h ago",  msg: "Priya Sharma promoted to Organizer at CHARUSAT", icon: "⬆️" },
  { time: "1d ago",  msg: "Nirma University created 'Futsal Fiesta'",       icon: "🏆" },
  { time: "2d ago",  msg: "New user registration spike: +23 players",       icon: "👥" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🛡️ Admin Dashboard</h1>
        <p className="page-subtitle">Platform-wide overview and management.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="🏫" label="Total Colleges" value={MOCK_COLLEGES.length}                        color="primary" delay={0}   />
        <StatCard icon="✅" label="Approved"        value={MOCK_COLLEGES.filter(c=>c.status==="Approved").length} color="success" delay={100} />
        <StatCard icon="⏳" label="Pending"         value={MOCK_COLLEGES.filter(c=>c.status==="Pending").length}  color="warning" delay={200} />
        <StatCard icon="👥" label="Total Users"     value={245}                                        color="accent"  delay={300} />
        <StatCard icon="🏆" label="Total Events"    value={7}                                          color="primary" delay={400} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* Colleges summary */}
        <div className="card-static" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>🏫 Colleges</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/colleges")}>Manage All →</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_COLLEGES.map((c, i) => (
              <div key={c.id} className="animate-fade-in-up" style={{
                background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px",
                border: "1px solid var(--border)", display: "flex", justifyContent: "space-between",
                alignItems: "center", animationDelay: `${i * 60}ms`,
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>🏆 {c.events} events &nbsp;·&nbsp; 👥 {c.users} users</p>
                </div>
                <Badge status={c.status} dot />
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="card-static" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>🔔 Platform Activity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} className="animate-fade-in-up" style={{
                display: "flex", gap: 12, padding: "8px 0",
                borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border)" : "none",
                animationDelay: `${i * 60}ms`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                }}>
                  {a.icon}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>{a.msg}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin quick actions */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>⚡ Admin Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { icon: "🏫", label: "Manage Colleges", to: "/admin/colleges" },
            { icon: "👥", label: "Manage Users",    to: "/admin/users"    },
            { icon: "🏆", label: "All Events",      to: "/events"         },
          ].map(({ icon, label, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12,
                padding: "18px 16px", cursor: "pointer", textAlign: "center",
                transition: "all 0.2s", fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-active)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{label}</div>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
