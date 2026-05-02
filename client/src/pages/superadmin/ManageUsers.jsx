import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/common/StatCard";

const INITIAL_USERS = [
  { id: 1, name: "Arjun Mehta",   email: "arjun@college.edu",    role: "Player",     college: "CHARUSAT" },
  { id: 2, name: "Priya Sharma",  email: "priya@college.edu",    role: "Organizer",  college: "CHARUSAT" },
  { id: 3, name: "Rahul Shah",    email: "rahul@nirma.edu",      role: "Player",     college: "Nirma" },
  { id: 4, name: "Dev Trivedi",   email: "dev@nirma.edu",        role: "Player",     college: "Nirma" },
  { id: 5, name: "Sneha Joshi",   email: "sneha@ddit.ac.in",     role: "Organizer",  college: "DDIT" },
  { id: 6, name: "Aman Patel",    email: "aman@gtu.ac.in",       role: "Player",     college: "GTU" },
];

const ROLES = ["Player", "Organizer"];

export default function ManageUsers() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  const updateRole = () => {
    setUsers(us => us.map(u => u.id === editUser.id ? { ...u, role: newRole } : u));
    setEditUser(null);
  };

  const filtered = users.filter(u => {
    const matchRole   = roleFilter === "All" || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase()) ||
                        u.college.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">👥 Manage Users</h1>
        <p className="page-subtitle">Assign and change user roles across all colleges.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon="👥" label="Total Users"  value={users.length}                              color="primary" delay={0}   />
        <StatCard icon="🏃" label="Players"      value={users.filter(u=>u.role==="Player").length}    color="accent"  delay={100} />
        <StatCard icon="🎯" label="Organizers"   value={users.filter(u=>u.role==="Organizer").length}  color="success" delay={200} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14 }}>🔍</span>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Player", "Organizer"].map(r => (
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
              <th>Name</th>
              <th>Email</th>
              <th>College</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", background: "var(--brand-gradient)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}>
                      {u.name[0]}
                    </div>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                <td>{u.college}</td>
                <td><Badge status={u.role} dot /></td>
                <td>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => { setEditUser(u); setNewRole(u.role); }}
                  >
                    ✏️ Change Role
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <p>No users found.</p>
        </div>
      )}

      {/* Role change modal */}
      <Modal
        open={!!editUser} onClose={() => setEditUser(null)}
        title={`Change Role — ${editUser?.name}`} size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="primary" onClick={updateRole} disabled={newRole === editUser?.role}>Save</Button>
          </>
        }
      >
        {editUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              background: "var(--bg-elevated)", borderRadius: 10, padding: 14, border: "1px solid var(--border)",
              display: "flex", gap: 10, alignItems: "center",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: "var(--brand-gradient)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: "#fff",
              }}>
                {editUser.name[0]}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{editUser.name}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{editUser.college}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Select New Role</label>
              <div style={{ display: "flex", gap: 8 }}>
                {ROLES.map(r => (
                  <button key={r} onClick={() => setNewRole(r)} style={{
                    flex: 1, padding: "12px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${newRole === r ? "var(--brand-primary)" : "var(--border)"}`,
                    background: newRole === r ? "var(--brand-primary-light)" : "var(--bg-elevated)",
                    color: newRole === r ? "var(--brand-primary)" : "var(--text-secondary)",
                    fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                  }}>
                    {r === "Player" ? "🏃 Player" : "🎯 Organizer"}
                  </button>
                ))}
              </div>
            </div>

            {newRole !== editUser.role && (
              <div style={{
                background: "var(--warning-light)", border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--warning)",
              }}>
                ⚠️ This will change {editUser.name}'s role from <strong>{editUser.role}</strong> to <strong>{newRole}</strong>.
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
