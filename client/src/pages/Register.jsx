import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff, Mail, Lock, User, School, Info, AlertCircle, CheckCircle2, Phone, GraduationCap } from "lucide-react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { collegeAPI } from "../api/api";

const STEPS = ["Profile", "Account", "Done"];

export default function Register() {
  const { user, register, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    collegeId: "",
    phoneNumber: "",
    yearOfStudy: ""
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // ── Fetch colleges for dropdown ──
  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await collegeAPI.getPublicList();
        setColleges(res.data);
      } catch {
        showToast("Failed to load colleges. Please refresh.", "error");
      } finally {
        setCollegesLoading(false);
      }
    };
    fetchColleges();
  }, [showToast]);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
    if (serverError) setServerError("");
  };

  // ── Step 0 — Profile validation ──
  const validateStep0 = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      e.name = "Name must be at least 2 characters";
    } else if (form.name.trim().length > 100) {
      e.name = "Name must be under 100 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(form.name.trim())) {
      e.name = "Name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    if (!form.collegeId) {
      e.collegeId = "Please select your college";
    }

    setErrors(e);
    if (Object.keys(e).length > 0) {
      showToast("Please fill all required fields correctly.", "warning");
    }
    return Object.keys(e).length === 0;
  };

  // ── Step 1 — Account validation ──
  const validateStep1 = () => {
    const e = {};

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address";
    }

    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    } else if (form.password.length > 100) {
      e.password = "Password must be under 100 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(form.password)) {
      e.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      e.password = "Password must contain at least one number";
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      e.password = "Password must contain at least one special character";
    }

    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

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
    setServerError("");

    // Final validation before submit
    if (!validateStep1()) return;

    const result = await register(form);

    if (result.success) {
      showToast("Account created successfully! Welcome to TechSportia.", "success");
      navigate("/dashboard");
    } else {
      setServerError(result.message);
      showToast(result.message, "error");
      // If it's an email-related error, go back to step 1
      if (result.message.toLowerCase().includes("email")) {
        setStep(1);
        setErrors({ email: result.message });
      }
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

          {/* Server error banner */}
          {serverError && (
            <div style={{
              marginBottom: 20,
              padding: "12px 16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "var(--danger)",
              animation: "fadeInUp 0.3s ease",
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ── Step 0: Profile ── */}
            {step === 0 && (
              <>
                <Input label="Full Name" name="name" value={form.name}
                  onChange={handle} placeholder="e.g. Arjun Mehta" icon={<User size={18} />} error={errors.name} showAsterisk={true} />

                <div className="grid-2">
                  <Input label="Phone Number" name="phoneNumber" value={form.phoneNumber}
                    onChange={e => {
                      if (e.target.value === "" || /^\d+$/.test(e.target.value)) handle(e);
                    }} placeholder="9988776655" icon={<Phone size={16} />} />
                  <Input label="Year of Study" name="yearOfStudy" value={form.yearOfStudy}
                    onChange={e => {
                      if (e.target.value === "" || /^\d+$/.test(e.target.value)) handle(e);
                    }} placeholder="e.g. 2" icon={<GraduationCap size={16} />} />
                </div>

                {/* College dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.01em" }}>
                    College <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                      color: "var(--text-muted)", fontSize: 16, pointerEvents: "none", display: "flex",
                    }}>
                      <School size={18} />
                    </span>
                    <select
                      name="collegeId"
                      value={form.collegeId}
                      onChange={handle}
                      className={`input ${errors.collegeId ? "input-error" : ""}`}
                      style={{ paddingLeft: 42, cursor: "pointer" }}
                    >
                      <option value="">
                        {collegesLoading ? "Loading colleges..." : "Select your college"}
                      </option>
                      {colleges.map((c) => (
                        <option key={c.collegeId} value={c.collegeId}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.collegeId && <span style={{ fontSize: 12, color: "var(--danger)" }}>{errors.collegeId}</span>}
                </div>

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
                <Input label="Email Address" name="email" type="text" value={form.email}
                  onChange={handle} placeholder="you@college.edu" icon={<Mail size={18} />} error={errors.email} showAsterisk={true} />
                <Input label="Password" name="password" type={showPwd ? "text" : "password"} value={form.password}
                  onChange={handle} placeholder="Min. 6 characters" icon={<Lock size={18} />}
                  iconRight={
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  error={errors.password} showAsterisk={true} />

                {/* Password strength criteria list */}
                {form.password && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4, padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Password Requirements</p>
                    {[
                      { label: "6+ Characters", met: form.password.length >= 6, hint: "Needs more characters" },
                      { label: "Uppercase Letter", met: /[A-Z]/.test(form.password), hint: "Add 1 capital letter" },
                      { label: "Lowercase Letter", met: /[a-z]/.test(form.password), hint: "Add 1 small letter" },
                      { label: "Number", met: /[0-9]/.test(form.password), hint: "Add 1 numeric digit" },
                      { label: "Special Character", met: /[^A-Za-z0-9]/.test(form.password), hint: "Add 1 symbol (!@#$%^&*)" },
                    ].map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        {c.met ? <CheckCircle2 size={14} style={{ color: "var(--success)" }} /> : <AlertCircle size={14} style={{ color: "var(--text-muted)", opacity: 0.5 }} />}
                        <span style={{ color: c.met ? "var(--success)" : "var(--text-secondary)", fontWeight: c.met ? 600 : 400 }}>{c.label}</span>
                        {!c.met && <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>{c.hint}</span>}
                      </div>
                    ))}
                  </div>
                )}

                <Input label="Confirm Password" name="confirmPassword" type={showConfirmPwd ? "text" : "password"} value={form.confirmPassword}
                  onChange={handle} placeholder="Repeat password" icon={<Lock size={18} />}
                  iconRight={
                    <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                      {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  error={errors.confirmPassword} showAsterisk={true} />

                {/* Password match indicator */}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: -8, fontSize: 12, color: "var(--success)" }}>
                    <CheckCircle2 size={14} />
                    <span>Passwords match</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <Button type="button" variant="secondary" size="lg" onClick={() => { setErrors({}); setServerError(""); setStep(0); }} style={{ flex: 1 }}>
                    ← Back
                  </Button>
                  <Button type="button" variant="primary" size="lg" onClick={next} style={{ flex: 2 }}>
                    Next: Review →
                  </Button>
                </div>
              </>
            )}

            {/* ── Step 2: Review & Submit ── */}
            {step === 2 && (
              <>
                <div style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14,
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    Review your details
                  </h3>

                  {[
                    { label: "Full Name", value: form.name },
                    { label: "Email", value: form.email },
                    { label: "College", value: colleges.find(c => String(c.collegeId) === String(form.collegeId))?.name || `ID: ${form.collegeId}` },
                    { label: "Role", value: "Player (default)" },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <Button type="button" variant="secondary" size="lg" onClick={() => { setErrors({}); setServerError(""); setStep(1); }} style={{ flex: 1 }}>
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