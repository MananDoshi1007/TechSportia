import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Badge from "../../components/common/Badge";
import StatCard from "../../components/common/StatCard";
import { registrationAPI } from "../../api/api";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";

export default function MyRegistrations() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchRegs = async () => {
      try {
        const res = await registrationAPI.getMyRegistrations();
        setRegistrations(res.data);
      } catch {
        showToast("Failed to load your registrations.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRegs();
  }, [showToast]);

  const approved = registrations.filter(r => r.isApproved).length;
  const pending  = registrations.filter(r => !r.isApproved).length;

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">📋 My Registrations</h1>
        <p className="page-subtitle">Track the status of all your sport registrations.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon="📋" label="Total"    value={registrations.length} color="primary" delay={0}   />
        <StatCard icon="✅" label="Approved" value={approved}         color="success" delay={100} />
        <StatCard icon="⏳" label="Pending"  value={pending}          color="warning" delay={200} />
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
            {registrations.map((r, i) => {
              const isDraft = r.type === "Team" && r.isDraft;
              const status = isDraft ? "Draft" : (r.isApproved === true ? "Approved" : (r.isApproved === false ? "Rejected" : "Pending"));
              
              return (
                <tr key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.sportName}</td>
                  <td>{r.eventName}</td>
                  <td><Badge status={r.type} /></td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {r.teamName ? (
                      <span 
                        onClick={() => navigate("/my-teams")} 
                        style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600, textDecoration: "underline" }}
                      >
                        {r.teamName}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{new Date(r.date).toLocaleDateString()}</td>
                  <td style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Badge status={status} dot />
                    {isDraft && (
                      <button 
                        onClick={() => navigate(`/register-team/${r.sportId}`)}
                        className="btn-ghost btn-sm"
                        style={{ padding: "4px 8px", fontSize: 11 }}
                      >
                        Continue →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {registrations.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 15, fontWeight: 600 }}>No registrations yet</p>
        </div>
      )}
    </DashboardLayout>
  );
}
