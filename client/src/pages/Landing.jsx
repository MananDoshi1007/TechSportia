import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const FEATURES = [
  { icon: "🏆", title: "Event Management",   desc: "Full lifecycle control from Draft → RegistrationOpen → Ongoing → Completed" },
  { icon: "👥", title: "Team System",        desc: "Create teams, assign captains, vice-captains and manage substitutes with ease" },
  { icon: "📈", title: "Live Scoreboards",   desc: "Track scores in real-time and publish official results instantly" },
  { icon: "🏫", title: "Multi-College",      desc: "Multiple colleges on one platform, each with their own events and players" },
  { icon: "🎯", title: "Individual & Team",  desc: "Supports both individual registrations and team-based sports" },
  { icon: "🔒", title: "Role-Based Access",  desc: "SuperAdmin, Organizer and Player — each sees exactly what they need" },
];

const STATS = [
  { value: "50+",   label: "Colleges"        },
  { value: "500+",  label: "Events Hosted"   },
  { value: "10K+",  label: "Athletes"        },
  { value: "20+",   label: "Sports Supported"},
];

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", overflow: "hidden" }}>

      {/* ── Navbar ── */}
      <nav className="glass" style={{
        position: "sticky", top: 0, zIndex: 50,
        padding: "0 32px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--glass-border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--brand-gradient)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🏆</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>TechSportia</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div style={{ display: "flex", gap: 24 }} className="hide-mobile">
            <Link to="/events" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", textDecoration: "none" }}>Events</Link>
            <Link to="/results" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", textDecoration: "none" }}>Results</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link to="/login" className="btn btn-ghost" style={{ color: "var(--text-secondary)" }}>Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started →</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", padding: "100px 32px 80px", textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
        {/* Background orbs */}
        <div className="hero-orb animate-blob" style={{ width: 500, height: 500, top: -100, left: "50%", transform: "translateX(-50%)", background: "var(--brand-primary)" }} />
        <div className="hero-orb animate-blob delay-300" style={{ width: 300, height: 300, top: 50, right: "5%", background: "var(--brand-accent)", opacity: 0.1 }} />

        <div className="animate-fade-in-up" style={{ position: "relative", zIndex: 1 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--brand-primary-light)", border: "1px solid rgba(124,58,237,0.3)",
            color: "var(--brand-primary)", padding: "6px 16px", borderRadius: 100,
            fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: "0.02em",
          }}>
            🎉 College Sports Management Platform
          </span>

          <h1 style={{
            fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 900,
            lineHeight: 1.1, color: "var(--text-primary)", marginBottom: 24,
          }}>
            Manage College{" "}
            <span className="gradient-text">Sports Events</span>
            {" "}Like a Pro
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2.5vw, 19px)", color: "var(--text-secondary)",
            maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.7,
          }}>
            TechSportia unifies event creation, team management, score tracking and result publishing — all in one premium platform built for colleges.
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                🚀 Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In →
              </Link>
            </div>
            <Link 
              to="/events" 
              style={{ 
                color: "var(--text-muted)", fontSize: 14, fontWeight: 600, 
                textDecoration: "none", borderBottom: "1px solid var(--border)", 
                paddingBottom: 2, transition: "all 0.2s" 
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >
              Continue as Guest / Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats banner ── */}
      <section style={{ padding: "0 32px 80px", maxWidth: 900, margin: "0 auto" }}>
        <div className="animate-fade-in-up delay-300" style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 1, background: "var(--border)", borderRadius: 20, overflow: "hidden",
          border: "1px solid var(--border)",
        }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{
              background: "var(--bg-card)", padding: "28px 20px", textAlign: "center",
            }}>
              <div className="gradient-text" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "0 32px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 12 }}>
            Everything You Need
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
            Built for students, organizers and college administrators.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20,
        }}>
          {FEATURES.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="card animate-fade-in-up"
              style={{ padding: 28, animationDelay: `${i * 80}ms` }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: "var(--brand-gradient-soft)",
                border: "1px solid rgba(124,58,237,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, marginBottom: 16,
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: "0 32px 100px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{
          background: "var(--brand-gradient)",
          borderRadius: 24, padding: "60px 40px", textAlign: "center",
          boxShadow: "0 20px 60px rgba(124,58,237,0.4)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40, width: 200, height: 200,
            borderRadius: "50%", background: "rgba(255,255,255,0.1)",
          }} />
          <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            Ready to Elevate Your Sports Events?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 32 }}>
            Join TechSportia and bring your college sports into the digital age.
          </p>
          <Link
            to="/register"
            className="btn"
            style={{
              background: "#fff", color: "var(--brand-primary)", fontWeight: 700,
              padding: "14px 36px", fontSize: 16, borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            Create Your Account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid var(--border)", padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🏆</span>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>TechSportia</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
          © 2026 TechSportia. Built for Academic Excellence.
        </p>
      </footer>
    </div>
  );
}