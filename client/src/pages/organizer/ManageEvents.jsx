import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

const MOCK_EVENTS = [
  { id: 1, name: "Annual Sports Meet 2026",      status: "RegistrationOpen", startDate: "2026-05-10", endDate: "2026-05-15", sportsCount: 6 },
  { id: 2, name: "Inter-College Cricket League", status: "Ongoing",           startDate: "2026-04-20", endDate: "2026-05-05", sportsCount: 1 },
  { id: 3, name: "Summer Athletics",             status: "Draft",             startDate: "2026-06-01", endDate: "2026-06-03", sportsCount: 4 },
  { id: 4, name: "Chess Championship",           status: "Completed",         startDate: "2026-03-01", endDate: "2026-03-03", sportsCount: 1 },
];

const LIFECYCLE = ["Draft", "RegistrationOpen", "Ongoing", "Completed"];

export default function ManageEvents() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const nextStatus = (current) => {
    const i = LIFECYCLE.indexOf(current);
    return LIFECYCLE[i + 1] || null;
  };

  const advance = (id) => {
    setEvents(evs => evs.map(e => e.id === id ? { ...e, status: nextStatus(e.status) } : e));
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🗂️ Manage Events</h1>
        <p className="page-subtitle">Control event lifecycle, sports and details.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Button variant="primary" onClick={() => navigate("/create-event")}>+ Create New Event</Button>
      </div>

      {/* Lifecycle banner */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14,
        padding: "16px 20px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 0, overflowX: "auto",
      }}>
        {LIFECYCLE.map((stage, i) => (
          <div key={stage} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 120 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", margin: "0 auto 6px",
                background: `linear-gradient(135deg, var(--brand-primary), var(--brand-accent))`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#fff",
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>
                {stage === "RegistrationOpen" ? "Reg. Open" : stage}
              </div>
            </div>
            {i < LIFECYCLE.length - 1 && (
              <div style={{ flex: 0, width: 40, height: 2, background: "var(--border)" }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map((ev, i) => (
          <div key={ev.id} className="card animate-fade-in-up" style={{ padding: 20, animationDelay: `${i * 60}ms` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{ev.name}</h3>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap" }}>
                  <span>📅 {new Date(ev.startDate).toLocaleDateString()} – {new Date(ev.endDate).toLocaleDateString()}</span>
                  <span>🎯 {ev.sportsCount} sports</span>
                </div>
              </div>

              <Badge status={ev.status} dot />

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="secondary" size="sm" onClick={() => setSelected(ev)}>
                  📊 Details
                </Button>
                {nextStatus(ev.status) && (
                  <Button variant="primary" size="sm" onClick={() => advance(ev.id)}>
                    → Move to {nextStatus(ev.status) === "RegistrationOpen" ? "Reg. Open" : nextStatus(ev.status)}
                  </Button>
                )}
                {ev.status === "Draft" && (
                  <Button variant="danger" size="sm">🗑️ Delete</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ""} size="md">
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge status={selected.status} dot />
              <Badge variant="player">{selected.sportsCount} Sports</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Start Date", value: new Date(selected.startDate).toLocaleDateString() },
                { label: "End Date",   value: new Date(selected.endDate).toLocaleDateString()   },
                { label: "Sports",     value: selected.sportsCount },
                { label: "Status",     value: selected.status },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Button variant="secondary" onClick={() => setSelected(null)} style={{ flex: 1 }}>Close</Button>
              {nextStatus(selected.status) && (
                <Button variant="primary" onClick={() => { advance(selected.id); setSelected(null); }} style={{ flex: 2 }}>
                  Advance to {nextStatus(selected.status) === "RegistrationOpen" ? "Reg. Open" : nextStatus(selected.status)}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
