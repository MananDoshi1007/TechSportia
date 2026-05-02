import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-wrapper">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="dashboard-main" style={{ display: "flex", flexDirection: "column" }}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />

        <main className="dashboard-content" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
