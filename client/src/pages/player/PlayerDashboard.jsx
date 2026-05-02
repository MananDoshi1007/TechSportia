import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

const MOCK_EVENTS = [
  { id: 1, name: "Annual Sports Meet 2026", status: "RegistrationOpen", startDate: "2026-05-10", sportsCount: 6, collegeName: "CHARUSAT" },
  { id: 2, name: "Inter-College Cricket League", status: "Ongoing", startDate: "2026-04-20", sportsCount: 1, collegeName: "CHARUSAT" },
  { id: 3, name: "Summer Athletics Championship", status: "Draft", startDate: "2026-06-01", sportsCount: 4, collegeName: "CHARUSAT" },
];

const MOCK_REGS = [
  { id: 1, event: "Annual Sports Meet 2026", sport: "Badminton", type: "Individual", status: "Approved" },
  { id: 2, event: "Inter-College Cricket League", sport: "Cricket", type: "Team", status: "Pending" },
];

export default function PlayerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="page-subtitle">Here's what's happening in your sports world.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="📋" label="My Registrations" value="2" color="primary" delay={0} />
        <StatCard icon="✅" label="Approved"         value="1" color="success" delay={100} />
        <StatCard icon="⏳" label="Pending Approval" value="1" color="warning" delay={200} />
        <StatCard icon="🏅" label="Results Available" value="3" color="accent"  delay={300} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Open Events */}
        <div className="card-static" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>🏆 Events</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>View All →</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_EVENTS.map((ev) => (
              <div key={ev.id} style={{
                background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px",
                border: "1px solid var(--border)", display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 8,
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{ev.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>📅 {new Date(ev.startDate).toLocaleDateString()} &nbsp;|&nbsp; 🎯 {ev.sportsCount} sports</p>
                </div>
                <Badge status={ev.status} dot />
              </div>
            ))}
          </div>
        </div>

        {/* My Registrations */}
        <div className="card-static" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>📋 My Registrations</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/my-registrations")}>View All →</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_REGS.map((r) => (
              <div key={r.id} style={{
                background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px",
                border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{r.sport}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.event}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <Badge status={r.status} dot />
                    <Badge status={r.type} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button variant="primary" size="sm" onClick={() => navigate("/events")} style={{ marginTop: 14, width: "100%" }}>
            Browse More Events →
          </Button>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>⚡ Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { icon: "🏆", label: "Browse Events",       to: "/events"           },
            { icon: "📋", label: "My Registrations",    to: "/my-registrations" },
            { icon: "🥇", label: "View Results",        to: "/results"          },
          ].map(({ icon, label, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "18px 16px", cursor: "pointer",
                textAlign: "center", transition: "all 0.2s",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-active)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{label}</div>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
