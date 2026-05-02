import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const STEPS = ["Event Info", "Sports Setup", "Review"];

const EMPTY_SPORT = { name: "", type: "Individual", minPlayers: "", maxPlayers: "", maxSubstitutes: "", regStart: "", regEnd: "" };

export default function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "" });
  const [sports, setSports] = useState([{ ...EMPTY_SPORT }]);
  const [loading, setLoading] = useState(false);

  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSport = (i, e) => {
    const updated = [...sports];
    updated[i] = { ...updated[i], [e.target.name]: e.target.value };
    setSports(updated);
  };

  const addSport = () => { if (sports.length < 10) setSports([...sports, { ...EMPTY_SPORT }]); };
  const removeSport = (i) => { if (sports.length > 1) setSports(sports.filter((_, idx) => idx !== i)); };

  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigate("/my-events");
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">➕ Create New Event</h1>
        <p className="page-subtitle">Set up your sports event step by step.</p>
      </div>

      {/* Step bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              height: 4, borderRadius: 4, marginBottom: 8,
              background: i <= step ? "var(--brand-primary)" : "var(--border)",
              transition: "background 0.3s",
            }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: i === step ? "var(--brand-primary)" : "var(--text-muted)" }}>
              {i + 1}. {s}
            </span>
          </div>
        ))}
      </div>

      {/* Step 0: Event Info */}
      {step === 0 && (
        <div className="card-static animate-fade-in" style={{ padding: 28, maxWidth: 680 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Event Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Event Name" name="name" value={form.name} onChange={handleForm}
              placeholder="e.g. Annual Sports Meet 2026" required />
            <Input label="Description" name="description" value={form.description} onChange={handleForm}
              placeholder="Describe the event…" as="textarea" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleForm} required />
              <Input label="End Date"   name="endDate"   type="date" value={form.endDate}   onChange={handleForm} required />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Button variant="primary" onClick={() => setStep(1)} disabled={!form.name || !form.startDate || !form.endDate}>
                Next: Add Sports →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Sports */}
      {step === 1 && (
        <div className="animate-fade-in" style={{ maxWidth: 720 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              Add Sports <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 400 }}>(max 10)</span>
            </h2>
            <Button variant="outline" size="sm" onClick={addSport} disabled={sports.length >= 10}>+ Add Sport</Button>
          </div>

          {sports.map((sp, i) => (
            <div key={i} className="card-static animate-fade-in-up" style={{ padding: 20, marginBottom: 14, animationDelay: `${i * 60}ms` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Sport #{i + 1}</span>
                {sports.length > 1 && (
                  <Button variant="danger" size="sm" onClick={() => removeSport(i)}>Remove</Button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input label="Sport Name" name="name" value={sp.name} onChange={e => handleSport(i, e)} placeholder="e.g. Cricket" required />
                <Input label="Type" name="type" as="select" value={sp.type} onChange={e => handleSport(i, e)}>
                  <option value="Individual">Individual</option>
                  <option value="Team">Team</option>
                </Input>
                <Input label="Reg. Start" name="regStart" type="date" value={sp.regStart} onChange={e => handleSport(i, e)} />
                <Input label="Reg. End"   name="regEnd"   type="date" value={sp.regEnd}   onChange={e => handleSport(i, e)} />
                {sp.type === "Team" && (
                  <>
                    <Input label="Min Players" name="minPlayers" type="number" value={sp.minPlayers} onChange={e => handleSport(i, e)} placeholder="e.g. 5" />
                    <Input label="Max Players" name="maxPlayers" type="number" value={sp.maxPlayers} onChange={e => handleSport(i, e)} placeholder="e.g. 11" />
                    <Input label="Max Substitutes" name="maxSubstitutes" type="number" value={sp.maxSubstitutes} onChange={e => handleSport(i, e)} placeholder="e.g. 3" />
                  </>
                )}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
            <Button variant="primary" onClick={() => setStep(2)} disabled={sports.some(s => !s.name)}>
              Next: Review →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="card-static animate-fade-in" style={{ padding: 28, maxWidth: 680 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Review & Submit</h2>

          <div style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 16, border: "1px solid var(--border)", marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Event Details</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Name", value: form.name },
                { label: "Start", value: form.startDate },
                { label: "End", value: form.endDate },
                { label: "Sports", value: sports.length },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}: </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
                </div>
              ))}
            </div>
            {form.description && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 10 }}>{form.description}</p>}
          </div>

          <div style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 16, border: "1px solid var(--border)", marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Sports ({sports.length})</p>
            {sports.map((sp, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < sports.length - 1 ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{sp.name || "Unnamed"}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{sp.type}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={() => setStep(1)}>← Edit Sports</Button>
            <Button variant="primary" loading={loading} onClick={submit} style={{ flex: 1 }}>
              🚀 Create Event
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
