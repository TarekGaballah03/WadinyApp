// src/components/common/AuthModal.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // قراءة الثيم من localStorage
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setIsDarkMode(isDark);
    
    // مراقبة التغييرات في الثيم
    const handleThemeChange = () => {
      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");
    };
    
    window.addEventListener("storage", handleThemeChange);
    
    // مراقبة تغييرات الثيم من خلال MutationObserver
    const observer = new MutationObserver(() => {
      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");
    });
    
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    
    return () => {
      window.removeEventListener("storage", handleThemeChange);
      observer.disconnect();
    };
  }, []);

  // تحديث الثيم عند تغييره من أي مكان
  useEffect(() => {
    const checkTheme = () => {
      const theme = localStorage.getItem("theme");
      setIsDarkMode(theme === "dark");
    };
    
    const interval = setInterval(checkTheme, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  const handleSignup = () => {
    onClose();
    navigate("/signup");
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000]"
      onClick={handleOverlayClick}
    >
      <div className={`max-w-sm mx-4 p-6 rounded-2xl text-center shadow-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#0a0f1a] border border-white/20' 
          : 'bg-white'
      }`}>
        {/* Icon */}
        <div className="text-6xl mb-4">🗺️</div>
        
        <h3 className={`text-xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-[#0C2C55]'
        }`}>
          Login Required
        </h3>
        
        <p className={`text-sm mb-6 ${
          isDarkMode ? 'text-white/60' : 'text-[#666]'
        }`}>
          You need to log in first to access this page
        </p>
        
        {/* Buttons */}
        <button
          onClick={handleLogin}
          className="w-full h-10 bg-[#2B86ED] rounded-lg text-white font-medium hover:bg-[#1e6bc9] transition-colors mb-3"
        >
          Go to Login
        </button>
        
        <button
          onClick={handleSignup}
          className={`w-full h-10 rounded-lg font-medium transition-colors ${
            isDarkMode 
              ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
              : 'bg-gray-100 text-[#0C2C55] hover:bg-gray-200'
          }`}
        >
          Create New Account
        </button>
      </div>
    </div>
  );
}