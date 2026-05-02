/**
 * StatCard – dashboard KPI tiles
 * color: "primary" | "accent" | "success" | "warning" | "danger"
 */
const COLOR_MAP = {
  primary: { bg: "var(--brand-primary-light)", color: "var(--brand-primary)" },
  accent:  { bg: "var(--brand-accent-light)",  color: "var(--brand-accent)"  },
  success: { bg: "var(--success-light)", color: "var(--success)" },
  warning: { bg: "var(--warning-light)", color: "var(--warning)" },
  danger:  { bg: "var(--danger-light)",  color: "var(--danger)"  },
};

export default function StatCard({ icon, label, value, trend, trendLabel, color = "primary", delay = 0, onClick, active }) {
  const c = COLOR_MAP[color] || COLOR_MAP.primary;
  const trendUp = typeof trend === "number" ? trend >= 0 : null;

  return (
    <div
      className={`stat-card animate-fade-in-up ${active ? "active" : ""}`}
      style={{ 
        animationDelay: `${delay}ms`,
        cursor: onClick ? "pointer" : "default",
        border: active ? `1px solid ${c.color}` : undefined,
        background: active ? "var(--bg-elevated)" : undefined,
        boxShadow: active ? `0 0 20px ${c.color}22` : undefined,
      }}
      onClick={onClick}
    >
      {/* Subtle glow blob */}
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        borderRadius: "50%", background: c.color, opacity: active ? 0.15 : 0.07, filter: "blur(20px)", pointerEvents: "none",
        transition: "opacity 0.3s ease",
      }} />

      <div className="stat-icon" style={{ 
        background: c.bg,
        boxShadow: active ? `0 0 15px ${c.color}33` : "none",
        transition: "all 0.3s ease",
      }}>
        <span style={{ color: c.color }}>{icon}</span>
      </div>

      <div className="stat-value" style={{ 
        color: active ? "var(--text-primary)" : undefined,
        transition: "color 0.3s ease",
      }}>{value ?? "—"}</div>
      <div className="stat-label" style={{ 
        color: active ? "var(--text-secondary)" : undefined,
        transition: "color 0.3s ease",
      }}>{label}</div>

      {trend !== undefined && (
        <div style={{
          marginTop: 12, display: "flex", alignItems: "center", gap: 4,
          fontSize: 12, color: trendUp ? "var(--success)" : "var(--danger)",
        }}>
          <span>{trendUp ? "↑" : "↓"}</span>
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span style={{ color: "var(--text-muted)" }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
