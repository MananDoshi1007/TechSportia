import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import { eventAPI, resultAPI } from "../../api/api";
import { Trophy, Award, Medal, Search, Calendar, MapPin } from "lucide-react";

export default function Results() {
  const [completedEvents, setCompletedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [results, setResults] = useState([]);


  useEffect(() => {
    const fetchEvents = async () => {
      const res = await eventAPI.getAll();
      setCompletedEvents(res.data.filter(e => e.status === "Completed"));
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = async (ev) => {
    setSelectedEvent(ev);
    try {
      const res = await resultAPI.getByEvent(ev.id);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🏆 Hall of Fame</h1>
        <p className="page-subtitle">Celebrate the winners and view official tournament results.</p>
      </div>

      {/* Event Selection Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 40 }}>
        {completedEvents.map(ev => (
          <div 
            key={ev.id} 
            onClick={() => handleSelectEvent(ev)}
            style={{ 
              padding: 24, borderRadius: 20, cursor: "pointer",
              background: selectedEvent?.id === ev.id ? "var(--brand-gradient)" : "var(--bg-card)",
              border: selectedEvent?.id === ev.id ? "none" : "1px solid var(--border)",
              transition: "all 0.3s ease",
              boxShadow: selectedEvent?.id === ev.id ? "0 10px 30px rgba(124,58,237,0.3)" : "none"
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: selectedEvent?.id === ev.id ? "#fff" : "var(--text-primary)", marginBottom: 8 }}>{ev.name}</h3>
            <div style={{ fontSize: 12, color: selectedEvent?.id === ev.id ? "rgba(255,255,255,0.8)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={12}/> {ev.collegeName}
            </div>
          </div>
        ))}
        {completedEvents.length === 0 && <p style={{ color: "var(--text-muted)" }}>No completed events available yet.</p>}
      </div>

      {selectedEvent && (
        <div className="animate-fade-in">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>{selectedEvent.name}</h2>
            <p style={{ color: "var(--brand-primary)", fontWeight: 700 }}>Official Tournament Standings</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {/* Group results by Sport */}
            {Array.from(new Set(results.map(r => r.sportName))).map(sportName => (
              <div key={sportName} className="card-static" style={{ padding: 32, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, fontSize: 100, opacity: 0.03 }}>🏆</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                  {sportName}
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                  {results.filter(r => r.sportName === sportName).sort((a,b) => a.rank - b.rank).map(res => (
                    <div key={res.resultId} style={{ 
                      textAlign: "center", padding: 24, borderRadius: 20, 
                      background: res.rank === 1 ? "var(--brand-gradient-soft)" : "var(--bg-elevated)",
                      border: res.rank === 1 ? "1px solid var(--brand-primary-light)" : "1px solid var(--border)"
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>
                        {res.rank === 1 ? "🥇" : (res.rank === 2 ? "🥈" : "🥉")}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
                        Rank {res.rank}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)" }}>{res.winnerName}</div>
                      {res.awardName && <div style={{ fontSize: 12, color: "var(--brand-primary)", fontWeight: 700, marginTop: 8 }}>✨ {res.awardName}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!selectedEvent && completedEvents.length > 0 && (
        <div style={{ textAlign: "center", padding: 100, opacity: 0.5 }}>
          <Trophy size={64} style={{ marginBottom: 16 }} strokeWidth={1} />
          <p>Select a completed event above to view its champions.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
