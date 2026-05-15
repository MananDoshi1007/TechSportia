import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

const Protected = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loader component

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user role is not allowed, redirect to their default dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default Protected;
