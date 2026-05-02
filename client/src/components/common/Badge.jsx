/**
 * Badge – maps event/team/user statuses to styled pills
 * variant: auto-detected from `status` prop OR pass explicit `variant`
 */

const STATUS_MAP = {
  // Event lifecycle
  draft:          "badge-draft",
  registrationopen:"badge-open",
  open:           "badge-open",
  ongoing:        "badge-ongoing",
  completed:      "badge-completed",
  // Team / registration
  pending:        "badge-pending",
  approved:       "badge-approved",
  rejected:       "badge-rejected",
  // User roles
  player:         "badge-player",
  organizer:      "badge-organizer",
  superadmin:     "badge-superadmin",
  // Sport types
  individual:     "badge-open",
  team:           "badge-organizer",
};

const LABEL_MAP = {
  registrationopen: "Registration Open",
  superadmin: "Super Admin",
};

export default function Badge({ status, variant, dot = false, children, className = "" }) {
  const key = (status || "").toLowerCase().replace(/\s+/g, "");
  const cls = variant ? `badge badge-${variant}` : `badge ${STATUS_MAP[key] || "badge-draft"}`;
  const label = children || LABEL_MAP[key] || status;

  return (
    <span className={`${cls} ${className}`}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "currentColor", display: "inline-block", flexShrink: 0,
        }} />
      )}
      {label}
    </span>
  );
}
