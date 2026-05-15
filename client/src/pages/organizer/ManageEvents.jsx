import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { eventAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import { Trophy, Calendar, Plus, Trash2, ArrowRight } from "lucide-react";

const LIFECYCLE = ["Draft", "RegistrationOpen", "Ongoing", "Completed"];

export default function ManageEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!user?.collegeId) return;
    try {
      setLoading(true);
      const res = await eventAPI.getByCollege(user.collegeId);
      setEvents(res.data || []);
    } catch {
      showToast("Failed to load events.", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.collegeId, showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const nextStatus = (current) => {
    const i = LIFECYCLE.indexOf(current);
    return LIFECYCLE[i + 1] || null;
  };

  const advanceStatus = async (id, currentStatus) => {
    const status = nextStatus(currentStatus);
    if (!status) return;
    try {
      setUpdating(true);
      await eventAPI.updateStatus(id, status);
      showToast(`Event moved to ${status}`, "success");
      fetchEvents();
      setSelected(null);
    } catch {
      showToast("Failed to update status.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event? This will also remove all linked sports.")) return;
    try {
      await eventAPI.delete(id);
      showToast("Event deleted successfully", "success");
      fetchEvents();
    } catch {
      showToast("Failed to delete event.", "error");
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p>Loading your events...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🗂️ Manage Events</h1>
        <p className="page-subtitle">Control lifecycle and details for {user?.collegeName}.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Button variant="primary" onClick={() => navigate("/create-event")}>
          <Plus size={16} style={{ marginRight: 6 }} /> Create New Event
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map((ev, i) => (
          <div key={ev.id} className="card animate-fade-in-up" style={{ padding: 20, animationDelay: `${i * 60}ms` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{ev.name}</h3>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted)", flexWrap: "wrap" }}>
                  <span>📅 {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "TBA"} – {ev.endDate ? new Date(ev.endDate).toLocaleDateString() : "TBA"}</span>
                  <span>📍 {ev.location || "On Campus"}</span>
                </div>
              </div>

              <Badge status={ev.status} dot />

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="ghost" size="sm" onClick={() => setSelected(ev)}>
                  Details
                </Button>
                {nextStatus(ev.status) && (
                  <Button variant="outline" size="sm" onClick={() => advanceStatus(ev.id, ev.status)} loading={updating}>
                    Advance →
                  </Button>
                )}
                {ev.status === "Draft" || ev.status === "RegistrationOpen" ? (
                   <Button variant="danger" size="sm" onClick={() => deleteEvent(ev.id)}>
                     <Trash2 size={14} />
                   </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <p>You haven't created any events yet.</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ""} size="md">
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Badge status={selected.status} dot />
              <Badge variant="player">Official Event</Badge>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selected.description || "No description provided."}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Start Date", value: selected.startDate ? new Date(selected.startDate).toLocaleDateString() : "TBA" },
                { label: "End Date",   value: selected.endDate ? new Date(selected.endDate).toLocaleDateString() : "TBA"   },
                { label: "Location",   value: selected.location || "Main Campus" },
                { label: "Sports",     value: selected.sports?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
                </div>
              ))}
            </div>

            {selected.sports?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Included Sports</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selected.sports.map(s => (
                    <div key={s.sportId} style={{ padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          🕒 {s.startTime || "TBA"} | 📅 {s.startDate ? new Date(s.startDate).toLocaleDateString() : "TBA"}
                        </div>
                      </div>
                      <Badge status={s.type} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Button variant="secondary" onClick={() => setSelected(null)} style={{ flex: 1 }}>Close</Button>
              {nextStatus(selected.status) && (
                <Button variant="primary" onClick={() => advanceStatus(selected.id, selected.status)} loading={updating} style={{ flex: 2 }}>
                  Move to {nextStatus(selected.status)}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
