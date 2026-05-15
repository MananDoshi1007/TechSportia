import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { eventAPI, registrationAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";

export default function PlayerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsRes, regsRes] = await Promise.all([
          eventAPI.getAll(),
          registrationAPI.getMyRegistrations()
        ]);
        // Show only open/ongoing events
        setEvents((eventsRes.data || []).filter(e => e.status === "RegistrationOpen" || e.status === "Ongoing"));
        setRegistrations(regsRes.data || []);
      } catch {
        showToast("Failed to load dashboard data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  const approved = registrations.filter(r => r.isApproved).length;
  const pending  = registrations.filter(r => !r.isApproved).length;

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

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
        <StatCard icon="📋" label="My Registrations" value={registrations.length} color="primary" delay={0} />
        <StatCard icon="✅" label="Approved"         value={approved}              color="success" delay={100} />
        <StatCard icon="⏳" label="Pending Approval" value={pending}               color="warning" delay={200} />
        <StatCard icon="🏆" label="Open Events"      value={events.length}         color="accent"  delay={300} />
      </div>

      <div className="grid-2">
        {/* Open Events */}
        <div className="card-static" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>🏆 Open Events</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>View All →</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {events.slice(0, 4).map((ev) => (
              <div key={ev.id} style={{
                background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px",
                border: "1px solid var(--border)", display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 8,
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{ev.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>📅 {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "TBA"} &nbsp;|&nbsp; 🏫 {ev.collegeName}</p>
                </div>
                <Badge status={ev.status} dot />
              </div>
            ))}
            {events.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                <p style={{ fontSize: 14 }}>No open events right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* My Registrations */}
        <div className="card-static" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>📋 My Registrations</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/my-registrations")}>View All →</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {registrations.slice(0, 4).map((r, i) => (
              <div key={i} style={{
                background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px",
                border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{r.sportName}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.eventName}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <Badge status={r.isDraft ? "Draft" : (r.isApproved ? "Approved" : "Pending")} dot />
                    <Badge status={r.type} />
                  </div>
                </div>
              </div>
            ))}
            {registrations.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                <p style={{ fontSize: 14 }}>No registrations yet.</p>
              </div>
            )}
          </div>

          <Button variant="primary" size="sm" onClick={() => navigate("/events")} style={{ marginTop: 14, width: "100%" }}>
            Browse Events & Register →
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
