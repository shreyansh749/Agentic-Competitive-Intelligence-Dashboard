import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios instance with credentials
const authApi = axios.create({
  baseURL: BASE,
  withCredentials: true, // ← cookies send/receive ke liye
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // initial check

  // App load hone pe cookie se user check karo
  useEffect(() => {
    authApi
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signup = async (name, email, password) => {
    const res = await authApi.post("/auth/signup", { name, email, password });
    setUser(res.data.user);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await authApi.post("/auth/login", { email, password });
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await authApi.post("/auth/logout");
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authApi.put("/auth/profile", data);
    setUser(res.data.user);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
