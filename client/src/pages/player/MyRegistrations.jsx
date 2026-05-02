import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import StatCard from "../../components/common/StatCard";

const MOCK_REGS = [
  { id: 1, event: "Annual Sports Meet 2026",    sport: "Badminton",  type: "Individual", status: "Approved",  date: "2026-04-15" },
  { id: 2, event: "Inter-College Cricket League", sport: "Cricket",  type: "Team",       status: "Pending",   date: "2026-04-20", teamName: "CHARUSAT Tigers" },
  { id: 3, event: "Summer Athletics",            sport: "100m Sprint",type: "Individual", status: "Approved",  date: "2026-04-25" },
  { id: 4, event: "Badminton Open",              sport: "Badminton", type: "Individual", status: "Rejected",  date: "2026-03-05" },
];

export default function MyRegistrations() {
  const approved = MOCK_REGS.filter(r => r.status === "Approved").length;
  const pending  = MOCK_REGS.filter(r => r.status === "Pending").length;
  const rejected = MOCK_REGS.filter(r => r.status === "Rejected").length;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">📋 My Registrations</h1>
        <p className="page-subtitle">Track the status of all your sport registrations.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon="📋" label="Total"    value={MOCK_REGS.length} color="primary" delay={0}   />
        <StatCard icon="✅" label="Approved" value={approved}         color="success" delay={100} />
        <StatCard icon="⏳" label="Pending"  value={pending}          color="warning" delay={200} />
        <StatCard icon="❌" label="Rejected" value={rejected}         color="danger"  delay={300} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Sport</th>
              <th>Event</th>
              <th>Type</th>
              <th>Team</th>
              <th>Applied On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_REGS.map((r, i) => (
              <tr key={r.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.sport}</td>
                <td>{r.event}</td>
                <td><Badge status={r.type} /></td>
                <td style={{ color: "var(--text-muted)" }}>{r.teamName || "—"}</td>
                <td style={{ color: "var(--text-muted)" }}>{new Date(r.date).toLocaleDateString()}</td>
                <td><Badge status={r.status} dot /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {MOCK_REGS.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>No registrations yet</p>
        </div>
      )}
    </DashboardLayout>
  );
}
