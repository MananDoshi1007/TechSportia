import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

// Public pages
import Landing  from "../src/pages/Landing";
import Login    from "../src/pages/Login";
import Register from "../src/pages/Register";

// Player pages
import PlayerDashboard  from "../src/pages/player/PlayerDashboard";
import BrowseEvents     from "../src/pages/player/BrowseEvents";
import MyRegistrations  from "../src/pages/player/MyRegistrations";
import Results          from "../src/pages/player/Results";

// Organizer pages
import OrganizerDashboard from "../src/pages/organizer/OrganizerDashboard";
import ManageEvents       from "../src/pages/organizer/ManageEvents";
import CreateEvent        from "../src/pages/organizer/CreateEvent";
import ApproveTeams       from "../src/pages/organizer/ApproveTeams";
import Scoreboard         from "../src/pages/organizer/Scoreboard";

// SuperAdmin pages
import AdminDashboard   from "../src/pages/superadmin/AdminDashboard";
import ManageColleges   from "../src/pages/superadmin/ManageColleges";
import ManageUsers      from "../src/pages/superadmin/ManageUsers";

// Common pages
import Profile from "../src/pages/Profile";

// Protected wrapper
function Protected({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

// Smart dashboard redirect based on role
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "SuperAdmin") return <AdminDashboard />;
  if (user.role === "Organizer")  return <OrganizerDashboard />;
  return <PlayerDashboard />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing  />} />
        <Route path="/login"    element={<Login    />} />
        <Route path="/register" element={<Register />} />

        {/* Smart dashboard hub */}
        <Route path="/dashboard" element={<Protected><DashboardRedirect /></Protected>} />
        <Route path="/profile"   element={<Protected><Profile /></Protected>} />

        {/* Player routes (Publicly accessible for viewing) */}
        <Route path="/events"            element={<BrowseEvents />} />
        <Route path="/results"           element={<Results />} />
        <Route path="/my-registrations"  element={<Protected allowedRoles={["Player"]}><MyRegistrations /></Protected>} />

        {/* Organizer routes */}
        <Route path="/my-events"     element={<Protected allowedRoles={["Organizer","SuperAdmin"]}><ManageEvents       /></Protected>} />
        <Route path="/create-event"  element={<Protected allowedRoles={["Organizer","SuperAdmin"]}><CreateEvent        /></Protected>} />
        <Route path="/approve-teams" element={<Protected allowedRoles={["Organizer","SuperAdmin"]}><ApproveTeams       /></Protected>} />
        <Route path="/scoreboard"    element={<Protected allowedRoles={["Organizer","SuperAdmin"]}><Scoreboard         /></Protected>} />

        {/* SuperAdmin routes */}
        <Route path="/admin/colleges" element={<Protected allowedRoles={["SuperAdmin"]}><ManageColleges /></Protected>} />
        <Route path="/admin/users"    element={<Protected allowedRoles={["SuperAdmin"]}><ManageUsers    /></Protected>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}