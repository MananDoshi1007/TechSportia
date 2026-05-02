import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

const MOCK_EVENTS = [
  { id: 1, name: "Annual Sports Meet 2026", status: "RegistrationOpen", startDate: "2026-05-10", sportsCount: 6, teamsCount: 12, pendingTeams: 3 },
  { id: 2, name: "Inter-College Cricket League", status: "Ongoing", startDate: "2026-04-20", sportsCount: 1, teamsCount: 8, pendingTeams: 0 },
  { id: 3, name: "Summer Athletics Championship", status: "Draft", startDate: "2026-06-01", sportsCount: 4, teamsCount: 0, pendingTeams: 0 },
];

const ACTIVITY = [
  { time: "2h ago",  msg: "Team 'CHARUSAT Tigers' applied for Cricket",   icon: "👥" },
  { time: "5h ago",  msg: "Arjun Mehta registered for Badminton",          icon: "🏸" },
  { time: "1d ago",  msg: "Score updated for Cricket Semi-Final",          icon: "📊" },
  { time: "2d ago",  msg: "Annual Sports Meet moved to Registration Open", icon: "🟢" },
];

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="page-subtitle">Manage your college sports events from here.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="🏆" label="Total Events"    value={MOCK_EVENTS.length}  color="primary" delay={0}   />
        <StatCard icon="🟢" label="Active Events"   value={2}                   color="success" delay={100} />
        <StatCard icon="👥" label="Total Teams"     value={20}                  color="accent"  delay={200} />
        <StatCard icon="⏳" label="Pending Approvals" value={3}                 color="warning" delay={300} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        {/* My Events */}
        <div className="card-static" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>🏆 My Events</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => navigate("/my-events")}>View All</Button>
              <Button variant="primary" size="sm" onClick={() => navigate("/create-event")}>+ Create</Button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOCK_EVENTS.map((ev, i) => (
              <div key={ev.id} className="animate-fade-in-up" style={{
                background: "var(--bg-elevated)", borderRadius: 12, padding: "14px 16px",
                border: "1px solid var(--border)", animationDelay: `${i * 60}ms`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{ev.name}</p>
                  <Badge status={ev.status} dot />
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                  <span>📅 {new Date(ev.startDate).toLocaleDateString()}</span>
                  <span>🎯 {ev.sportsCount} sports</span>
                  <span>👥 {ev.teamsCount} teams</span>
                  {ev.pendingTeams > 0 && (
                    <span style={{ color: "var(--warning)", fontWeight: 600 }}>⏳ {ev.pendingTeams} pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card-static" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>🔔 Recent Activity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} className="animate-fade-in-up" style={{
                display: "flex", gap: 12, padding: "10px 0",
                borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border)" : "none",
                animationDelay: `${i * 60}ms`,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>
                  {a.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{a.msg}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>⚡ Quick Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { icon: "➕", label: "Create Event",   to: "/create-event"   },
            { icon: "📋", label: "Manage Events",  to: "/my-events"      },
            { icon: "✅", label: "Approve Teams",  to: "/approve-teams"  },
            { icon: "📈", label: "Scoreboard",     to: "/scoreboard"     },
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
