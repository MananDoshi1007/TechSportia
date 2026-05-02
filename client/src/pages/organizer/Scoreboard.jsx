import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";

const MOCK_SPORTS = [
  { id: 1, sport: "Cricket",   event: "Annual Sports Meet", type: "Team" },
  { id: 2, sport: "Badminton", event: "Annual Sports Meet", type: "Individual" },
  { id: 3, sport: "Football",  event: "Annual Sports Meet", type: "Team" },
];

const MOCK_SCORES_TEAM = [
  { id: 1, sportId: 1, name: "CHARUSAT Tigers", type: "Team", score: 145, position: 1 },
  { id: 2, sportId: 1, name: "Night Owls",      type: "Team", score: 130, position: 2 },
  { id: 3, sportId: 1, name: "Fast Runners",    type: "Team", score: 115, position: 3 },
];

const MOCK_SCORES_INDIVIDUAL = [
  { id: 4, sportId: 2, name: "Arjun Mehta",  type: "Individual", score: 95,  position: 1 },
  { id: 5, sportId: 2, name: "Priya Patel",  type: "Individual", score: 88,  position: 2 },
  { id: 6, sportId: 2, name: "Sneha Joshi",  type: "Individual", score: 76,  position: 3 },
];

const ALL_SCORES = [...MOCK_SCORES_TEAM, ...MOCK_SCORES_INDIVIDUAL];

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function Scoreboard() {
  const [selectedSport, setSelectedSport] = useState(MOCK_SPORTS[0]);
  const [editModal, setEditModal] = useState(null);
  const [scoreInput, setScoreInput] = useState("");
  const [scores, setScores] = useState(ALL_SCORES);

  const sportScores = scores
    .filter(s => s.sportId === selectedSport.id)
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, position: i + 1 }));

  const saveScore = () => {
    setScores(ss => ss.map(s => s.id === editModal.id ? { ...s, score: parseInt(scoreInput) || s.score } : s));
    setEditModal(null);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">📈 Scoreboard</h1>
        <p className="page-subtitle">Update scores and track rankings for each sport.</p>
      </div>

      {/* Sport tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {MOCK_SPORTS.map(sp => (
          <button
            key={sp.id}
            onClick={() => setSelectedSport(sp)}
            style={{
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${selectedSport.id === sp.id ? "var(--brand-primary)" : "var(--border)"}`,
              background: selectedSport.id === sp.id ? "var(--brand-primary-light)" : "var(--bg-elevated)",
              color: selectedSport.id === sp.id ? "var(--brand-primary)" : "var(--text-secondary)",
              transition: "all 0.2s", fontFamily: "Inter, sans-serif",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {sp.sport}
            <Badge status={sp.type} />
          </button>
        ))}
      </div>

      {/* Scoreboard */}
      <div className="card-static" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
            {selectedSport.sport} — Rankings
          </h2>
          <Badge status={selectedSport.type} />
        </div>

        {sportScores.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
            <p>No scores recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sportScores.map((s) => (
              <div key={s.id} className="animate-fade-in-up" style={{
                display: "flex", alignItems: "center", gap: 16,
                background: s.position === 1 ? "linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.03))"
                          : s.position === 2 ? "linear-gradient(135deg,rgba(148,163,184,0.1),rgba(148,163,184,0.03))"
                          : s.position === 3 ? "linear-gradient(135deg,rgba(180,120,60,0.1),rgba(180,120,60,0.03))"
                          : "var(--bg-elevated)",
                borderRadius: 12, padding: "16px 20px",
                border: `1px solid ${s.position <= 3 ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
                animationDelay: `${s.position * 60}ms`,
              }}>
                <div style={{ fontSize: 28, flexShrink: 0, width: 40, textAlign: "center" }}>
                  {MEDALS[s.position] || `#${s.position}`}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{s.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Position #{s.position}</p>
                </div>

                <div style={{ textAlign: "center", minWidth: 60 }}>
                  <div className="gradient-text" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.score}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Score</div>
                </div>

                <Button
                  variant="secondary" size="sm"
                  onClick={() => { setEditModal(s); setScoreInput(String(s.score)); }}
                >
                  ✏️ Edit
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit score modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit Score — ${editModal?.name}`} size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveScore}>Save Score</Button>
          </>
        }
      >
        {editModal && (
          <Input
            label={`Score for ${editModal.name}`}
            type="number"
            value={scoreInput}
            onChange={e => setScoreInput(e.target.value)}
            placeholder="Enter score"
            icon="📊"
          />
        )}
      </Modal>
    </DashboardLayout>
  );
}
