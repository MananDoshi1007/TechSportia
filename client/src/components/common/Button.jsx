import { useTheme } from "../../context/ThemeContext";

/**
 * Button – White-label ready
 * variant: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
 * size:    "sm" | "md" | "lg"
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className = "",
  type = "button",
  onClick,
  ...rest
}) {
  const cls = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <>
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="8" strokeLinecap="round" />
          </svg>
          Loading…
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
          {iconRight && <span className="btn-icon">{iconRight}</span>}
        </>
      )}
    </button>
  );
}
