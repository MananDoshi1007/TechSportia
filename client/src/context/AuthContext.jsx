import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Mock user — replace with real API call when backend is ready
const MOCK_USERS = {
  player:    { id: 1, name: "Arjun Mehta",    email: "arjun@college.edu",  role: "Player",     collegeId: 1, collegeName: "CHARUSAT University" },
  organizer: { id: 2, name: "Priya Sharma",   email: "priya@college.edu",  role: "Organizer",  collegeId: 1, collegeName: "CHARUSAT University" },
  superadmin:{ id: 3, name: "Super Admin",    email: "admin@techsportia.com", role: "SuperAdmin", collegeId: null, collegeName: null },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate API delay
    // TODO: replace with real API call
    if (email.includes("admin")) setUser(MOCK_USERS.superadmin);
    else if (email.includes("priya")) setUser(MOCK_USERS.organizer);
    else setUser(MOCK_USERS.player);
    setLoading(false);
    return true;
  };

  const register = async (data) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    // TODO: replace with real API call — new users are Player by default
    setUser({ ...MOCK_USERS.player, name: data.name, email: data.email });
    setLoading(false);
    return true;
  };

  const logout = () => setUser(null);

  // Quick-switch for demo (remove when backend is ready)
  const switchRole = (role) => {
    const key = role.toLowerCase();
    if (MOCK_USERS[key]) setUser(MOCK_USERS[key]);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
