import Badge from "../common/Badge";
import Button from "../common/Button";

/**
 * SportCard – displays a sport inside an event
 * type: "Individual" | "Team"
 */
export default function SportCard({ sport, onRegister, showRegister = false }) {
  const {
    name = "Sport",
    type = "Individual",
    registrationStart,
    registrationEnd,
    minPlayers,
    maxPlayers,
    maxSubstitutes,
    registeredCount = 0,
  } = sport || {};

  const isTeam = type === "Team";
  const regOpen = (() => {
    const now = Date.now();
    const s = registrationStart ? new Date(registrationStart).getTime() : null;
    const e = registrationEnd   ? new Date(registrationEnd).getTime()   : null;
    return (!s || now >= s) && (!e || now <= e);
  })();

  return (
    <div
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: 12, padding: 18, overflow: "hidden" }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: isTeam ? "var(--brand-primary-light)" : "var(--brand-accent-light)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>
            {isTeam ? "👥" : "🏃"}
          </div>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{name}</h4>
            <Badge status={type} style={{ marginTop: 2 }} />
          </div>
        </div>
        {regOpen && <Badge status="open" dot />}
      </div>

      {/* Details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <MetaRow icon="📅" label="Reg. Closes" value={registrationEnd ? new Date(registrationEnd).toLocaleDateString() : "Open"} />
        <MetaRow icon="👤" label="Registered"  value={registeredCount} />
        {isTeam && (
          <>
            <MetaRow icon="⚽" label="Players"  value={`${minPlayers ?? "?"} – ${maxPlayers ?? "?"}`} />
            <MetaRow icon="🔄" label="Subs"     value={maxSubstitutes ?? "—"} />
          </>
        )}
      </div>

      {showRegister && onRegister && (
        <Button
          variant={regOpen ? "primary" : "secondary"}
          size="sm"
          disabled={!regOpen}
          onClick={() => onRegister(sport)}
          style={{ marginTop: 4 }}
        >
          {regOpen ? "Register" : "Registration Closed"}
        </Button>
      )}
    </div>
  );
}

function MetaRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 4, alignItems: "center" }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{value}</span>
    </div>
  );
}
