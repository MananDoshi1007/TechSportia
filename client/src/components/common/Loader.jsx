/** Full-page loading overlay */
export function PageLoader() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--bg-primary)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
    }}>
      <div style={{ position: "relative", width: 56, height: 56 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--brand-primary)",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 8, borderRadius: "50%",
          border: "2px solid var(--border)",
          borderBottomColor: "var(--brand-accent)",
          animation: "spin 1.2s linear infinite reverse",
        }} />
      </div>
      <span style={{ fontSize: 14, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
        Loading…
      </span>
    </div>
  );
}

/** Inline spinner */
export function Spinner({ size = 20, color = "var(--brand-primary)" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3"
        strokeDasharray="32" strokeDashoffset="8" strokeLinecap="round"
        style={{ opacity: 0.3 }}
      />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Empty state placeholder */
export function EmptyState({ icon = "📭", title = "Nothing here yet", subtitle = "" }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 12, padding: "60px 24px",
      color: "var(--text-muted)", textAlign: "center",
    }}>
      <span style={{ fontSize: 48 }}>{icon}</span>
      <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)" }}>{title}</p>
      {subtitle && <p style={{ fontSize: 14 }}>{subtitle}</p>}
    </div>
  );
}

export default PageLoader;
