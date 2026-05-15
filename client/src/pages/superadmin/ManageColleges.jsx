import { useState, useEffect, useCallback } from "react";
import { collegeAPI } from "../../api/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { useToast } from "../../context/ToastContext";
import Tooltip from "../../components/common/Tooltip";
import { Building, Plus, Trash2, ShieldCheck, ShieldAlert, Mail, Phone, MapPin, User, Lock, Eye, EyeOff } from "lucide-react";

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.title) return data.title;
  return fallback;
};

export default function ManageColleges() {
  const [colleges, setColleges] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const { showToast } = useToast();

  const [newCollege, setNewCollege] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  const fetchColleges = useCallback(async () => {
    try {
      const res = await collegeAPI.getAll();
      setColleges(res.data);
    } catch {
      showToast("Failed to fetch colleges", "error");
    }
  }, [showToast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchColleges(), 0);
    return () => clearTimeout(timer);
  }, [fetchColleges]);

  const handleToggleApproval = async (id) => {
    try {
      await collegeAPI.toggleApproval(id);
      showToast("Status updated successfully", "success");
      fetchColleges();
    } catch {
      showToast("Action failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will remove all users and events linked to this college.")) return;
    try {
      await collegeAPI.delete(id);
      showToast("College removed successfully", "success");
      fetchColleges();
    } catch {
      showToast("Failed to delete college", "error");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    const collegeName = newCollege.name.trim();
    const officialEmail = newCollege.email.trim().toLowerCase();
    const adminEmail = newCollege.adminEmail.trim().toLowerCase();

    if (!collegeName || !officialEmail || !newCollege.adminName.trim() || !adminEmail || !newCollege.adminPassword.trim()) {
      showToast("Please fill all required college and coordinator fields.", "warning");
      return;
    }

    if (officialEmail === adminEmail) {
      showToast("Official email and coordinator login email must be different.", "warning");
      return;
    }

    if (colleges.some(c => c.name?.trim().toLowerCase() === collegeName.toLowerCase())) {
      showToast("A college with this name already exists.", "warning");
      return;
    }

    if (colleges.some(c => c.email?.trim().toLowerCase() === officialEmail)) {
      showToast("College official email already exists.", "warning");
      return;
    }

    if (colleges.some(c => c.email?.trim().toLowerCase() === adminEmail)) {
      showToast("Coordinator login email is already used as a college official email.", "warning");
      return;
    }

    try {
      await collegeAPI.create({
        ...newCollege,
        name: collegeName,
        email: officialEmail,
        adminName: newCollege.adminName.trim(),
        adminEmail,
        adminPassword: newCollege.adminPassword.trim()
      });
      showToast("College & Coordinator created!", "success");
      setIsCreateModalOpen(false);
      setNewCollege({ name: "", email: "", contactNumber: "", address: "", adminName: "", adminEmail: "", adminPassword: "" });
      fetchColleges();
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to create college. Ensure all names and emails are unique."), "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🏢 Manage Colleges</h1>
        <p className="page-subtitle">Directly register institutions and their coordinators.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
        <StatCard icon={<Building size={20}/>} label="Total Institutions" value={colleges.length} color="primary" />
        <StatCard icon={<ShieldCheck size={20}/>} label="Active" value={colleges.filter(c => c.isApproved).length} color="success" />
        <StatCard icon={<ShieldAlert size={20}/>} label="Suspended" value={colleges.filter(c => !c.isApproved).length} color="warning" />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={18} style={{ marginRight: 8 }} /> Add New Institution
        </Button>
      </div>

      <div className="card-static" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "var(--bg-elevated)", textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "16px 20px" }}>College Details</th>
              <th style={{ padding: "16px 20px" }}>Contact Info</th>
              <th style={{ padding: "16px 20px" }}>Status</th>
              <th style={{ padding: "16px 20px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((c) => (
              <tr key={c.collegeId} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={10}/> {c.address || "No address provided"}
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Mail size={12}/> {c.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Phone size={12}/> {c.contactNumber || "N/A"}
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <Badge status={c.isApproved ? "Approved" : "Suspended"} dot />
                </td>
                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Tooltip text={c.isApproved ? "Suspend Institution" : "Re-activate Institution"}>
                      <Button variant={c.isApproved ? "warning" : "success"} size="sm" onClick={() => handleToggleApproval(c.collegeId)}>
                        {c.isApproved ? <ShieldAlert size={14}/> : <ShieldCheck size={14}/>}
                      </Button>
                    </Tooltip>
                    <Tooltip text="Delete Permanently">
                      <Button variant="danger" size="sm" onClick={() => handleDelete(c.collegeId)}>
                        <Trash2 size={14} />
                      </Button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="🏢 Register Institution" size="md">
        <form onSubmit={handleCreate}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>College Details</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Input label="College Name" value={newCollege.name} onChange={e => setNewCollege({...newCollege, name: e.target.value})} icon={<Building size={14}/>} required />
                <Input label="Official Email" type="email" value={newCollege.email} onChange={e => setNewCollege({...newCollege, email: e.target.value})} icon={<Mail size={14}/>} required />
                  <Input label="Contact Number" value={newCollege.contactNumber} onChange={e => {
                    const val = e.target.value;
                    if (val === "" || /^\d+$/.test(val)) {
                      setNewCollege({...newCollege, contactNumber: val});
                    }
                  }} icon={<Phone size={14}/>} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Coordinator Details</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Input label="Admin Name" value={newCollege.adminName} onChange={e => setNewCollege({...newCollege, adminName: e.target.value})} icon={<User size={14}/>} required />
                <Input label="Admin Login Email" type="email" value={newCollege.adminEmail} onChange={e => setNewCollege({...newCollege, adminEmail: e.target.value})} icon={<Mail size={14}/>} required />
                <Input 
                  label="Initial Password" 
                  type={showAdminPassword ? "text" : "password"} 
                  value={newCollege.adminPassword} 
                  onChange={e => setNewCollege({...newCollege, adminPassword: e.target.value})} 
                  icon={<Lock size={14}/>} 
                  required 
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </div>
            </div>
          </div>
          <Input label="Full Address" value={newCollege.address} onChange={e => setNewCollege({...newCollege, address: e.target.value})} as="textarea" placeholder="Street, City, State, ZIP..." />
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="primary" type="submit" style={{ flex: 2 }}>🚀 Register & Create Admin</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
