import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import { LogIn } from "lucide-react";

const MOCK_RESULTS = [
  { id: 1, event: "Badminton Open",             sport: "Badminton",   type: "Individual", position: 1, score: 95, medal: "🥇" },
  { id: 2, event: "Annual Sports Meet 2026",    sport: "Table Tennis",type: "Individual", position: 3, score: 72, medal: "🥉" },
  { id: 3, event: "Summer Athletics",           sport: "100m Sprint", type: "Individual", position: 2, score: 88, medal: "🥈" },
];

const LEADERBOARD = [
  { rank: 1, name: "Arjun Mehta",   college: "CHARUSAT", points: 255, medals: "🥇🥈🥉" },
  { rank: 2, name: "Rahul Shah",    college: "Nirma",    points: 230, medals: "🥇🥈" },
  { rank: 3, name: "Priya Patel",   college: "DDIT",     points: 210, medals: "🥈🥉🥉" },
  { rank: 4, name: "Sneha Joshi",   college: "CHARUSAT", points: 190, medals: "🥉🥉" },
  { rank: 5, name: "Dev Trivedi",   college: "GTU",      points: 170, medals: "🥇" },
];

export default function Results() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🥇 Results & Rankings</h1>
        <p className="page-subtitle">Tournament outcomes and overall leaderboard.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard icon="🏅" label="Events Done" value={12} color="primary" delay={0}   />
        <StatCard icon="🥇" label="Total Gold"  value={42} color="warning" delay={100} />
        <StatCard icon="🏆" label="Colleges"    value={15} color="accent"  delay={200} />
        <StatCard icon="👥" label="Athletes"    value="1.2k" color="success" delay={300} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* My Results / Guest Prompt */}
        <div className="card-static" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>📊 My Performance</h2>
          
          {user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MOCK_RESULTS.map((r, i) => (
                <div key={r.id} className="animate-fade-in-up" style={{
                  background: "var(--bg-elevated)", borderRadius: 12, padding: "14px 16px",
                  border: "1px solid var(--border)", animationDelay: `${i * 80}ms`,
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{r.medal}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{r.sport}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.event}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: 18, fontWeight: 800,
                      background: "var(--brand-gradient)", WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                      #{r.position}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Score: {r.score}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", padding: "40px 20px", 
              background: "var(--bg-elevated)", borderRadius: 12, border: "1px dashed var(--border)" 
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Personal Stats Locked</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Sign in to track your medals, rank, and tournament history.</p>
              <Button variant="primary" size="sm" onClick={() => navigate("/login")}>
                <LogIn size={14} /> Sign In to View
              </Button>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="card-static" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>🏆 Overall Leaderboard</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {LEADERBOARD.map((p, i) => (
              <div key={p.rank} className="animate-fade-in-up" style={{
                background: p.rank === 1 ? "linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.05))"
                          : p.rank === 2 ? "linear-gradient(135deg,rgba(148,163,184,0.1),rgba(148,163,184,0.05))"
                          : p.rank === 3 ? "linear-gradient(135deg,rgba(180,120,60,0.1),rgba(180,120,60,0.05))"
                          : "var(--bg-elevated)",
                borderRadius: 10, padding: "12px 14px",
                border: `1px solid ${p.rank <= 3 ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
                display: "flex", alignItems: "center", gap: 12,
                animationDelay: `${i * 60}ms`,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: p.rank === 1 ? "linear-gradient(135deg,#F59E0B,#D97706)"
                            : p.rank === 2 ? "linear-gradient(135deg,#94A3B8,#64748B)"
                            : p.rank === 3 ? "linear-gradient(135deg,#B47C3C,#92600A)"
                            : "var(--bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: "#fff",
                }}>
                  {p.rank <= 3 ? ["🥇","🥈","🥉"][p.rank-1] : p.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.college}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{p.points} pts</div>
                  <div style={{ fontSize: 12 }}>{p.medals}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
