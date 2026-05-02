import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import StatCard from "../../components/common/StatCard";

const MOCK_TEAMS = [
  { id: 1, teamName: "CHARUSAT Tigers",  sport: "Cricket",    event: "Annual Sports Meet 2026", captain: "Rahul Shah",   members: 11, status: "Pending"  },
  { id: 2, teamName: "Night Owls",       sport: "Football",   event: "Annual Sports Meet 2026", captain: "Dev Trivedi",  members: 7,  status: "Pending"  },
  { id: 3, teamName: "Smash Bros",       sport: "Badminton",  event: "Annual Sports Meet 2026", captain: "Sneha Joshi",  members: 2,  status: "Approved" },
  { id: 4, teamName: "Fast Runners",     sport: "Cricket",    event: "Annual Sports Meet 2026", captain: "Aman Patel",   members: 9,  status: "Rejected" },
];

export default function ApproveTeams() {
  const [teams, setTeams] = useState(MOCK_TEAMS);
  const [filter, setFilter] = useState("All");

  const setStatus = (id, status) => {
    setTeams(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  };

  const filtered = filter === "All" ? teams : teams.filter(t => t.status === filter);
  const pending  = teams.filter(t => t.status === "Pending").length;
  const approved = teams.filter(t => t.status === "Approved").length;
  const rejected = teams.filter(t => t.status === "Rejected").length;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">✅ Approve Teams</h1>
        <p className="page-subtitle">Review and approve team registrations for your events.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon="⏳" label="Pending"  value={pending}          color="warning" delay={0}   />
        <StatCard icon="✅" label="Approved" value={approved}         color="success" delay={100} />
        <StatCard icon="❌" label="Rejected" value={rejected}         color="danger"  delay={200} />
        <StatCard icon="👥" label="Total"    value={teams.length}     color="primary" delay={300} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["All", "Pending", "Approved", "Rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${filter === f ? "var(--brand-primary)" : "var(--border)"}`,
              background: filter === f ? "var(--brand-primary-light)" : "var(--bg-elevated)",
              color: filter === f ? "var(--brand-primary)" : "var(--text-secondary)",
              transition: "all 0.2s", fontFamily: "Inter, sans-serif",
            }}
          >
            {f} {f !== "All" && <span style={{ opacity: 0.7 }}>({teams.filter(t => t.status === f).length})</span>}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((t, i) => (
          <div key={t.id} className="card animate-fade-in-up" style={{ padding: 20, animationDelay: `${i * 60}ms` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {/* Team icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: "var(--brand-primary-light)", border: "1px solid rgba(124,58,237,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                👥
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 160 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{t.teamName}</h3>
                <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap" }}>
                  <span>🎯 {t.sport}</span>
                  <span>🏆 {t.event}</span>
                  <span>👤 Captain: {t.captain}</span>
                  <span>👥 {t.members} members</span>
                </div>
              </div>

              <Badge status={t.status} dot />

              {/* Actions */}
              {t.status === "Pending" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="success" size="sm" onClick={() => setStatus(t.id, "Approved")}>
                    ✓ Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setStatus(t.id, "Rejected")}>
                    ✕ Reject
                  </Button>
                </div>
              )}
              {t.status === "Approved" && (
                <Button variant="danger" size="sm" onClick={() => setStatus(t.id, "Rejected")}>Revoke</Button>
              )}
              {t.status === "Rejected" && (
                <Button variant="success" size="sm" onClick={() => setStatus(t.id, "Approved")}>Re-approve</Button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>No {filter.toLowerCase()} teams</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
