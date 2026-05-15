import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { eventAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import { Trophy, Activity, Users, Clock, Plus, Bell } from "lucide-react";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, activeEvents: 0, totalParticipants: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.collegeId) return;
    try {
      setLoading(true);
      const [eventsRes, statsRes] = await Promise.all([
        eventAPI.getByCollege(user.collegeId),
        eventAPI.getOrganizerStats()
      ]);
      setEvents(eventsRes.data || []);
      setStats({
        totalEvents: statsRes.data.totalEvents,
        activeEvents: statsRes.data.activeEvents,
        totalParticipants: statsRes.data.totalParticipants,
        pendingApprovals: statsRes.data.pendingApprovals
      });
    } catch {
      showToast("Failed to fetch dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.collegeId, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p>Syncing organizer stats...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="page-subtitle">Manage {user?.collegeName || "your college"} sports events from here.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon={<Trophy size={20}/>} label="My Events"    value={stats.totalEvents}  color="primary" delay={0}   />
        <StatCard icon={<Activity size={20}/>} label="Live/Open"   value={stats.activeEvents} color="success" delay={100} />
        <StatCard icon={<Users size={20}/>} label="Participants"     value={stats.totalParticipants}                  color="accent"  delay={200} />
        <StatCard icon={<Clock size={20}/>} label="Pending Reqs" value={stats.pendingApprovals}                 color="warning" delay={300} />
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gap: 20 }}>
        {/* My Events Summary */}
        <div className="card-static" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>🏆 Recent Events</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => navigate("/my-events")}>View All</Button>
              <Button variant="primary" size="sm" onClick={() => navigate("/create-event")}>
                <Plus size={14} style={{ marginRight: 4 }} /> Create New
              </Button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {events.slice(0, 4).map((ev, i) => (
              <div key={ev.id} className="animate-fade-in-up" style={{
                background: "var(--bg-elevated)", borderRadius: 12, padding: "14px 16px",
                border: "1px solid var(--border)", animationDelay: `${i * 60}ms`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{ev.name}</p>
                  <Badge status={ev.status} dot />
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                  <span>📅 {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "TBA"}</span>
                  <span>📍 {ev.location || "On Campus"}</span>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <p style={{ fontSize: 14 }}>No events created yet.</p>
                <Button variant="ghost" size="sm" onClick={() => navigate("/create-event")} style={{ marginTop: 12 }}>Create your first event</Button>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card-static" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>🔔 Platform Updates</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { time: "Just now", msg: "Dashboard connected to SQL Server", icon: <Activity size={14}/> },
              { time: "Today", msg: `Synced ${events.length} events for ${user?.collegeName}`, icon: <Trophy size={14}/> },
            ].map((a, i) => (
              <div key={i} className="animate-fade-in-up" style={{
                display: "flex", gap: 12, padding: "10px 0",
                borderBottom: i < 1 ? "1px solid var(--border)" : "none",
                animationDelay: `${i * 60}ms`,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  color: "var(--brand-primary)"
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
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>⚡ Management Tools</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { icon: "➕", label: "Create Event",   to: "/create-event"   },
            { icon: "📋", label: "Manage Events",  to: "/my-events"      },
            { icon: "✅", label: "Verification",   to: "/approve-participants"  },
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
