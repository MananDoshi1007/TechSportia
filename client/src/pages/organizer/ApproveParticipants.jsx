import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { teamAPI, registrationAPI, eventAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import { Users, CheckCircle, XCircle, Trophy, User, Filter } from "lucide-react";

export default function ApproveParticipants() {
  const { user } = useAuth();
  const [mode, setMode] = useState("Teams"); 
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("All");
  const [selectedSport, setSelectedSport] = useState("All");
  
  const [teams, setTeams] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const { showToast } = useToast();

  const fetchInitialData = useCallback(async () => {
    if (!user?.collegeId) return;
    try {
      const [eventsRes, teamsRes] = await Promise.all([
        eventAPI.getByCollege(user.collegeId),
        teamAPI.getCollegeTeams()
      ]);
      setEvents(eventsRes.data || []);
      setTeams(teamsRes.data || []);
    } catch {
      showToast("Failed to load verification data.", "error");
    }
  }, [user, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchInitialData(), 0);
    return () => clearTimeout(timer);
  }, [fetchInitialData]);

  useEffect(() => {
    const fetchInd = async () => {
      if (mode === "Individuals") {
        try {
          let res;
          if (selectedSport === "All") {
            res = await registrationAPI.getCollegeRegistrations();
          } else {
            res = await registrationAPI.getParticipants(selectedSport);
          }
          setIndividuals(res.data || []);
        } catch {
          showToast("Failed to load players.", "error");
        }
      }
    };
    fetchInd();
  }, [mode, selectedSport, showToast]);

  const refreshIndividuals = useCallback(async () => {
    try {
      let res;
      if (selectedSport === "All") {
        res = await registrationAPI.getCollegeRegistrations();
      } else {
        res = await registrationAPI.getParticipants(selectedSport);
      }
      setIndividuals(res.data || []);
    } catch {
      // Error handled silently on refresh
    }
  }, [selectedSport]);

  const handleApproveTeam = async (teamId) => {
    try {
      await teamAPI.approve(teamId);
      showToast("Team approved!", "success");
      fetchInitialData();
    } catch {
      showToast("Approval failed.", "error");
    }
  };

  const handleRejectTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to reject this team? This will delete the team registration.")) return;
    try {
      await teamAPI.reject(teamId);
      showToast("Team rejected.", "info");
      fetchInitialData();
    } catch {
      showToast("Rejection failed.", "error");
    }
  };

  const handleApproveIndividual = async (regId) => {
    try {
      await registrationAPI.approve(regId);
      showToast("Player approved!", "success");
      refreshIndividuals();
    } catch {
      showToast("Approval failed.", "error");
    }
  };

  const handleRejectIndividual = async (regId) => {
    if (!window.confirm("Are you sure you want to reject this player?")) return;
    try {
      await registrationAPI.reject(regId);
      showToast("Player rejected.", "info");
      refreshIndividuals();
    } catch {
      showToast("Rejection failed.", "error");
    }
  };

  const currentEvent = events.find(e => e.id === parseInt(selectedEvent));
  const availableSports = currentEvent ? currentEvent.sports : [];

  const filteredTeams = teams.filter(t => {
    const matchEvent = selectedEvent === "All" || events.find(e => e.id === parseInt(selectedEvent))?.sports.some(s => s.sportId === t.sportId);
    const matchSport = selectedSport === "All" || t.sportId === parseInt(selectedSport);
    return matchEvent && matchSport;
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🛡️ Participant Verification</h1>
        <p className="page-subtitle">Review and approve rosters for {user?.collegeName}.</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", background: "var(--bg-elevated)", padding: 4, borderRadius: 12, border: "1px solid var(--border)" }}>
          <button 
            onClick={() => setMode("Teams")}
            style={{
              padding: "8px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
              background: mode === "Teams" ? "var(--brand-primary)" : "transparent",
              color: mode === "Teams" ? "#fff" : "var(--text-secondary)",
              border: "none", transition: "all 0.2s"
            }}
          >
            👥 Teams
          </button>
          <button 
            onClick={() => setMode("Individuals")}
            style={{
              padding: "8px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
              background: mode === "Individuals" ? "var(--brand-primary)" : "transparent",
              color: mode === "Individuals" ? "#fff" : "var(--text-secondary)",
              border: "none", transition: "all 0.2s"
            }}
          >
            🏃 Individuals
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, flex: 1, justifyContent: "flex-end" }}>
          <div style={{ position: "relative" }}>
            <select 
              value={selectedEvent} 
              onChange={e => { setSelectedEvent(e.target.value); setSelectedSport("All"); }}
              className="input"
              style={{ width: 180, height: 40, padding: "0 12px", fontSize: 13 }}
            >
              <option value="All">All Events</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>
          <div style={{ position: "relative" }}>
            <select 
              value={selectedSport} 
              onChange={e => setSelectedSport(e.target.value)}
              className="input"
              style={{ width: 180, height: 40, padding: "0 12px", fontSize: 13 }}
              disabled={selectedEvent === "All" && mode === "Individuals"}
            >
              <option value="All">All Sports</option>
              {availableSports.map(s => (
                <option key={s.sportId} value={s.sportId}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {mode === "Teams" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 24 }}>
          {filteredTeams.map((team, i) => (
            <div key={team.teamId} className="card-static animate-fade-in-up" style={{ padding: 0, overflow: "hidden", animationDelay: `${i * 100}ms` }}>
              <div style={{ padding: 24, borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{team.teamName}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, color: "var(--brand-primary)", fontSize: 13, fontWeight: 700 }}>
                      <Trophy size={14} /> {team.sportName}
                    </div>
                  </div>
                  <Badge status={team.isApproved === true ? "Approved" : (team.isApproved === false ? "Rejected" : "Pending")} dot />
                </div>
                
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Official Roster ({team.memberCount} Players)</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {team.members?.map((m, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "var(--text-secondary)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <User size={14} className={m.role === "Captain" ? "text-primary" : ""} />
                          <span>{m.fullName}</span>
                        </div>
                        {m.role === "Captain" && <Badge variant="player" size="sm">Captain</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: 16, background: "var(--bg-elevated)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleRejectTeam(team.teamId)}
                  disabled={team.isApproved !== null}
                >
                  Reject
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => handleApproveTeam(team.teamId)}
                  disabled={team.isApproved !== null}
                >
                  Approve Roster
                </Button>
              </div>
            </div>
          ))}
          {filteredTeams.length === 0 && <div style={{ textAlign: "center", padding: 60, gridColumn: "1/-1" }}>No teams found for this selection.</div>}
        </div>
      ) : (
        <div className="card-static" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-elevated)", textAlign: "left" }}>
                <th style={{ padding: 16 }}>Player Name</th>
                <th style={{ padding: 16 }}>Sport</th>
                <th style={{ padding: 16 }}>Email</th>
                <th style={{ padding: 16 }}>Status</th>
                <th style={{ padding: 16, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {individuals.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: 16, fontWeight: 600 }}>{p.fullName}</td>
                  <td style={{ padding: 16, fontSize: 12, color: "var(--brand-primary)", fontWeight: 700 }}>{p.sportName}</td>
                  <td style={{ padding: 16, color: "var(--text-muted)" }}>{p.email}</td>
                  <td style={{ padding: 16 }}><Badge status={p.isApproved === true ? "Approved" : (p.isApproved === false ? "Rejected" : "Pending")} dot /></td>
                  <td style={{ padding: 16, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleRejectIndividual(p.id)}
                        disabled={p.isApproved !== null}
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleApproveIndividual(p.id)}
                        disabled={p.isApproved !== null}
                      >
                        Approve
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {individuals.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                    No individual registrations found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
