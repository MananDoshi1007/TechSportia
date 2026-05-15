import { useState, useEffect, useCallback } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { sportAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { FileText, Trophy, Users, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function EventGuidelines({ event, open, onClose, onRegister }) {
  const { user } = useAuth();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const fetchSports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await sportAPI.getByEvent(event.id);
      setSports(res.data);
    } catch (err) {
      console.error("Failed to load guidelines sports", err);
    } finally {
      setLoading(false);
    }
  }, [event?.id]);

  useEffect(() => {
    if (open && event) {
      fetchSports();
      setAgreed(false);
    }
  }, [open, event, fetchSports]);



  if (!event) return null;

  return (
    <Modal open={open} onClose={onClose} title="📜 Event Guidelines & Rules" size="lg">
      <div className="guidelines-container" style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
        
        {/* Document Header */}
        <div style={{ 
          textAlign: "center", borderBottom: "2px double var(--border)", 
          paddingBottom: 24, marginBottom: 32, paddingTop: 10 
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {event.name}
          </h1>
          <p style={{ fontSize: 16, color: "var(--brand-primary)", fontWeight: 700, marginBottom: 8 }}>
            Official Tournament Guidelines
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, color: "var(--text-muted)", fontSize: 14 }}>
            <span>🏫 Hosted by: <b>{event.collegeName}</b></span>
            <span>📅 Date: <b>{new Date(event.startDate).toLocaleDateString()}</b></span>
          </div>
        </div>

        {/* Introduction */}
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={16}/> General Information
          </h3>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {event.description}
          </p>
        </section>

        {/* Sports & Rules List */}
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={16}/> Sports Categories & Regulations
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {loading ? (
              <p>Generating rulebook...</p>
            ) : sports.map((sport, i) => (
              <div key={sport.sportId} style={{ 
                background: "var(--bg-elevated)", borderRadius: 16, padding: 24, 
                border: "1px solid var(--border)", position: "relative"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                    {i + 1}. {sport.name}
                  </h4>
                  <Badge status={sport.type || "Tournament"} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                    <Users size={16} className="text-primary" />
                    <span><b>Team Size:</b> {sport.minPlayers} - {sport.maxPlayers} Players</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                    <ShieldAlert size={16} className="text-primary" />
                    <span><b>Schedule:</b> {sport.startDate ? new Date(sport.startDate).toLocaleDateString() : "TBA"} @ {sport.startTime || "TBA"}</span>
                  </div>
                </div>

                <div style={{ padding: 16, background: "var(--bg-card)", borderRadius: 12, border: "1px dashed var(--border)" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldAlert size={14}/> Specific Rules
                  </p>
                  <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {sport.rules || "No specific rules provided for this sport."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Acceptance Section */}
        <div style={{ 
          marginTop: 40, padding: 24, borderRadius: 20, 
          background: "var(--brand-gradient-soft)", border: "1px solid var(--brand-primary-light)",
          textAlign: "center"
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--brand-primary)", marginBottom: 12 }}>
            Declaration of Conduct
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
            By checking the box below, I confirm that I have read and understood all the rules and regulations mentioned in these guidelines and agree to abide by them during the tournament.
          </p>
          <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, cursor: "pointer", userSelect: "none" }}>
            <input 
              type="checkbox" 
              checked={agreed} 
              onChange={e => setAgreed(e.target.checked)}
              style={{ width: 20, height: 20, cursor: "pointer" }}
            />
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>I agree to the Tournament Rules</span>
          </label>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
          Close
        </Button>
        {user?.role === "Player" && (
          <Button 
            variant="primary" 
            disabled={!agreed} 
            onClick={() => onRegister(event)} 
            style={{ flex: 2 }}
          >
            <CheckCircle2 size={18} style={{ marginRight: 8 }} /> Proceed to Registration
          </Button>
        )}
      </div>
    </Modal>
  );
}
