import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { userAPI } from "../api/api";
import { useToast } from "../context/ToastContext";
import Modal from "../components/common/Modal";
import { User, Mail, Phone, Calendar, Building, GraduationCap, Shield, Save, Edit2, X, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    department: user?.department || "",
    yearOfStudy: user?.yearOfStudy || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
    gender: user?.gender || "Other",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await userAPI.getProfile(user.id);
        const d = res.data;
        setFormData({
          fullName: d.fullName || d.name || "",
          email: d.email || "",
          phoneNumber: d.phoneNumber || "",
          department: d.department || "",
          yearOfStudy: d.yearOfStudy || "",
          dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth).toISOString().split('T')[0] : "",
          gender: d.gender || "Other",
        });
      } catch {
        showToast("Could not load full profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFullProfile();
  }, [user?.id, showToast]);

  const calculateProgress = () => {
    const fields = ['fullName', 'email', 'phoneNumber', 'department', 'yearOfStudy', 'dateOfBirth'];
    const completed = fields.filter(f => !!formData[f]).length;
    return Math.round((completed / fields.length) * 100);
  };

  const progress = calculateProgress();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Numbers-only validation for phone and year
    if (["phoneNumber", "yearOfStudy"].includes(name)) {
      if (value !== "" && !/^\d+$/.test(value)) return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userAPI.update(user.id, formData);
      
      const updatedUser = { 
        ...user, 
        name: formData.fullName, 
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      };
      updateUser(updatedUser);
      
      showToast("Profile updated successfully!", "success");
      setIsEditing(false);
    } catch {
      showToast("Failed to update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match", "warning");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }

    try {
      setPwdLoading(true);
      await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showToast("Password changed successfully", "success");
      setPwdModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Manage your personal and academic information.</p>
        </div>
        {!isEditing && (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            <Edit2 size={16} style={{ marginRight: 8 }} /> Edit Profile
          </Button>
        )}
      </div>

      <div className="dashboard-grid-profile" style={{ display: "grid", gap: 24, alignItems: "start" }}>
        {/* Left Column: Summary Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card-static" style={{ padding: 24, textAlign: "center" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%", background: "var(--brand-gradient)",
              margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, fontWeight: 800, color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
            }}>
              {(user?.name || "U")[0]}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>{user?.email}</p>
            <Badge status={user?.role} dot />
            
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "left" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Profile Completion</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 8, background: "var(--bg-elevated)", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: "var(--brand-gradient)", transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-primary)" }}>{progress}%</span>
              </div>
              {progress < 100 && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 6, alignItems: "center" }}>
                  <AlertCircle size={14} style={{ color: "var(--warning)" }} /> Complete your details to reach 100%
                </p>
              )}
            </div>
          </div>

          <div className="card-static" style={{ padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 16 }}>Security</p>
            <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => setPwdModalOpen(true)}>
              <Lock size={14} style={{ marginRight: 8 }} /> Change Password
            </Button>
          </div>
        </div>

        {/* Right Column: Details/Edit */}
        <div className="card-static" style={{ padding: 32 }}>
          <form onSubmit={handleSave}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 10 }}>
                <User size={18} /> {isEditing ? "Edit Personal Details" : "Personal Details"}
              </h3>
              {isEditing && (
                <button type="button" onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600 }}>
                  <X size={16} /> Cancel
                </button>
              )}
            </div>

            <div className="grid-2" style={{ marginBottom: 32 }}>
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} icon={<User size={16}/>} disabled={!isEditing} />
              <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail size={16}/>} disabled={!isEditing} />
              <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} icon={<Phone size={16}/>} placeholder="+91 00000 00000" disabled={!isEditing} />
              <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} icon={<Calendar size={16}/>} disabled={!isEditing} />
              <Input label="Gender" name="gender" as="select" value={formData.gender} onChange={handleChange} disabled={!isEditing}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Input>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <GraduationCap size={18} /> Academic Details
            </h3>
            <div className="grid-2" style={{ marginBottom: 32 }}>
              <Input label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science" disabled={!isEditing} />
              <Input label="Year of Study" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} placeholder="e.g. 3rd Year" disabled={!isEditing} />
            </div>

            {isEditing && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={loading} style={{ padding: "10px 32px" }}>
                  <Save size={18} style={{ marginRight: 8 }} /> Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal 
        open={pwdModalOpen} 
        onClose={() => setPwdModalOpen(false)} 
        title="🔒 Change Password"
        size="sm"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setPwdModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={pwdLoading} onClick={handlePasswordChange}>Update Password</Button>
          </>
        )}
      >
        <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input 
            label="Current Password" 
            type={showCurrentPwd ? "text" : "password"}
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
            icon={<Lock size={16}/>}
            iconRight={
              <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "var(--text-muted)" }}>
                {showCurrentPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            }
          />
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
          <Input 
            label="New Password" 
            type={showNewPwd ? "text" : "password"}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
            icon={<Shield size={16}/>}
            iconRight={
              <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "var(--text-muted)" }}>
                {showNewPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            }
          />
          <Input 
            label="Confirm New Password" 
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
            icon={<CheckCircle2 size={16}/>}
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
}
