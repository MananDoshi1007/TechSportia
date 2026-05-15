/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true on mount to check stored session

  // ── On mount: restore user from localStorage ──
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("ts_user");
      const storedToken = localStorage.getItem("ts_token");
      const loginAt = localStorage.getItem("ts_login_at");

      if (storedUser && storedToken && loginAt) {
        const oneDay = 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        
        // If older than 1 day, clear
        if (now - parseInt(loginAt) > oneDay) {
          logout();
        } else {
          setUser(JSON.parse(storedUser));
        }
      } else {
        // Cleanup if incomplete data
        if (!storedUser || !storedToken) logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login ──
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const data = res.data;

      const userObj = {
        id: data.userId,
        name: data.userName,
        email: data.email,
        role: data.role,
        collegeId: data.collegeId,
      };

      localStorage.setItem("ts_token", data.token);
      localStorage.setItem("ts_user", JSON.stringify(userObj));
      localStorage.setItem("ts_login_at", new Date().getTime().toString());
      setUser(userObj);

      return { success: true };
    } catch (err) {
      const message = extractErrorMessage(err, "Login failed. Please try again.");
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // ── Register ──
  const register = async (data) => {
    setLoading(true);
    try {
      await authAPI.register({
        fullName: data.name,
        email: data.email.trim(),
        password: data.password.trim(),
        collegeId: parseInt(data.collegeId, 10),
        phoneNumber: data.phoneNumber || "",
        yearOfStudy: data.yearOfStudy || ""
      });

      // Auto-login after successful registration
      const loginResult = await login(data.email, data.password);
      return loginResult;
    } catch (err) {
      const message = extractErrorMessage(err, "Registration failed. Please try again.");
      setLoading(false);
      return { success: false, message };
    }
  };

  // ── Update User State (Sync across Sidebar/Header) ──
  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    localStorage.setItem("ts_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem("ts_token");
    localStorage.removeItem("ts_user");
    localStorage.removeItem("ts_login_at");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Helper: extract error message from axios error ──
function extractErrorMessage(err, fallback) {
  if (err.response) {
    const d = err.response.data;
    // .NET returns string directly for BadRequest("message")
    if (typeof d === "string") return d;
    // or { message: "..." }
    if (d?.message) return d.message;
    // or { title: "...", errors: {...} } for ModelState
    if (d?.errors) {
      const firstError = Object.values(d.errors).flat()[0];
      if (firstError) return firstError;
    }
    if (d?.title) return d.title;
  }
  if (err.message === "Network Error") {
    return "Cannot connect to server. Please ensure the backend is running.";
  }
  return fallback;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
