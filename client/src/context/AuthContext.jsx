import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authApi = axios.create({
  baseURL: BASE,
  withCredentials: true, 
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

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
