import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";

const TOAST_TYPES = {
  success: {
    icon: <CheckCircle style={{ color: "var(--success)" }} size={20} />,
    bg: "var(--success-light)",
    border: "rgba(16, 185, 129, 0.2)",
    color: "var(--success)",
  },
  error: {
    icon: <AlertCircle style={{ color: "var(--danger)" }} size={20} />,
    bg: "var(--danger-light)",
    border: "rgba(239, 68, 68, 0.2)",
    color: "var(--danger)",
  },
  warning: {
    icon: <AlertTriangle style={{ color: "var(--warning)" }} size={20} />,
    bg: "var(--warning-light)",
    border: "rgba(245, 158, 11, 0.2)",
    color: "var(--warning)",
  },
  info: {
    icon: <Info style={{ color: "var(--info)" }} size={20} />,
    bg: "var(--info-light)",
    border: "rgba(59, 130, 246, 0.2)",
    color: "var(--info)",
  },
};

export default function Toast({ message, type = "info", onClose, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        background: "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${config.border}`,
        boxShadow: "var(--shadow-lg)",
        minWidth: "300px",
        maxWidth: "450px",
        transform: isVisible ? "translateX(0)" : "translateX(120%)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        pointerEvents: "auto",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: config.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {config.icon}
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
          {message}
        </p>
      </div>

      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <X size={16} />
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          background: config.color,
          opacity: 0.3,
          width: isVisible ? "0%" : "100%",
          transition: `width ${duration}ms linear`,
          borderBottomLeftRadius: "12px",
        }}
      />
    </div>
  );
}
