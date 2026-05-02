import { useAuth } from "../../context/AuthContext";
import Badge from "../common/Badge";
import { Menu, Search, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      {/* Hamburger (mobile only) */}
      <button
        onClick={onMenuClick}
        className="mobile-menu-btn"
        style={{
          background: "var(--bg-elevated)", 
          border: "1px solid var(--border)",
          borderRadius: 10, 
          width: 40, 
          height: 40, 
          display: "none", // Controlled by CSS
          alignItems: "center", 
          justifyContent: "center",
          cursor: "pointer", 
          color: "var(--text-primary)",
          flexShrink: 0,
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--brand-primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        <Menu size={20} />
      </button>

      {/* Search bar */}
      <div style={{ flex: 1, maxWidth: 380 }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", pointerEvents: "none", display: "flex",
          }}>
            <Search size={16} />
          </span>
          <input
            placeholder="Search events, sports…"
            className="input"
            style={{
              paddingLeft: 42, paddingTop: 9, paddingBottom: 9,
              fontSize: 13, background: "var(--bg-elevated)",
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user ? (
          <>
            {/* Notification bell */}
            <button
              style={{
                position: "relative", background: "var(--bg-elevated)",
                border: "1px solid var(--border)", borderRadius: 10,
                width: 40, height: 40, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
                transition: "all 0.2s", color: "var(--text-secondary)",
              }}
              className="btn-icon"
            >
              <Bell size={20} />
              {/* Unread dot */}
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, borderRadius: "50%",
                background: "var(--brand-accent)", border: "2px solid var(--bg-secondary)",
              }} />
            </button>

            {/* User info */}
            <div 
              onClick={() => navigate("/profile")}
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
              className="navbar-user-section"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--brand-gradient)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#fff",
                  flexShrink: 0,
                }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <Badge status={user.role} />
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <button 
              onClick={() => navigate("/login")}
              style={{ 
                background: "transparent", border: "none", color: "var(--text-secondary)",
                fontSize: 14, fontWeight: 600, cursor: "pointer"
              }}
            >
              Log In
            </button>
            <button 
              onClick={() => navigate("/register")}
              className="btn btn-primary"
              style={{ padding: "8px 20px", fontSize: 13 }}
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
