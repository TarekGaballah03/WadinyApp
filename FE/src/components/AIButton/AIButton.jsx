import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ai from "../../assets/ai.jpg";
import { useTheme } from "../../context/ThemeContext";

export default function AIButton() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("loggedIn") === "true");
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      navigate("/ai");
    } else {
      if (window.openAuthModal) {
        window.openAuthModal();
      }
    }
  };

  return (
    <>
      {/* Bubble - الكلام (على اليمين جنب الأيقونة) */}
      <div className={`fixed right-[76px] md:right-[90px] bottom-[135px] md:bottom-[35px] px-4 py-2 rounded-xl shadow text-sm z-50 transition-colors duration-300 whitespace-nowrap ${
        isDarkMode
          ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
          : 'bg-white text-[#1e3a5f]'
      }`}>
        How can I help you?
        <div className={`absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 transition-colors duration-300 ${
          isDarkMode ? 'bg-white/10 border-r border-b border-white/20' : 'bg-white'
        }`}></div>
      </div>

      {/* AI Button - الزر */}
      <div
        className={`fixed right-5 md:right-8 bottom-[120px] md:bottom-8 w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,.3)] cursor-pointer md:w-[70px] md:h-[70px] hover:scale-105 transition-all duration-300 z-50 ${
          isDarkMode
            ? 'bg-white/10 backdrop-blur-md border border-white/20'
            : 'bg-[#1f2c4c]'
        }`}
        onClick={handleClick}
      >
        <img
          src={ai}
          alt="ai"
          className="w-[60px] h-[60px] rounded-full md:w-[70px] md:h-[70px]"
        />
      </div>
    </>
  );
}