import { useEffect } from "react";

/**
 * Modal – glassmorphism overlay
 * size: "sm" | "md" | "lg" | "xl"
 */
export default function Modal({ open, onClose, title, children, size = "md", footer }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const maxW = { sm: 420, md: 560, lg: 720, xl: 900 }[size] || 560;

  return (
    <div
      className="animate-fade-in"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="animate-fade-in-up card-static"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: maxW, maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
          border: "1px solid var(--border-active)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 8, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)", fontSize: 18,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--danger-light)"; e.currentTarget.style.color = "var(--danger)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: "16px 24px", borderTop: "1px solid var(--border)",
            display: "flex", justifyContent: "flex-end", gap: 12,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
