import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/common/StatCard";

const INITIAL_COLLEGES = [
  { id: 1, name: "CHARUSAT University",  email: "admin@charusat.ac.in", events: 4, users: 120, status: "Approved" },
  { id: 2, name: "Nirma University",     email: "admin@nirmauni.ac.in", events: 2, users: 85,  status: "Approved" },
  { id: 3, name: "DDIT",                email: "admin@ddit.ac.in",     events: 1, users: 40,  status: "Approved" },
  { id: 4, name: "GTU",                 email: "admin@gtu.ac.in",      events: 0, users: 0,   status: "Pending"  },
];

export default function ManageColleges() {
  const [colleges, setColleges] = useState(INITIAL_COLLEGES);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const setStatus = (id, status) =>
    setColleges(cs => cs.map(c => c.id === id ? { ...c, status } : c));

  const remove = (id) => {
    setColleges(cs => cs.filter(c => c.id !== id));
    setDeleteTarget(null);
  };

  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">🏫 Manage Colleges</h1>
        <p className="page-subtitle">Approve, review and manage college accounts on the platform.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon="🏫" label="Total"    value={colleges.length}                              color="primary" delay={0}   />
        <StatCard icon="✅" label="Approved" value={colleges.filter(c=>c.status==="Approved").length} color="success" delay={100} />
        <StatCard icon="⏳" label="Pending"  value={colleges.filter(c=>c.status==="Pending").length}  color="warning" delay={200} />
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 400, marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14 }}>🔍</span>
        <input
          className="input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search colleges…"
          style={{ paddingLeft: 36 }}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>College Name</th>
              <th>Email</th>
              <th>Events</th>
              <th>Users</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.events}</td>
                <td>{c.users}</td>
                <td><Badge status={c.status} dot /></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    {c.status === "Pending" && (
                      <Button variant="success" size="sm" onClick={() => setStatus(c.id, "Approved")}>Approve</Button>
                    )}
                    {c.status === "Approved" && (
                      <Button variant="secondary" size="sm" onClick={() => setStatus(c.id, "Pending")}>Suspend</Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => setDeleteTarget(c)}>Delete</Button>
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
          <p>No colleges found.</p>
        </div>
      )}

      {/* Confirm delete */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete College" size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => remove(deleteTarget.id)}>Delete</Button>
          </>
        }
      >
        {deleteTarget && (
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            Are you sure you want to delete <strong style={{ color: "var(--text-primary)" }}>{deleteTarget.name}</strong>?
            This will remove all associated data. This action cannot be undone.
          </p>
        )}
      </Modal>
    </DashboardLayout>
  );
}
