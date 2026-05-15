import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

export default function SmartDashboard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "SuperAdmin":
      return <Navigate to="/admin-dashboard" replace />;
    case "Organizer":
      return <Navigate to="/organizer-dashboard" replace />;
    case "Player":
    default:
      return <Navigate to="/player-dashboard" replace />;
  }
}
