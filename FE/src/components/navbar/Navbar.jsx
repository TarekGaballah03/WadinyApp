// src/components/navbar/Navbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext"; // ⭐ أضيفي useAuth

export default function Navbar({ toggleSidebar, showBackButton = true }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth(); // ⭐ نستخدم isAuthenticated من AuthContext

  const handleAuthClick = () => {
    navigate("/login");
  };

  return (
    <div className={`h-[60px] md:h-[70px] flex items-center justify-center relative shadow-[0_2px_8px_rgba(0,0,0,0.05)] z-10 flex-shrink-0 transition-colors duration-300 ${
      isDarkMode ? 'bg-white/10 backdrop-blur-md border-b border-white/20' : 'bg-white'
    }`}>
      {/* زر الرجوع يظهر في الصفحات العادية */}
      {showBackButton && (
        <button
          className={`absolute top-1/2 -translate-y-1/2 left-[18px] md:left-[24px] bg-transparent border-none cursor-pointer transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-[#1e3a5f]'
          }`}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
        </button>
      )}

      {/* في صفحة Home نخلي اللوجو شمال */}
      {!showBackButton ? (
        <h1 
          onClick={() => navigate("/home")}
          className={`font-['Aldhabi'] text-[38px] md:text-[42px] absolute left-[18px] md:left-[24px] cursor-pointer transition-colors duration-300 ${
            isDarkMode ? 'text-[#53C1E4]' : 'text-[#2B86ED]'
          }`}
        >
          وَدّيني
        </h1>
      ) : (
        <h1 
          onClick={() => navigate("/home")}
          className={`font-['Aldhabi'] text-[38px] md:text-[42px] cursor-pointer transition-colors duration-300 ${
            isDarkMode ? 'text-[#53C1E4]' : 'text-[#2B86ED]'
          }`}
        >
          وَدّيني
        </h1>
      )}

      {/* في صفحة Home: 
          - لو مسجل دخول: يظهر Menu
          - لو مش مسجل: يظهر Login/Sign Up + Theme
      */}
      {!showBackButton ? (
        <div className="absolute top-1/2 -translate-y-1/2 right-[18px] md:right-[24px] flex items-center gap-3">
          {/* أيقونة تبديل الوضع - تظهر دائماً */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'bg-white/10 text-yellow-400 hover:bg-white/20' 
                : 'bg-gray-100 text-[#2a85ec] hover:bg-gray-200'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {!isAuthenticated ? ( // ⭐ استخدمي isAuthenticated بدل localStorage
            // لو مش مسجل دخول: يظهر Login / Sign Up
            <span 
              onClick={handleAuthClick}
              className={`font-medium cursor-pointer transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-[#2a85ec]'
              }`}
            >
              Login / Sign Up
            </span>
          ) : (
            // لو مسجل دخول: يظهر أيقونة Menu فقط
            <button
              onClick={toggleSidebar}
              className={`bg-transparent border-none cursor-pointer transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-[#1e3a5f]'
              }`}
            >
              <Menu size={24} />
            </button>
          )}
        </div>
      ) : (
        <button
          className={`absolute top-1/2 -translate-y-1/2 right-[18px] md:right-[24px] bg-transparent border-none cursor-pointer transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-[#1e3a5f]'
          }`}
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>
      )}
    </div>
  );
}