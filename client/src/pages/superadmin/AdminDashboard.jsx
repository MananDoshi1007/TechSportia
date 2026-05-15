import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { collegeAPI, userAPI, eventAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();


  const [colleges, setColleges] = useState([]);
  const [users, setUsers] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalEvents: 0, totalSports: 0, ongoingEvents: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [collRes, userRes, statsRes] = await Promise.all([
        collegeAPI.getAll().catch(() => ({ data: [] })),
        userAPI.getAll().catch(() => ({ data: [] })),
        eventAPI.getGlobalStats().catch(() => ({ data: { totalEvents: 0, totalSports: 0, ongoingEvents: 0 } }))
      ]);

      setColleges(collRes.data || []);
      setUsers(userRes.data || []);
      setGlobalStats(statsRes.data);
    } catch {
      showToast("Could not sync with database.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate Stats
  const stats = {
    totalColleges: colleges.length,
    approvedColleges: colleges.filter(c => c.isApproved === true).length,
    pendingColleges: colleges.filter(c => c.isApproved === false || c.isApproved === null).length,
    totalUsers: users.length,
    totalEvents: globalStats.totalEvents,
    ongoingEvents: globalStats.ongoingEvents
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p>Syncing dashboard stats...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🛡️ Admin Dashboard</h1>
        <p className="page-subtitle">Platform-wide overview and management.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard icon="🏫" label="Total Colleges" value={stats.totalColleges} color="primary" delay={0} />
        <StatCard icon="✅" label="Approved" value={stats.approvedColleges} color="success" delay={100} />
        <StatCard icon="⏳" label="Pending" value={stats.pendingColleges} color="warning" delay={200} />
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="accent" delay={300} />
        <StatCard icon="🏆" label="Total Events" value={stats.totalEvents} color="primary" delay={400} />
        <StatCard icon="🔥" label="Ongoing" value={stats.ongoingEvents} color="success" delay={500} />
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gap: 20 }}>
        <div className="card-static" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>🏫 Recent Colleges</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/colleges")}>Manage All →</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {colleges.slice(0, 4).map((c, i) => (
              <div key={c.collegeId} className="animate-fade-in-up" style={{
                background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px",
                border: "1px solid var(--border)", display: "flex", justifyContent: "space-between",
                alignItems: "center", animationDelay: `${i * 60}ms`,
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>📧 {c.email || "No email"}</p>
                </div>
                <Badge status={c.isApproved ? "Approved" : "Pending"} dot />
              </div>
            ))}
            {colleges.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No colleges registered yet.</p>}
          </div>
        </div>

        <div className="card-static" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>🔔 Activity Feed</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { time: "Just now", msg: "Dashboard synced with SQL Database", icon: "🔗" },
              { time: "Today", msg: `Identified ${stats.totalUsers} registered users`, icon: "👥" },
              { time: "Today", msg: `Monitoring ${stats.totalColleges} colleges`, icon: "🏢" },
            ].map((a, i) => (
              <div key={i} className="animate-fade-in-up" style={{
                display: "flex", gap: 12, padding: "8px 0",
                borderBottom: i < 2 ? "1px solid var(--border)" : "none",
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

      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>⚡ Quick Management</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { icon: "🏫", label: "Colleges", to: "/admin/colleges" },
            { icon: "👥", label: "Users", to: "/admin/users" },
            { icon: "🏆", label: "Events", to: "/events" },
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
