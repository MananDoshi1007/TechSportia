import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/common/StatCard";
import { userAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import Tooltip from "../../components/common/Tooltip";
import { Trash2, Edit3, User, Shield, Users } from "lucide-react";

const ROLES = ["Player", "Organizer", "SuperAdmin"];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAll();
      setUsers(res.data || []);
    } catch {
      showToast("Failed to fetch users.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = async () => {
    try {
      setUpdating(true);
      await userAPI.assignRole({
        userId: editUser.id,
        role: newRole
      });
      showToast(`User ${editUser.name} is now a ${newRole}`, "success");
      setEditUser(null);
      fetchUsers();
    } catch {
      showToast("Failed to update role.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const removeUser = async (id) => {
    try {
      setDeleting(true);
      await userAPI.delete(id);
      showToast("User removed from platform.", "success");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      showToast("Failed to delete user.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter(u => {
    const matchRole   = roleFilter === "All" || u.role === roleFilter;
    const matchSearch = (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
                        (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
                        (u.collegeName || "").toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p>Loading users...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">👥 Manage Users</h1>
        <p className="page-subtitle">Promote users or remove accounts from the platform.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon="👥" label="Total Users"  value={users.length}                              color="primary" delay={0}   />
        <StatCard icon="🏃" label="Players"      value={users.filter(u=>u.role==="Player").length}    color="accent"  delay={100} />
        <StatCard icon="🎯" label="Organizers"   value={users.filter(u=>u.role==="Organizer").length}  color="success" delay={200} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14 }}>🔍</span>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email or college…" style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Player", "Organizer", "SuperAdmin"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{
              padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${roleFilter === r ? "var(--brand-primary)" : "var(--border)"}`,
              background: roleFilter === r ? "var(--brand-primary-light)" : "var(--bg-elevated)",
              color: roleFilter === r ? "var(--brand-primary)" : "var(--text-secondary)",
              transition: "all 0.2s", fontFamily: "Inter, sans-serif",
            }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>User Details</th>
              <th>College</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: "var(--brand-gradient)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}>
                      {(u.name || "U")[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{u.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{u.collegeName || "N/A"}</td>
                <td><Badge status={u.role} dot /></td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Tooltip text="Change User Role">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => { setEditUser(u); setNewRole(u.role); }}
                        disabled={u.role === "SuperAdmin" && u.email === "admin@techsportia.com"}
                      >
                        <Edit3 size={14} />
                      </Button>
                    </Tooltip>
                    <Tooltip text="Delete Account">
                      <Button
                        variant="danger" size="sm"
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.role === "SuperAdmin" && u.email === "admin@techsportia.com"}
                      >
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

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <p>No users matched your search.</p>
        </div>
      )}

      {/* Role change modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Update Role" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="primary" onClick={updateRole} loading={updating} disabled={newRole === editUser?.role}>Apply Change</Button>
          </>
        }
      >
        {editUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Select Role for {editUser.name}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ROLES.map(r => (
                  <button key={r} onClick={() => setNewRole(r)} style={{
                    flex: "1 0 45%", padding: "12px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${newRole === r ? "var(--brand-primary)" : "var(--border)"}`,
                    background: newRole === r ? "var(--brand-primary-light)" : "var(--bg-elevated)",
                    color: newRole === r ? "var(--brand-primary)" : "var(--text-secondary)",
                    fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                  }}>
                    {r === "Player" ? "🏃 Player" : r === "Organizer" ? "🎯 Organizer" : "👑 Admin"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Removal" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Keep User</Button>
            <Button variant="danger" loading={deleting} onClick={() => removeUser(deleteTarget.id)}>Delete Account</Button>
          </>
        }
      >
        {deleteTarget && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={30} />
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Are you sure you want to remove <strong style={{ color: "var(--text-primary)" }}>{deleteTarget.name}</strong>?
              This action will permanently delete their account and history.
            </p>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
