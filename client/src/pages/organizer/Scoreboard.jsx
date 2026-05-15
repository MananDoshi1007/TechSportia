import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import { eventAPI, sportAPI, teamAPI, registrationAPI, scoreAPI, resultAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import { Trophy, Save, ChevronRight, PlayCircle, Users, User } from "lucide-react";
import Badge from "../../components/common/Badge";

export default function Scoreboard() {
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await eventAPI.getAll();
      setOngoingEvents(res.data.filter(e => e.status === "Ongoing"));
    };
    fetchEvents();
  }, []);

  const handleSelectEvent = async (ev) => {
    setSelectedEvent(ev);
    setSelectedSport(null);
    setParticipants([]);
    const res = await sportAPI.getByEvent(ev.id);
    setSports(res.data);
  };

  const handleSelectSport = async (sport) => {
    setSelectedSport(sport);
    setLoading(true);
    try {
      let participantsData = [];
      if (sport.maxPlayers > 1) {
        // Fetch Teams by Sport (Approved only)
        const res = await teamAPI.getBySport(sport.sportId);
        participantsData = res.data.map(t => ({
          id: t.teamId,
          name: t.teamName,
          type: 'team',
          points: 0,
          rank: 0,
          award: ""
        }));
      } else {
        // Fetch Individual Players
        const res = await registrationAPI.getParticipants(sport.sportId);
        participantsData = res.data.filter(p => p.isApproved).map(p => ({
          id: p.userId,
          name: p.fullName,
          type: 'individual',
          points: 0,
          rank: 0,
          award: ""
        }));
      }

      // 🔹 Fetch Existing Scores
      try {
        const scoresRes = await scoreAPI.getBySport(sport.sportId);
        const scores = scoresRes.data || [];
        
        participantsData = participantsData.map(p => {
          const match = scores.find(s => 
            p.type === 'team' ? s.teamName === p.name : s.playerName === p.name
          );
          return { ...p, points: match ? match.points : 0 };
        });
      } catch (e) {
        console.warn("Could not fetch existing scores", e);
      }

      setParticipants(participantsData);
    } catch {
      showToast("Error loading participants.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePoints = (id, points) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, points: parseInt(points) || 0 } : p
    ));
  };

  const handleUpdateRank = (id, rank) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, rank: parseInt(rank) || 0 } : p
    ));
  };

  const handleUpdateAward = (id, award) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, award } : p
    ));
  };

  const saveScores = async () => {
    try {
      setLoading(true);
      const payload = participants.map(p => ({
        sportId: selectedSport.sportId,
        teamId: p.type === 'team' ? p.id : null,
        userId: p.type === 'individual' ? p.id : null,
        points: p.points
      }));
      await scoreAPI.bulkUpdate(payload);
      showToast("Scores saved successfully!", "success");
    } catch {
      showToast("Failed to save scores.", "error");
    } finally {
      setLoading(false);
    }
  };

  const publishResults = async () => {
    const winners = participants.filter(p => p.rank > 0);
    if (winners.length === 0) {
      showToast("Please assign at least one rank (1st, 2nd, etc.)", "warning");
      return;
    }

    try {
      setPublishing(true);
      const payload = {
        sportId: selectedSport.sportId,
        winners: winners.map(w => ({
          userId: w.type === 'individual' ? w.id : null,
          teamId: w.type === 'team' ? w.id : null,
          rank: w.rank,
          awardName: w.award
        }))
      };
      await resultAPI.bulkPublish(payload);
      showToast("Results published successfully!", "success");
      setShowPublishModal(false);
    } catch {
      showToast("Failed to publish results.", "error");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">📈 Live Scoreboard Hub</h1>
        <p className="page-subtitle">Update and manage points for ongoing tournament matches.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32, alignItems: "start" }}>
        
        {/* Left: Event & Sport Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 16 }}>Select Ongoing Event</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ongoingEvents.map(ev => (
                <div 
                  key={ev.id} 
                  onClick={() => handleSelectEvent(ev)}
                  style={{ 
                    padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                    background: selectedEvent?.id === ev.id ? "var(--brand-gradient-soft)" : "var(--bg-elevated)",
                    border: selectedEvent?.id === ev.id ? "1px solid var(--brand-primary)" : "1px solid var(--border)",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{ev.name}</span>
                  <ChevronRight size={16} />
                </div>
              ))}
              {ongoingEvents.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No ongoing events found.</p>}
            </div>
          </div>

          {selectedEvent && (
            <div className="card-static animate-fade-in" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 16 }}>Select Sport Category</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sports.map(s => (
                  <div 
                    key={s.sportId} 
                    onClick={() => handleSelectSport(s)}
                    style={{ 
                      padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                      background: selectedSport?.sportId === s.sportId ? "var(--brand-gradient-soft)" : "var(--bg-elevated)",
                      border: selectedSport?.sportId === s.sportId ? "1px solid var(--brand-primary)" : "1px solid var(--border)",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Trophy size={14} className="text-primary" />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                    </div>
                    <Badge variant="player" size="sm">{s.maxPlayers > 1 ? "Team" : "Ind."}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Scoring Interface */}
        <div className="card-static" style={{ padding: 32, minHeight: 400 }}>
          {!selectedSport ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 350, color: "var(--text-muted)" }}>
              <PlayCircle size={48} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p>Select an event and sport to begin scoring.</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)" }}>{selectedSport.name}</h2>
                  <p style={{ fontSize: 14, color: "var(--brand-primary)", fontWeight: 600 }}>{selectedEvent.name}</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <Button variant="outline" onClick={() => setShowPublishModal(true)} disabled={participants.length === 0}>
                        🏆 Publish Results
                    </Button>
                    <Button variant="primary" onClick={saveScores} loading={loading}>
                        <Save size={18} style={{ marginRight: 8 }}/> Save All Scores
                    </Button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {participants.map(p => (
                  <div key={p.id} style={{ 
                    display: "flex", alignItems: "center", gap: 20, 
                    padding: 20, background: "var(--bg-elevated)", 
                    borderRadius: 16, border: "1px solid var(--border)" 
                  }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        {p.type === 'team' ? <Users size={20}/> : <User size={20}/>}
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</span>
                    </div>
                    <div style={{ width: 120 }}>
                      <Input 
                        type="text" 
                        value={p.points} 
                        onChange={e => {
                          const val = e.target.value;
                          if (val === "" || /^\d+$/.test(val)) {
                            handleUpdatePoints(p.id, val);
                          }
                        }}
                        placeholder="Points"
                        style={{ textAlign: "center", fontSize: 18, fontWeight: 800 }}
                      />
                    </div>
                  </div>
                ))}
                {participants.length === 0 && !loading && <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>No approved participants found for this sport.</p>}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Publish Results Modal */}
      <Modal open={showPublishModal} onClose={() => setShowPublishModal(false)} title="🏆 Publish Final Rankings" size="lg">
        <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 16 }}>
                Assign ranks and awards to the participants based on the final scores. 
                These will be displayed in the public Hall of Fame.
            </p>
            <div className="table-wrap">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "var(--bg-elevated)", textAlign: "left" }}>
                            <th style={{ padding: 12 }}>Participant</th>
                            <th style={{ padding: 12 }}>Final Points</th>
                            <th style={{ padding: 12 }}>Rank</th>
                            <th style={{ padding: 12 }}>Award Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.sort((a,b) => b.points - a.points).map(p => (
                            <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: 12, fontWeight: 700 }}>{p.name}</td>
                                <td style={{ padding: 12 }}>{p.points}</td>
                                <td style={{ padding: 12 }}>
                                    <select 
                                        value={p.rank} 
                                        onChange={e => handleUpdateRank(p.id, e.target.value)}
                                        className="input"
                                        style={{ height: 36, padding: "0 8px" }}
                                    >
                                        <option value="0">Select Rank</option>
                                        <option value="1">🥇 1st Place</option>
                                        <option value="2">🥈 2nd Place</option>
                                        <option value="3">🥉 3rd Place</option>
                                        <option value="4">Rank 4</option>
                                        <option value="5">Rank 5</option>
                                    </select>
                                </td>
                                <td style={{ padding: 12 }}>
                                    <input 
                                        type="text"
                                        value={p.award}
                                        onChange={e => handleUpdateAward(p.id, e.target.value)}
                                        placeholder="e.g. Winner, MVP"
                                        className="input"
                                        style={{ height: 36, padding: "0 12px" }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setShowPublishModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={publishResults} loading={publishing}>
                🚀 Publish to Hall of Fame
            </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
