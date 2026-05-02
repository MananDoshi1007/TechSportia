// Home.jsx — smart redirect to role-based dashboard
// This file is kept for backward compatibility with any old /home route
import { Navigate } from "react-router-dom";

export default function Home() {
  return <Navigate to="/dashboard" replace />;
}