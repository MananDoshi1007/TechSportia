/**
 * Input – White-label ready
 * Supports: text, email, password, number, select, textarea
 */
export default function Input({
  label,
  error,
  helper,
  icon,
  iconRight,
  type = "text",
  className = "",
  children,        // for select options
  as: Tag = "input",
  ...rest
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.01em" }}>
          {label}
          {rest.required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
        </label>
      )}

      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", fontSize: 16, pointerEvents: "none", display: "flex",
          }}>
            {icon}
          </span>
        )}

        <Tag
          type={type}
          className={`input ${error ? "input-error" : ""}`}
          style={{
            paddingLeft: icon ? 42 : undefined,
            paddingRight: iconRight ? 42 : undefined,
            resize: Tag === "textarea" ? "vertical" : undefined,
            minHeight: Tag === "textarea" ? 100 : undefined,
          }}
          {...rest}
        >
          {Tag === "select" ? children : undefined}
        </Tag>

        {iconRight && (
          <span style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", fontSize: 16, display: "flex",
          }}>
            {iconRight}
          </span>
        )}
      </div>

      {error  && <span style={{ fontSize: 12, color: "var(--danger)" }}>{error}</span>}
      {helper && !error && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{helper}</span>}
    </div>
  );
}
