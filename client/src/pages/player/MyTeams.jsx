import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { teamAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import { Users, Trophy, Target, ShieldCheck, Clock, User } from "lucide-react";

export default function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await teamAPI.getMyTeams(); // 🔹 Corrected function name
        setTeams(res.data || []);
      } catch {
        showToast("Failed to load your teams.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [showToast]);

  const handleWithdraw = async (teamId) => {
    if (!window.confirm("Are you sure you want to withdraw this registration? This will move the team back to draft mode.")) return;
    try {
      await teamAPI.withdraw(teamId);
      showToast("Registration withdrawn. You can now edit your roster.", "success");
      // Refresh list
      const res = await teamAPI.getMyTeams();
      setTeams(res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to withdraw registration.", "error");
    }
  };

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🛡️ My Teams</h1>
        <p className="page-subtitle">View and manage the squads you are part of.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 24 }}>
        {teams.map((team, idx) => {
          const isCaptain = team.myRole === "Captain";
          const isPending = !team.isDraft && team.isApproved === null;
          const isDraft = team.isDraft;

          return (
            <div 
              key={team.teamId} 
              className="card-static animate-fade-in-up" 
              style={{ 
                padding: 0, 
                overflow: "hidden", 
                animationDelay: `${idx * 100}ms`,
                display: "flex",
                flexDirection: "column",
                border: isPending ? "1px solid var(--warning)" : "1px solid var(--border)"
              }}
            >
              {/* Header / Team Cover */}
              <div style={{ 
                background: isPending ? "linear-gradient(135deg, #f59e0b, #d97706)" : "var(--brand-gradient)", 
                padding: "24px 20px", 
                color: "white",
                position: "relative"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                      {team.teamName}
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, opacity: 0.9 }}>
                      <Trophy size={14} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{team.sportName}</span>
                      <span style={{ opacity: 0.5 }}>•</span>
                      <span style={{ fontSize: 13 }}>{team.eventName}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <Badge variant={team.isApproved ? "success" : (team.isApproved === false ? "danger" : (team.isDraft ? "player" : "warning"))}>
                      {team.isDraft ? "Draft" : (team.isApproved ? "Approved" : (team.isApproved === false ? "Rejected" : "Pending"))}
                    </Badge>
                    <div style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 6 }}>
                      {isCaptain ? "👑 CAPTAIN" : "👤 MEMBER"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content / Team Details */}
              <div style={{ padding: 20, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <Users size={18} className="text-primary" />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Team Squad</h3>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
                    {team.members?.length || 0} Members
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {team.members?.map((member, mIdx) => (
                    <div 
                      key={mIdx} 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 12, 
                        padding: "10px 12px",
                        background: "var(--bg-elevated)",
                        borderRadius: 10,
                        border: "1px solid var(--border)"
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: member.role === "Captain" ? "var(--brand-gradient)" : "var(--bg-card)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, border: "1px solid var(--border)"
                      }}>
                        {member.fullName?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                          {member.fullName}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                          {member.role}
                        </p>
                      </div>
                      {member.role === "Captain" && (
                        <ShieldCheck size={16} style={{ color: "var(--primary)" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-elevated)", display: "flex", gap: 12 }}>
                {isDraft ? (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    style={{ flex: 1 }}
                    onClick={() => window.location.href = `/register-team/${team.sportId}`}
                  >
                    Manage Team & Register →
                  </Button>
                ) : (
                  <>
                    {isPending && isCaptain && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        style={{ flex: 1, border: "1px solid var(--warning)", color: "var(--warning)" }}
                        onClick={() => handleWithdraw(team.teamId)}
                      >
                        <Clock size={14} style={{ marginRight: 6 }} /> Withdraw & Edit
                      </Button>
                    )}
                    <div style={{ flex: isCaptain ? 0 : 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-muted)" }}>
                      {team.isApproved ? "✅ Registration Confirmed" : (team.isApproved === false ? "❌ Team Rejected" : "⏳ Awaiting Approval")}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {teams.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "100px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🛸</div>
            <h3 style={{ fontSize: 18, color: "var(--text-primary)" }}>No teams found</h3>
            <p style={{ color: "var(--text-muted)", maxWidth: 300, margin: "10px auto 24px" }}>
              You haven't joined or created any teams yet.
            </p>
            <Button variant="primary" onClick={() => window.location.href = "/events"}>
              Browse Sports & Form a Team
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
