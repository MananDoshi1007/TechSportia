import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff, Mail, Lock, User, School, Info } from "lucide-react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const STEPS = ["Profile", "Account", "Done"];

export default function Register() {
  const { register, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", collegeId: "" });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 0 — Profile
  const validateStep0 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.collegeId) e.collegeId = "College ID is required";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      showToast("Please fill all required fields correctly.", "warning");
    }
    return Object.keys(e).length === 0;
  };

  // Step 1 — Account
  const validateStep1 = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    if (!form.password || form.password.length < 6) e.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      showToast("Please fix the errors in the form.", "warning");
    }
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      showToast("Account created successfully! Welcome to TechSportia.", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed. Try again.", "error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-primary)", overflow: "hidden" }}>
      {/* Left brand panel */}
      <div className="hidden md:flex" style={{
        flex: "0 0 380px", position: "relative", overflow: "hidden",
        background: "var(--bg-secondary)", borderRight: "1px solid var(--border)",
        flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48,
      }}>
        <div className="hero-orb animate-blob" style={{ width: 350, height: 350, top: -60, left: -60, background: "var(--brand-primary)", opacity: 0.12 }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 24px",
            background: "var(--brand-gradient)", fontSize: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
          }}>🏆</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 12 }}>Join TechSportia</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32 }}>
            Register as a player to browse events, join teams and compete.
          </p>
          <div style={{
            background: "var(--brand-primary-light)", border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 12, padding: 16,
          }}>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--brand-primary)" }}>Note:</strong> All new accounts start as <strong>Player</strong>. SuperAdmin assigns Organizer role later.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 24px", minWidth: 0,
      }}>
        <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Create Account</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Step {step + 1} of {STEPS.length}</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{
                  height: 4, borderRadius: 4,
                  background: i <= step ? "var(--brand-primary)" : "var(--border)",
                  transition: "background 0.3s",
                }} />
                <span style={{ fontSize: 11, color: i === step ? "var(--brand-primary)" : "var(--text-muted)", fontWeight: 600 }}>
                  {s}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ── Step 0: Profile ── */}
            {step === 0 && (
              <>
                <Input label="Full Name" name="name" value={form.name}
                  onChange={handle} placeholder="e.g. Arjun Mehta" icon={<User size={18} />} error={errors.name} required />
                <Input label="College ID" name="collegeId" type="number" value={form.collegeId}
                  onChange={handle} placeholder="Enter your college ID" icon={<School size={18} />} error={errors.collegeId} required />
                <div style={{
                  background: "var(--bg-elevated)", borderRadius: 10, padding: "12px 14px",
                  border: "1px solid var(--border)", fontSize: 13, color: "var(--text-muted)",
                  display: "flex", gap: 8,
                }}>
                  <Info size={16} style={{ color: "var(--brand-accent)", marginTop: 2 }} />
                  <span>Your role will be <strong style={{ color: "var(--brand-accent)" }}>Player</strong> by default. SuperAdmin can promote you to Organizer later.</span>
                </div>
                <Button type="button" variant="primary" size="lg" onClick={next} style={{ marginTop: 4 }}>
                  Next: Account →
                </Button>
              </>
            )}

            {/* ── Step 1: Account ── */}
            {step === 1 && (
              <>
                <Input label="Email Address" name="email" type="email" value={form.email}
                  onChange={handle} placeholder="you@college.edu" icon={<Mail size={18} />} error={errors.email} required />
                <Input label="Password" name="password" type={showPwd ? "text" : "password"} value={form.password}
                  onChange={handle} placeholder="Min. 6 characters" icon={<Lock size={18} />}
                  iconRight={
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  error={errors.password} required />
                <Input label="Confirm Password" name="confirmPassword" type={showConfirmPwd ? "text" : "password"} value={form.confirmPassword}
                  onChange={handle} placeholder="Repeat password" icon={<Lock size={18} />}
                  iconRight={
                    <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  error={errors.confirmPassword} required />
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <Button type="button" variant="secondary" size="lg" onClick={() => { setErrors({}); setStep(0); }} style={{ flex: 1 }}>
                    ← Back
                  </Button>
                  <Button type="submit" variant="primary" size="lg" loading={loading} style={{ flex: 2 }}>
                    Create Account 🚀
                  </Button>
                </div>
              </>
            )}
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--brand-primary)", fontWeight: 600, textDecoration: "none" }}>
              Sign in →
            </Link>
          </p>
          <p style={{ textAlign: "center", marginTop: 10, fontSize: 12 }}>
            <Link to="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}