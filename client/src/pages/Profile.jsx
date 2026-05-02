import { useState, useRef } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import {
  User, Mail, Shield, School, Camera, Lock, CheckCircle,
  AlertCircle, Edit3, ChevronRight, Phone, CalendarDays,
  Users, BookOpen, Info, Link, Globe, Eye, EyeOff
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("personal"); // personal, security
  const [isEditing, setIsEditing] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const formRef = useRef(null);

  // Mock profile completion - Change to 100 to see the "Success" state
  const completionProgress = 100;
  const isComplete = completionProgress === 100;

  const handleCompleteNow = () => {
    setActiveTab("personal");
    setIsEditing(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Manage your personal information and account security.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 32, alignItems: "start" }}>

        {/* ── Left Column: Profile Summary ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Profile Card */}
          <div className="card" style={{ padding: 32, textAlign: "center", position: "relative" }}>
            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 20px" }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: "var(--brand-gradient)", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 48,
                fontWeight: 800, color: "#fff", boxShadow: "0 8px 32px rgba(124,58,237,0.3)"
              }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <button style={{
                position: "absolute", bottom: 4, right: 4, width: 32, height: 32,
                borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                color: "var(--text-primary)", boxShadow: "var(--shadow-md)"
              }}>
                <Camera size={14} />
              </button>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
              {user?.role} • Since April 2026
            </p>

            <div className="divider" style={{ margin: "20px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: <Mail size={14} />, text: user?.email },
                { icon: <School size={14} />, text: user?.collegeName || "Not set" },
                { icon: <Shield size={14} />, text: `ID: #${user?.collegeId || "N/A"}` },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--brand-primary)" }}>{item.icon}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Widget (Evolutionary UI) */}
          <div className="card" style={{
            padding: 24,
            background: isComplete ? "rgba(16, 185, 129, 0.08)" : "var(--brand-gradient-soft)",
            border: isComplete ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid var(--brand-primary-light)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Success Background Pattern */}
            {isComplete && (
              <div style={{
                position: "absolute", top: -20, right: -20, opacity: 0.1, color: "var(--success)"
              }}>
                <CheckCircle size={100} />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: isComplete ? "var(--success)" : "var(--brand-primary)"
              }}>
                {isComplete ? "Profile Completed" : "Profile Status"}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 800,
                color: isComplete ? "var(--success)" : "var(--brand-primary)"
              }}>
                {completionProgress}%
              </span>
            </div>

            <div style={{
              height: 6,
              background: isComplete ? "rgba(16, 185, 129, 0.1)" : "rgba(124,58,237,0.1)",
              borderRadius: 3, overflow: "hidden", marginBottom: 16
            }}>
              <div style={{
                height: "100%",
                width: `${completionProgress}%`,
                background: isComplete ? "var(--success)" : "var(--brand-primary)",
                borderRadius: 3, transition: "all 1s ease"
              }} />
            </div>

            <p style={{
              fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6,
              marginBottom: isComplete ? 0 : 16
            }}>
              {isComplete
                ? "Excellent! Your athlete profile is fully optimized for all events and recruitment."
                : "Add your department and social links to complete your athlete profile."
              }
            </p>

            {!isComplete && (
              <Button variant="outline" size="sm" onClick={handleCompleteNow} style={{ width: "100%", background: "rgba(255,255,255,0.05)" }}>
                Complete Now <ChevronRight size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* ── Right Column: Tabs & Forms ── */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>

          {/* Tabs Navigation */}
          <div style={{ display: "flex", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
            {[
              { id: "personal", label: "Personal Info", icon: <User size={16} /> },
              { id: "security", label: "Security", icon: <Lock size={16} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "16px 24px", display: "flex", alignItems: "center", gap: 10,
                  fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
                  background: activeTab === tab.id ? "var(--bg-card)" : "transparent",
                  color: activeTab === tab.id ? "var(--brand-primary)" : "var(--text-muted)",
                  borderBottom: activeTab === tab.id ? "2px solid var(--brand-primary)" : "2px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 32 }}>

            {activeTab === "personal" && (
              <div className="animate-fade-in" ref={formRef}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Profile Details</h3>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Manage your information for event registrations.</p>
                  </div>
                  {!isEditing && (
                    <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit3 size={14} /> Edit Profile
                    </Button>
                  )}
                </div>

                <form style={{ display: "flex", flexDirection: "column", gap: 32 }}>

                  {/* Section: Basic Info */}
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <User size={14} /> Basic Information
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      <Input label="Full Name" defaultValue={user?.name} disabled={!isEditing} icon={<User size={16} />} />
                      <Input label="Email Address" defaultValue={user?.email} disabled icon={<Mail size={16} />} helper="Primary email" />
                      <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" disabled={!isEditing} icon={<Phone size={16} />} />
                      <Input label="Date of Birth" type="date" disabled={!isEditing} icon={<CalendarDays size={16} />} />
                      <Input label="Gender" as="select" disabled={!isEditing} icon={<Users size={16} />}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Input>
                    </div>
                  </div>

                  {/* Section: Academic Info */}
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <School size={14} /> Academic Information
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      <Input label="College Name" defaultValue={user?.collegeName} disabled icon={<School size={16} />} />
                      <Input label="College ID" defaultValue={user?.collegeId} disabled icon={<Shield size={16} />} />
                      <Input label="Department / Branch" placeholder="e.g. Computer Engineering" disabled={!isEditing} icon={<BookOpen size={16} />} />
                      <Input label="Year of Study" as="select" disabled={!isEditing} icon={<CalendarDays size={16} />}>
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year +</option>
                      </Input>
                    </div>
                  </div>

                  {/* Section: Social */}
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Link size={14} /> Social Links
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      <Input label="LinkedIn Profile" placeholder="https://linkedin.com/in/..." disabled={!isEditing} icon={<Link size={16} />} />
                      <Input label="Instagram Profile" placeholder="https://instagram.com/..." disabled={!isEditing} icon={<Globe size={16} />} />
                    </div>
                  </div>

                  {isEditing && (
                    <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "flex-end" }}>
                      <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button variant="primary" onClick={() => {
                        setIsEditing(false);
                        showToast("Profile details saved successfully!", "success");
                      }}>Save All Changes</Button>
                    </div>
                  )}
                </form>

                <div className="divider" style={{ margin: "40px 0" }} />

                <div style={{
                  padding: 20, borderRadius: 12, background: "var(--bg-elevated)",
                  border: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "center"
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", background: "var(--success-light)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)"
                  }}>
                    <CheckCircle size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Identity Verified</h4>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Your account is verified via your college email address.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Security Settings</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Manage your password and account security options.</p>
                </div>

                <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Change Password</h4>
                  <form style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
                    <Input label="Current Password" type="password" placeholder="••••••••" icon={<Lock size={16} />} />

                    <Input
                      label="New Password"
                      type={showNewPass ? "text" : "password"}
                      placeholder="••••••••"
                      icon={<Lock size={16} />}
                      iconRight={
                        <div onClick={() => setShowNewPass(!showNewPass)} style={{ cursor: "pointer", display: "flex" }}>
                          {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </div>
                      }
                    />

                    <Input
                      label="Confirm New Password"
                      type={showConfirmPass ? "text" : "password"}
                      placeholder="••••••••"
                      icon={<Lock size={16} />}
                      iconRight={
                        <div onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ cursor: "pointer", display: "flex" }}>
                          {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </div>
                      }
                    />

                    <Button variant="primary" style={{ alignSelf: "flex-start", marginTop: 8 }} onClick={(e) => {
                      e.preventDefault();
                      showToast("Password changed successfully!", "success");
                    }}>Update Password</Button>
                  </form>
                </div>

                <div style={{
                  padding: 20, borderRadius: 12, background: "var(--danger-light)",
                  border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", gap: 16, alignItems: "center"
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)"
                  }}>
                    <AlertCircle size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Danger Zone</h4>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Delete your account and all associated data permanently.</p>
                  </div>
                  <Button variant="danger" size="sm">Delete Account</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
