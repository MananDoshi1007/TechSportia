import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import EventGuidelines from "../../components/common/EventGuidelines";
import { LayoutGrid, Play, CheckCircle, FileText, Calendar, Search, ArrowRight, Trophy } from "lucide-react";
import { eventAPI, sportAPI, registrationAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";

export default function BrowseEvents() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get("q") || "");
  const [sportSearch, setSportSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [eventSports, setEventSports] = useState([]);
  
  const [events, setEvents] = useState([]);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const q = queryParams.get("q") || "";

  const fetchEvents = useCallback(async (searchQuery) => {
    try {
      const res = await eventAPI.getAll(searchQuery);
      setEvents(res.data);
    } catch {
      showToast("Failed to load events.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(q), 0);
    return () => clearTimeout(timer);
  }, [q, fetchEvents]);

  const handleOpenGuidelines = (ev) => {
    setSelectedEvent(ev);
    setIsGuidelinesOpen(true);
  };

  const handleStartRegistration = async (ev) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setIsGuidelinesOpen(false);
      const res = await sportAPI.getByEvent(ev.id);
      setEventSports(res.data);
      setIsRegModalOpen(true);
    } catch {
      showToast("Could not load sports for this event.", "error");
    }
  };

  const handleJoinSport = async (sport) => {
    if (sport.maxPlayers > 1) {
      // It's a team sport -> go to team creation/join flow
      navigate(`/register-team/${sport.sportId}`);
    } else {
      // It's individual -> direct register
      try {
        await registrationAPI.registerIndividual(sport.sportId);
        showToast(`Successfully registered for ${sport.name}!`, "success");
        setIsRegModalOpen(false);
      } catch (err) {
        showToast(err.response?.data?.message || "Registration failed.", "error");
      }
    }
  };

  const filtered = events.filter((ev) => {
    // 1. Role-based visibility: Only Organizer/Admin can see Drafts
    const isPrivileged = user?.role === "Organizer" || user?.role === "SuperAdmin";
    if (ev.status === "Draft" && !isPrivileged) return false;

    // 2. Status filter
    const matchFilter = filter === "All" || ev.status === filter;
    
    // 3. Search filter (Event Name or College)
    const matchSearch = (ev.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (ev.collegeName || "").toLowerCase().includes(search.toLowerCase());

    // 4. Sport Search (Filter by individual sports inside the event)
    const matchSport = !sportSearch || ev.sports?.some(s => s.name?.toLowerCase().includes(sportSearch.toLowerCase()));
                         
    return matchFilter && matchSearch && matchSport;
  });

  // ✅ Fix Stats: Statistics should only reflect what the user CAN see
  const visibleEvents = events.filter(ev => {
    const isPrivileged = user?.role === "Organizer" || user?.role === "SuperAdmin";
    return ev.status !== "Draft" || isPrivileged;
  });

  const stats = [
    { id: "All",              label: "Total Events", value: visibleEvents.length, icon: <LayoutGrid size={20} />, color: "primary" },
    { id: "RegistrationOpen", label: "Open for Reg.",value: visibleEvents.filter(e => e.status === "RegistrationOpen").length, icon: <Calendar size={20} />, color: "success" },
    { id: "Ongoing",          label: "Ongoing",       value: visibleEvents.filter(e => e.status === "Ongoing").length, icon: <Play size={20} />, color: "accent" },
    { id: "Completed",        label: "Completed",     value: visibleEvents.filter(e => e.status === "Completed").length, icon: <CheckCircle size={20} />, color: "warning" },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🏆 Browse Events</h1>
        <p className="page-subtitle">Discover and register for sports events near you.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <StatCard key={s.id} id={s.id} label={s.label} value={s.value} icon={s.icon} color={s.color} delay={i * 50} onClick={() => setFilter(s.id)} active={filter === s.id} />
        ))}
      </div>

      {/* Search Rows */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}><Search size={18} /></span>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search event name or college…" style={{ paddingLeft: 42 }} />
        </div>
        <div style={{ flex: 1, minWidth: 250, position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}><Trophy size={18} /></span>
          <input className="input" value={sportSearch} onChange={e => setSportSearch(e.target.value)} placeholder="Filter by sport (e.g. Cricket, Chess)…" style={{ paddingLeft: 42 }} />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {filtered.map((ev) => (
          <div key={ev.id} className="card animate-fade-in-up" style={{ padding: 24, borderLeft: ev.status === "RegistrationOpen" ? "4px solid var(--brand-primary)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <Badge status={ev.status} dot />
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{new Date(ev.startDate).getFullYear()}</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>{ev.name}</h3>
            <p style={{ fontSize: 13, color: "var(--brand-primary)", fontWeight: 700, marginBottom: 16 }}>🏫 {ev.collegeName}</p>
            
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 20, height: 42, overflow: "hidden" }}>{ev.description}</p>
            
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="outline" size="sm" onClick={() => handleOpenGuidelines(ev)} style={{ flex: 1 }}>
                <FileText size={14} style={{ marginRight: 6 }}/> Guidelines
              </Button>
              {ev.status === "RegistrationOpen" && (
                <Button variant="primary" size="sm" onClick={() => handleOpenGuidelines(ev)} style={{ flex: 1 }}>
                  Join Tournament <ArrowRight size={14} style={{ marginLeft: 6 }}/>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Guidelines Component */}
      <EventGuidelines 
        event={selectedEvent} 
        open={isGuidelinesOpen} 
        onClose={() => setIsGuidelinesOpen(false)}
        onRegister={handleStartRegistration}
      />

      {/* Sport Selection Modal */}
      <Modal open={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} title="Select Sport to Participate" size="md">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>
            Choose a sport category to start your registration for <b>{selectedEvent?.name}</b>.
          </p>
          {eventSports.map(sport => (
            <div 
              key={sport.sportId} 
              className="card-static" 
              onClick={() => handleJoinSport(sport)}
              style={{ 
                padding: 20, cursor: "pointer", display: "flex", 
                justifyContent: "space-between", alignItems: "center",
                border: "1px solid var(--border)", transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--brand-primary)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div>
                <h4 style={{ fontWeight: 800, color: "var(--text-primary)" }}>{sport.name}</h4>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {sport.maxPlayers > 1 ? "👥 Team Event" : "👤 Individual Event"} • Max {sport.maxPlayers} players
                </p>
              </div>
              <ArrowRight size={18} className="text-primary" />
            </div>
          ))}
        </div>
      </Modal>

    </DashboardLayout>
  );
}
