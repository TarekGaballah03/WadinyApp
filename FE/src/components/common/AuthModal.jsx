import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDarkMode(theme === "dark");
  }, []);

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className={`max-w-sm mx-4 p-6 rounded-2xl text-center shadow-xl transition-all duration-300 animate-in zoom-in-95 duration-200 ${
        isDarkMode 
          ? 'bg-[#0a0f1a] border border-white/20' 
          : 'bg-white'
      }`}>
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
        
        <button
          onClick={handleLogin}
          className="w-full h-10 bg-[#2B86ED] rounded-lg text-white font-medium hover:bg-[#1e6bc9] transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}