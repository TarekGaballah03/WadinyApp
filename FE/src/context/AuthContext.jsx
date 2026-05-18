// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getMyProfileAPI, logoutAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    console.log("🔍 Checking authentication...");
    
    const token = localStorage.getItem("access_token");
    const oldLoggedIn = localStorage.getItem("loggedIn") === "true";
    
    console.log("Token exists:", !!token);
    console.log("Old loggedIn:", oldLoggedIn);
    
    if (token) {
      try {
        console.log("🔄 Fetching user profile...");
        const result = await getMyProfileAPI();
        console.log("Profile result:", result);
        
        if (result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
          localStorage.setItem("loggedIn", "true");
          localStorage.setItem("userId", result.user._id);
          localStorage.setItem("userName", result.user.name || "");
          localStorage.setItem("userRole", result.user.role || "user");
          if (result.user.email) {
            localStorage.setItem("currentUserEmail", result.user.email);
          }
          if (result.user.image?.secure_url) {
            localStorage.setItem("userAvatar", result.user.image.secure_url);
          }
          console.log("✅ User authenticated:", result.user.email);
        } else {
          console.log("❌ No user in response");
          logout();
        }
      } catch (error) {
        console.error("❌ Auth check failed:", error);
        logout();
      }
    } else if (oldLoggedIn) {
      console.log("⚠️ Old login detected but no token, clearing...");
      logout();
    } else {
      console.log("❌ No token found, user not authenticated");
      setIsAuthenticated(false);
      setUser(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = () => {
    console.log("🚪 Logging out...");
    logoutAPI();
    setUser(null);
    setIsAuthenticated(false);
    // ⭐ مهم: نمسح كل حاجة من localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_prefix");
    localStorage.removeItem("userRole");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("rememberMe");
  };

  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  };

  // ⭐ دالة لتحديث حالة المصادقة (تستخدم بعد login)
  const refreshAuth = async () => {
    setLoading(true);
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated, 
      logout,
      updateUser,
      refreshAuth  // ⭐ نضيفها هنا
    }}>
      {children}
    </AuthContext.Provider>
  );
}