import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= INIT AUTH =================
  useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.get("/auth/me");

      setUser(data.user || data);

    } catch (err) {
      console.log("Auth failed:", err);

      // 🔥 IMPORTANT FIX
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);
      
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, []);

  // ================= LOGIN =================
  const login = (data) => {
    setUser(data.user);

    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    localStorage.setItem(
      "token",
      data.token
    );
  };

  // ================= LOGOUT =================
  const logout = () => {
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};