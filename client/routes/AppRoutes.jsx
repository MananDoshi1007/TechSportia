import { Routes, Route } from "react-router-dom";
import Protected from "./Protected";

// Public pages
import Landing from "../src/pages/Landing";
import Login from "../src/pages/Login";
import Register from "../src/pages/Register";
import Profile from "../src/pages/Profile";

// Player pages
import PlayerDashboard from "../src/pages/player/PlayerDashboard";
import BrowseEvents from "../src/pages/player/BrowseEvents";
import MyRegistrations from "../src/pages/player/MyRegistrations";
import Results from "../src/pages/player/Results";
import RegisterTeam from "../src/pages/player/RegisterTeam";
import MyTeams from "../src/pages/player/MyTeams";

// Organizer pages
import OrganizerDashboard from "../src/pages/organizer/OrganizerDashboard";
import ManageEvents from "../src/pages/organizer/ManageEvents";
import CreateEvent from "../src/pages/organizer/CreateEvent";
import ApproveParticipants from "../src/pages/organizer/ApproveParticipants";
import Scoreboard from "../src/pages/organizer/Scoreboard";

// SuperAdmin pages
import AdminDashboard from "../src/pages/superadmin/AdminDashboard";
import ManageColleges from "../src/pages/superadmin/ManageColleges";
import ManageUsers from "../src/pages/superadmin/ManageUsers";

// Smart dashboard redirect component
import SmartDashboard from "./SmartDashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Shared Routes */}
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      
      {/* Smart Dashboard — redirects by role */}
      <Route path="/dashboard" element={
        <Protected allowedRoles={["Player", "Organizer", "SuperAdmin"]}>
          <SmartDashboard />
        </Protected>
      } />

      {/* Player routes */}
      <Route path="/player-dashboard" element={<Protected allowedRoles={["Player"]}><PlayerDashboard /></Protected>} />
      <Route path="/events" element={<BrowseEvents />} />
      <Route path="/results" element={<Results />} />
      <Route path="/my-registrations" element={<Protected allowedRoles={["Player"]}><MyRegistrations /></Protected>} />
      <Route path="/my-teams" element={<Protected allowedRoles={["Player"]}><MyTeams /></Protected>} />
      <Route path="/register-team/:sportId" element={<Protected allowedRoles={["Player"]}><RegisterTeam /></Protected>} />

      {/* Organizer routes */}
      <Route path="/organizer-dashboard" element={<Protected allowedRoles={["Organizer", "SuperAdmin"]}><OrganizerDashboard /></Protected>} />
      <Route path="/my-events" element={<Protected allowedRoles={["Organizer", "SuperAdmin"]}><ManageEvents /></Protected>} />
      <Route path="/create-event" element={<Protected allowedRoles={["Organizer", "SuperAdmin"]}><CreateEvent /></Protected>} />
      <Route path="/approve-participants" element={<Protected allowedRoles={["Organizer", "SuperAdmin"]}><ApproveParticipants /></Protected>} />
      <Route path="/scoreboard" element={<Protected allowedRoles={["Organizer", "SuperAdmin"]}><Scoreboard /></Protected>} />

      {/* SuperAdmin routes */}
      <Route path="/admin-dashboard" element={<Protected allowedRoles={["SuperAdmin"]}><AdminDashboard /></Protected>} />
      <Route path="/admin/colleges" element={<Protected allowedRoles={["SuperAdmin"]}><ManageColleges /></Protected>} />
      <Route path="/admin/users" element={<Protected allowedRoles={["SuperAdmin"]}><ManageUsers /></Protected>} />
    </Routes>
  );
}