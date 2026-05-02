import Badge from "../common/Badge";
import Button from "../common/Button";

/**
 * EventCard – displays a sports event tile
 * status: "Draft" | "RegistrationOpen" | "Ongoing" | "Completed"
 */
export default function EventCard({ event, onView, onRegister, showActions = true }) {
  const {
    id,
    name = "Unnamed Event",
    collegeName = "—",
    status = "Draft",
    startDate,
    endDate,
    sportsCount = 0,
    teamsCount = 0,
    description = "",
  } = event || {};

  const statusKey = status.replace(/\s+/g, "").toLowerCase();
  const isOpen = statusKey === "registrationopen" || statusKey === "open";

  return (
    <div
      className="card animate-fade-in-up"
      style={{ display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" }}
    >
      {/* Top colour strip */}
      <div style={{
        height: 4,
        background: isOpen ? "var(--brand-gradient)" : "var(--border)",
      }} />

      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 4 }}>
              {name}
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              🏫 {collegeName}
            </p>
          </div>
          <Badge status={status} dot />
        </div>

        {/* Description */}
        {description && (
          <p style={{
            fontSize: 13, color: "var(--text-secondary)",
            lineHeight: 1.5, display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {description}
          </p>
        )}

        {/* Meta */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 8, marginTop: "auto",
        }}>
          {[
            { icon: "📅", label: "Start", value: startDate ? new Date(startDate).toLocaleDateString() : "TBD" },
            { icon: "🏁", label: "End",   value: endDate   ? new Date(endDate).toLocaleDateString()   : "TBD" },
            { icon: "🎯", label: "Sports", value: sportsCount },
            { icon: "👥", label: "Teams",  value: teamsCount  },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              background: "var(--bg-elevated)", borderRadius: 8, padding: "8px 10px",
              border: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 2 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{
          padding: "12px 20px", borderTop: "1px solid var(--border)",
          display: "flex", gap: 8, justifyContent: "flex-end",
        }}>
          {onView && (
            <Button variant="ghost" size="sm" onClick={() => onView(event)}>
              View Details
            </Button>
          )}
          {onRegister && isOpen && (
            <Button variant="primary" size="sm" onClick={() => onRegister(event)}>
              Register →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
