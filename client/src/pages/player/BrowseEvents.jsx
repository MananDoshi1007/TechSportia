import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { LayoutGrid, Play, CheckCircle, FileText, Calendar, Search } from "lucide-react";

const MOCK_EVENTS = [
  { id: 1, name: "Annual Sports Meet 2026", collegeName: "CHARUSAT University", status: "RegistrationOpen", startDate: "2026-05-10", endDate: "2026-05-15", sportsCount: 6, description: "The biggest annual sports event featuring cricket, football, badminton, chess and more." },
  { id: 2, name: "Inter-College Cricket League", collegeName: "CHARUSAT University", status: "Ongoing", startDate: "2026-04-20", endDate: "2026-05-05", sportsCount: 1, description: "A 20-over cricket tournament between top college teams." },
  { id: 3, name: "Summer Athletics Championship", collegeName: "CHARUSAT University", status: "Draft", startDate: "2026-06-01", endDate: "2026-06-03", sportsCount: 4, description: "Track and field events including 100m sprint, long jump, javelin and more." },
  { id: 4, name: "Futsal Fiesta", collegeName: "Nirma University", status: "RegistrationOpen", startDate: "2026-05-20", endDate: "2026-05-22", sportsCount: 1, description: "5-a-side indoor football tournament open to all college students." },
  { id: 5, name: "Badminton Open", collegeName: "DDIT", status: "Completed", startDate: "2026-03-10", endDate: "2026-03-12", sportsCount: 1, description: "Singles and doubles badminton tournament." },
];

export default function BrowseEvents() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRegisterClick = (ev) => {
    if (!user) {
      navigate("/login");
    } else {
      // Registration logic here (future)
      alert(`Registering for ${ev.name}`);
    }
  };

  const filtered = MOCK_EVENTS.filter((ev) => {
    const matchFilter = filter === "All" || ev.status === filter;
    const matchSearch = ev.name.toLowerCase().includes(search.toLowerCase()) ||
                        ev.collegeName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = [
    { id: "All",              label: "Total Events", value: MOCK_EVENTS.length, icon: <LayoutGrid size={20} />, color: "primary" },
    { id: "RegistrationOpen", label: "Open for Reg.",value: MOCK_EVENTS.filter(e => e.status === "RegistrationOpen").length, icon: <Calendar size={20} />, color: "success" },
    { id: "Ongoing",          label: "Ongoing",       value: MOCK_EVENTS.filter(e => e.status === "Ongoing").length, icon: <Play size={20} />, color: "accent" },
    { id: "Completed",        label: "Completed",     value: MOCK_EVENTS.filter(e => e.status === "Completed").length, icon: <CheckCircle size={20} />, color: "warning" },
    { id: "Draft",            label: "Drafts",        value: MOCK_EVENTS.filter(e => e.status === "Draft").length, icon: <FileText size={20} />, color: "danger" },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🏆 Browse Events</h1>
        <p className="page-subtitle">Discover and register for sports events near you.</p>
      </div>

      {/* Interactive Stats row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
        gap: 16, 
        marginBottom: 28 
      }}>
        {stats.map((s, i) => (
          <StatCard
            key={s.id}
            id={s.id}
            label={s.label}
            value={s.value}
            icon={s.icon}
            color={s.color}
            delay={i * 50}
            onClick={() => setFilter(s.id)}
            active={filter === s.id}
          />
        ))}
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>
            <Search size={18} />
          </span>
          <input
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events or colleges…"
            style={{ paddingLeft: 42 }}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>No events found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((ev, i) => (
            <div key={ev.id} className="card animate-fade-in-up" style={{ overflow: "hidden", animationDelay: `${i * 60}ms` }}>
              <div style={{ height: 4, background: ev.status === "RegistrationOpen" ? "var(--brand-gradient)" : "var(--border)" }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, flex: 1, marginRight: 8 }}>{ev.name}</h3>
                  <Badge status={ev.status} dot />
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>🏫 {ev.collegeName}</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {ev.description}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[
                    { icon: "📅", label: "Start", value: new Date(ev.startDate).toLocaleDateString() },
                    { icon: "🎯", label: "Sports", value: ev.sportsCount },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ background: "var(--bg-elevated)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{icon} {label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(ev)} style={{ flex: 1 }}>Details</Button>
                  {ev.status === "RegistrationOpen" && (
                    <Button 
                      variant={user ? "primary" : "secondary"} 
                      size="sm" 
                      style={{ flex: 1 }}
                      onClick={() => handleRegisterClick(ev)}
                    >
                      {user ? "Register →" : "Login to Register"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ""} size="md">
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge status={selected.status} dot />
              <Badge variant="player">{selected.sportsCount} Sports</Badge>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{selected.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "College", value: selected.collegeName },
                { label: "Start Date", value: new Date(selected.startDate).toLocaleDateString() },
                { label: "End Date", value: new Date(selected.endDate).toLocaleDateString() },
                { label: "Sports", value: selected.sportsCount },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
                </div>
              ))}
            </div>
            {selected.status === "RegistrationOpen" && (
              <Button 
                variant={user ? "primary" : "secondary"} 
                size="lg"
                onClick={() => handleRegisterClick(selected)}
              >
                {user ? "Register for this Event →" : "Login to Register"}
              </Button>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
