import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, LogIn, UserPlus } from "lucide-react";

// ── Icon set (emoji-based, no extra dep) ──
const GUEST_NAV = [
  { to: "/events",              icon: "🏆", label: "Browse Events"    },
  { to: "/results",             icon: "🥇", label: "Results"          },
];

const PLAYER_NAV = [
  { to: "/dashboard",           icon: "⚡", label: "Dashboard"        },
  { to: "/events",              icon: "🏆", label: "Browse Events"    },
  { to: "/my-registrations",    icon: "📋", label: "My Registrations" },
  { to: "/results",             icon: "🥇", label: "Results"          },
];

const ORGANIZER_NAV = [
  { to: "/dashboard",           icon: "📊", label: "Dashboard"        },
  { to: "/my-events",           icon: "🏆", label: "My Events"        },
  { to: "/create-event",        icon: "➕", label: "Create Event"     },
  { to: "/approve-teams",       icon: "✅", label: "Approve Teams"    },
  { to: "/scoreboard",          icon: "📈", label: "Scoreboard"       },
];

const ADMIN_NAV = [
  { to: "/dashboard",           icon: "🛡️", label: "Dashboard"        },
  { to: "/admin/colleges",      icon: "🏫", label: "Colleges"         },
  { to: "/admin/users",         icon: "👥", label: "Users"            },
  { to: "/events",              icon: "🏆", label: "All Events"       },
];

const NAV_BY_ROLE = {
  Player:     PLAYER_NAV,
  Organizer:  ORGANIZER_NAV,
  SuperAdmin: ADMIN_NAV,
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user ? (NAV_BY_ROLE[user.role] || PLAYER_NAV) : GUEST_NAV;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 39,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          }}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Logo */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--brand-gradient)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, flexShrink: 0,
            }}>
              🏆
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
                TechSportia
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Sports Platform
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
          <div style={{ marginBottom: 6, paddingLeft: 4, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {user?.role === "SuperAdmin" ? "Administration" : "Navigation"}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
          {user ? (
            /* User Card */
            <div style={{
              background: "var(--bg-elevated)", borderRadius: 12,
              padding: "12px", display: "flex", alignItems: "center", gap: 10,
              border: "1px solid var(--border)",
            }}>
              <div 
                onClick={() => navigate("/profile")}
                style={{ 
                  display: "flex", alignItems: "center", gap: 10, flex: 1, 
                  cursor: "pointer", minWidth: 0 
                }}
                className="sidebar-user-section"
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--brand-gradient)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{user.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="btn-icon-danger"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  cursor: "pointer",
                  color: "var(--danger)",
                  padding: "8px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            /* Guest Prompt */
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button 
                onClick={() => navigate("/login")}
                className="btn btn-primary"
                style={{ width: "100%", height: 40, fontSize: 13 }}
              >
                <LogIn size={14} /> Sign In
              </button>
              <button 
                onClick={() => navigate("/register")}
                className="btn btn-secondary"
                style={{ width: "100%", height: 40, fontSize: 13 }}
              >
                <UserPlus size={14} /> Get Started
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
