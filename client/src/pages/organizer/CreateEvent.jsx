import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { eventAPI, sportAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import { Info, Plus, Trophy, ChevronRight, ChevronLeft, Save, Clock, Calendar as CalIcon } from "lucide-react";

const STEPS = ["Event Info", "Sports & Rules", "Final Review"];

const EMPTY_SPORT = { 
  name: "", 
  type: "Individual", 
  minPlayers: "1", 
  maxPlayers: "1", 
  rules: "", 
  startTime: "10:00 AM",
  startDate: "",
  endDate: ""
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "", location: "" });
  const [sports, setSports] = useState([{ ...EMPTY_SPORT }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleForm = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user changes value
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep0 = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Event name is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      newErrors.endDate = "End date cannot be earlier than start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSport = (i, e) => {
    const updated = [...sports];
    const { name, value } = e.target;

    // Numbers-only validation for min/max players
    if (["minPlayers", "maxPlayers"].includes(name)) {
      if (value !== "" && !/^\d+$/.test(value)) return; // Only allow digits
    }

    updated[i] = { ...updated[i], [name]: value };
    setSports(updated);
  };

  const addSport = () => { if (sports.length < 10) setSports([...sports, { ...EMPTY_SPORT, startDate: form.startDate, endDate: form.endDate }]); };
  const removeSport = (i) => { if (sports.length > 1) setSports(sports.filter((_, idx) => idx !== i)); };

  const nextStep = () => {
    if (step === 0 && validateStep0()) {
      // Sync sport dates with event dates by default if empty
      setSports(sports.map(s => ({
        ...s,
        startDate: s.startDate || form.startDate,
        endDate: s.endDate || form.endDate
      })));
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    }
  };

  const submit = async () => {
    try {
      setLoading(true);
      const eventRes = await eventAPI.create({
        ...form,
        maxSports: sports.length
      });

      const newEventId = eventRes.data.eventId;
      const sportPromises = sports.map(sp => 
        sportAPI.create({ 
          ...sp, 
          eventId: newEventId,
          minPlayers: parseInt(sp.minPlayers, 10),
          maxPlayers: parseInt(sp.maxPlayers, 10)
        })
      );

      await Promise.all(sportPromises);
      showToast("Event created successfully!", "success");
      navigate("/my-events");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create event. Name might be taken or limit reached.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">➕ Create New Tournament</h1>
        <p className="page-subtitle">Define your event details and sport rules.</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 32, maxWidth: 800 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              height: 6, borderRadius: 10, marginBottom: 10,
              background: i <= step ? "var(--brand-gradient)" : "var(--border)",
              transition: "all 0.4s ease"
            }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: i === step ? "var(--brand-primary)" : "var(--text-muted)" }}>
              {i + 1}. {s}
            </span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="card-static animate-fade-in" style={{ padding: 32, maxWidth: 700 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <Info size={20} className="text-primary"/> Basic Information
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Input label="Event Name" name="name" value={form.name} onChange={handleForm} error={errors.name} placeholder="e.g. Winter Sports Fest 2026" required />
            <Input label="Event Description" name="description" value={form.description} onChange={handleForm} as="textarea" placeholder="Tell players about the overall event..." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Input label="Start Date" name="startDate" type="date" value={form.startDate} onChange={handleForm} error={errors.startDate} required />
              <Input label="End Date"   name="endDate"   type="date" value={form.endDate}   onChange={handleForm} error={errors.endDate} required />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <Button variant="primary" onClick={nextStep}>
                Next: Sports & Rules <ChevronRight size={18} style={{ marginLeft: 8 }}/>
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-in" style={{ maxWidth: 850 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Add Sports & Rules</h2>
            <Button variant="outline" size="sm" onClick={addSport} disabled={sports.length >= 10}>+ Add Sport</Button>
          </div>

          {sports.map((sp, i) => (
            <div key={i} className="card-static animate-fade-in-up" style={{ padding: 24, marginBottom: 20, animationDelay: `${i * 100}ms` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--brand-primary)" }}>🏆 Sport #{i + 1}</span>
                {sports.length > 1 && (
                  <Button variant="danger" size="sm" onClick={() => removeSport(i)}>Remove</Button>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
                <Input label="Sport Name" name="name" value={sp.name} onChange={e => handleSport(i, e)} placeholder="e.g. Cricket" required />
                <Input label="Type" name="type" as="select" value={sp.type} onChange={e => handleSport(i, e)}>
                  <option value="Individual">Individual</option>
                  <option value="Team">Team</option>
                </Input>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 20, marginBottom: 20 }}>
                <Input label="Match Start Date" name="startDate" type="date" value={sp.startDate} onChange={e => handleSport(i, e)} icon={<CalIcon size={14}/>}/>
                <Input label="Match End Date"   name="endDate"   type="date" value={sp.endDate}   onChange={e => handleSport(i, e)} icon={<CalIcon size={14}/>}/>
                <Input label="Start Time"       name="startTime" type="text" value={sp.startTime} onChange={e => handleSport(i, e)} icon={<Clock size={14}/>} placeholder="10:00 AM" />
                {sp.type === "Team" && (
                  <>
                    <Input label="Min Players" name="minPlayers" type="text" value={sp.minPlayers} onChange={e => handleSport(i, e)} placeholder="1" />
                    <Input label="Max Players" name="maxPlayers" type="text" value={sp.maxPlayers} onChange={e => handleSport(i, e)} placeholder="11" />
                  </>
                )}
              </div>

              <div>
                <Input label="Sport Rules (Be Detailed)" name="rules" as="textarea" value={sp.rules} onChange={e => handleSport(i, e)} placeholder="Enter rules, point system, match duration, etc." required />
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={() => setStep(0)}><ChevronLeft size={18} style={{ marginRight: 8 }}/> Back</Button>
            <Button variant="primary" onClick={nextStep} disabled={sports.some(s => !s.name || !s.rules)}>
              Next: Final Review <ChevronRight size={18} style={{ marginLeft: 8 }}/>
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card-static animate-fade-in" style={{ padding: 32, maxWidth: 700 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>Final Review</h2>
          
          <div style={{ background: "var(--bg-elevated)", borderRadius: 16, padding: 20, border: "1px solid var(--border)", marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Event Overview</h3>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--brand-primary)", marginBottom: 4 }}>{form.name}</p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>📅 {new Date(form.startDate).toLocaleDateString()} - {new Date(form.endDate).toLocaleDateString()}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
             <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Sports Included ({sports.length})</h3>
             {sports.map((sp, i) => (
               <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-card)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{sp.name}</span>
                    <span style={{ fontSize: 12, marginLeft: 8, color: "var(--text-muted)" }}>({sp.type})</span>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                       🕒 {sp.startTime} | 📅 {new Date(sp.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>{sp.rules.substring(0, 30)}...</span>
               </div>
             ))}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>Edit Sports</Button>
            <Button variant="primary" loading={loading} onClick={submit} style={{ flex: 2 }}>
              <Save size={18} style={{ marginRight: 8 }}/> 🚀 Create Tournament
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
