import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { teamAPI, userAPI, sportAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import { Users, UserPlus, Trash2, Search, Trophy, CheckCircle2, ChevronLeft, Clock } from "lucide-react";

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.title) return data.title;
  return fallback;
};

export default function RegisterTeam() {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [sport, setSport] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [members, setMembers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [defaultStudents, setDefaultStudents] = useState([]); // 🔹 Default list
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Fetch Sport Details
      const sportsRes = await sportAPI.getAll();
      const foundSport = sportsRes.data.find(s => s.sportId === parseInt(sportId));
      setSport(foundSport);

      // 2. Check if user already has a team for this sport
      try {
        const teamRes = await teamAPI.getMyTeamBySport(sportId);
        if (teamRes.data) {
          setTeamId(teamRes.data.teamId);
          setTeamName(teamRes.data.teamName);
          // 🔹 Robust name mapping (handles FullName or fullName)
          setMembers(teamRes.data.members.map(m => ({
            ...m,
            name: m.name || m.Name || m.fullName || m.FullName || "Member",
            email: m.email || m.Email
          })));
          setIsCreated(true);

          if (teamRes.data.isDraft === false) {
            showToast("You have already registered for this sport.", "info");
            navigate("/dashboard");
          }
        }
      } catch (err) {
        // 404 is fine here, means no team exists yet
        if (err.response?.status !== 404) console.error(err);
      }
    } catch {
      showToast("Error loading registration data.", "error");
    } finally {
      setLoading(false);
    }
  }, [sportId, navigate, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 🔹 Fetch default students for roster management
  useEffect(() => {
    if (isCreated) {
      const fetchStudents = async () => {
        try {
          const res = await userAPI.search(""); // Empty query gets default 10
          setDefaultStudents(res.data);
        } catch (err) {
          console.error("Failed to load students", err);
        }
      };
      fetchStudents();
    }
  }, [isCreated]); // userAPI is stable

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const cleanTeamName = teamName.trim();
    if (!cleanTeamName) {
      showToast("Team name is required.", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await teamAPI.create(cleanTeamName, sportId);
      showToast("Team created as draft! You are now the Captain.", "success");
      setTeamName(cleanTeamName);
      setIsCreated(true);
      setTeamId(res.data.teamId);
      setMembers([{ userId: 'me', name: 'You (Captain)', role: 'Captain', fullName: 'You (Captain)' }]);
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to create team."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setLoading(true); // Reusing loading instead of searching
      const res = await userAPI.search(val);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (user) => {
    if (members.length >= (sport?.maxPlayers || 99)) {
      showToast("Team is full!", "warning");
      return;
    }

    const newMemberName = (user.name || user.fullName || "").trim().toLowerCase();
    if (members.some(m => String(m.userId) === String(user.userId))) {
      showToast("This player is already in the team.", "warning");
      return;
    }

    if (newMemberName && members.some(m => (m.name || m.fullName || "").trim().toLowerCase() === newMemberName)) {
      showToast("A player with this name is already in the team.", "warning");
      return;
    }

    try {
      await teamAPI.addMember(teamId, user.userId);
      setMembers([...members, { ...user, role: 'Player' }]);
      setSearchQuery("");
      setSearchResults([]);
      showToast(`${user.name} added to roster.`, "success");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not add member."), "error");
    }
  };

  const removeMember = async (userId) => {
    try {
      await teamAPI.removeMember(teamId, userId);
      setMembers(members.filter(m => m.userId !== userId));
      showToast("Member removed.", "info");
    } catch {
      showToast("Failed to remove member.", "error");
    }
  };

  const handleRegisterTeam = async () => {
    try {
      setRegistering(true);
      await teamAPI.register(teamId);
      showToast("Team registered successfully! Organizer will review it.", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(getErrorMessage(err, "Registration failed."), "error");
    } finally {
      setRegistering(false);
    }
  };

  // 🔹 Calculate registration deadline (1 day before start date)
  const registrationDeadline = sport?.startDate
    ? new Date(new Date(sport.startDate).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : "N/A";

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Back to Events
        </Button>
      </div>

      <div className="page-header" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="page-title">🛡️ Team Registration</h1>
            <p className="page-subtitle">Form your squad for <b>{sport?.name || "Tournament"}</b></p>
          </div>
          <div style={{ textAlign: "right", background: "rgba(255,255,255,0.05)", padding: "12px 20px", borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Last Date To Register</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--brand-primary)" }}>{registrationDeadline}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32, alignItems: "start" }}>

        {/* Left: Step 1 - Create Team */}
        <div className="card-static" style={{ padding: 28, opacity: isCreated ? 0.6 : 1, pointerEvents: isCreated ? "none" : "auto" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={18} className="text-primary" /> 1. Initialize Team
          </h3>
          <form onSubmit={handleCreateTeam}>
            <Input
              label="Team Name"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="e.g. Phoenix Strikers"
              required
            />
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              Once created, you will become the <b>Official Captain</b> and can manage the roster.
            </p>
            {!isCreated && (
              <Button variant="primary" type="submit" loading={loading} style={{ width: "100%", marginTop: 24 }}>
                Create Team & Become Captain
              </Button>
            )}
          </form>
        </div>

        {/* Right: Step 2 - Manage Roster */}
        <div className="card-static" style={{ padding: 28, minHeight: 400, opacity: isCreated ? 1 : 0.4, pointerEvents: isCreated ? "auto" : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={18} className="text-primary" /> 2. Team Management
            </h3>
            <Badge variant="player">{members.length} / {sport?.maxPlayers || "?"} Players</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Find Players (Left half of step 2) */}
            <div>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <Input
                  label="Find Players"
                  value={searchQuery}
                  onChange={handleSearch}
                  icon={<Search size={16} />}
                  placeholder="Enter name..."
                />
              </div>

              <div style={{
                height: 300, overflowY: "auto", borderRadius: 12, border: "1px solid var(--border)",
                background: "rgba(0,0,0,0.2)", padding: 8, display: "flex", flexDirection: "column", gap: 8
              }} className="custom-scrollbar">
                {(searchQuery ? searchResults : defaultStudents).map(u => (
                  <div key={u.userId} style={{
                    padding: "8px 12px", background: "var(--bg-elevated)",
                    borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => addMember(u)} style={{ minWidth: 32 }}>
                      <UserPlus size={16} />
                    </Button>
                  </div>
                ))}
                {(searchQuery ? searchResults : defaultStudents).length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 40 }}>No players found</div>
                )}
              </div>
            </div>

            {/* Current Roster (Right half of step 2) */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>
                Current Team Members
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {members.map(m => (
                  <div key={m.userId} style={{
                    padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "white" }}>
                        {(m.name || m.fullName || "?")[0].toUpperCase()}
                      </div>
                      <div style={{ overflow: "hidden", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>
                            {m.name || m.Name || m.fullName || m.FullName || "Loading..."}
                          </div>
                          {m.role === 'Captain' && (
                            <span style={{
                              fontSize: 9, fontWeight: 900, background: "rgba(255, 215, 0, 0.15)",
                              color: "#ffd700", padding: "2px 6px", borderRadius: 4,
                              border: "1px solid rgba(255, 215, 0, 0.3)", letterSpacing: "0.05em"
                            }}>
                              CAPTAIN
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{m.role}</div>
                      </div>
                    </div>
                    {m.role !== 'Captain' && (
                      <Button variant="danger" size="sm" onClick={() => removeMember(m.userId)} style={{ padding: 4 }}>
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {isCreated && (
            <div style={{ marginTop: 32, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    showToast("Progress saved as draft!", "success");
                    navigate("/my-teams");
                  }}
                  style={{ width: "100%" }}
                >
                  <Clock size={18} style={{ marginRight: 8 }} /> Save as Draft
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  disabled={members.length < (sport?.minPlayers || 1)}
                  onClick={handleRegisterTeam}
                  loading={registering}
                  style={{ width: "100%" }}
                >
                  <CheckCircle2 size={18} style={{ marginRight: 8 }} /> Register Team 🚀
                </Button>
              </div>

              <div style={{ marginTop: 20, textAlign: "center" }}>
                {members.length < (sport?.minPlayers || 1) ? (
                  <p style={{ fontSize: 13, color: "var(--warning)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Users size={14} /> Need {(sport?.minPlayers || 0) - members.length} more players to register.
                  </p>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--success)", fontWeight: 600 }}>
                    ✨ Minimum requirement met! Ready to register.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
