import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUser, 
  FiSettings, 
  FiBox, 
  FiSun, 
  FiMoon, 
  FiLogOut,
  FiHome,
  FiMessageSquare
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    // مسح بيانات تسجيل الدخول
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("rememberMe");
    
    // إغلاق الـ Sidebar
    toggleSidebar();
    
    // التوجيه لصفحة Home
    navigate("/home");
    
    // إعادة تحميل الصفحة عشان يتغير الـ Navbar
    window.location.reload();
  };

  // دالة للتنقل مع إغلاق الـ Sidebar
  const handleNavigation = (path) => {
    toggleSidebar();
    navigate(path);
  };

  return (
    <>
      {/* Sidebar - مع تأثير Glass Effect في الوضع الداكن */}
      <div className={`fixed top-[80px] -right-[300px] w-[260px] transition-all duration-300 z-[1000] rounded-[18px] p-5 ${
        isSidebarOpen ? '!right-5' : ''
      } ${
        isDarkMode 
          ? 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
          : 'bg-white shadow-lg'
      }`}>
        <div className="flex flex-col gap-2">
          {/* Home */}
          <div 
            onClick={() => handleNavigation("/home")}
            className={`flex items-center gap-3 p-3 rounded-lg text-[15px] cursor-pointer transition-colors ${
              isDarkMode 
                ? 'text-white/90 hover:bg-white/10' 
                : 'text-[#1e3a5f] hover:bg-[#f2f6ff]'
            }`}
          >
            <FiHome className={isDarkMode ? 'text-white/70' : 'text-gray-500'} size={18} />
            <span>Home</span>
          </div>

          {/* Social Feed */}
          <div 
            onClick={() => handleNavigation("/social")}
            className={`flex items-center gap-3 p-3 rounded-lg text-[15px] cursor-pointer transition-colors ${
              isDarkMode 
                ? 'text-white/90 hover:bg-white/10' 
                : 'text-[#1e3a5f] hover:bg-[#f2f6ff]'
            }`}
          >
            <FiMessageSquare className={isDarkMode ? 'text-white/70' : 'text-gray-500'} size={18} />
            <span>Social Feed</span>
          </div>

          {/* My profile */}
          <div 
            onClick={() => handleNavigation("/profile")}
            className={`flex items-center gap-3 p-3 rounded-lg text-[15px] cursor-pointer transition-colors ${
              isDarkMode 
                ? 'text-white/90 hover:bg-white/10' 
                : 'text-[#1e3a5f] hover:bg-[#f2f6ff]'
            }`}
          >
            <FiUser className={isDarkMode ? 'text-white/70' : 'text-gray-500'} size={18} />
            <span>My profile</span>
          </div>

          {/* Settings */}
          <div 
            onClick={() => handleNavigation("/settings")}
            className={`flex items-center gap-3 p-3 rounded-lg text-[15px] cursor-pointer transition-colors ${
              isDarkMode 
                ? 'text-white/90 hover:bg-white/10' 
                : 'text-[#1e3a5f] hover:bg-[#f2f6ff]'
            }`}
          >
            <FiSettings className={isDarkMode ? 'text-white/70' : 'text-gray-500'} size={18} />
            <span>Settings</span>
          </div>

          {/* Mystery box - يودي على صفحة العروض والتوصيات */}
          <div 
            onClick={() => handleNavigation("/offers")}
            className={`flex items-center gap-3 p-3 rounded-lg text-[15px] cursor-pointer transition-colors ${
              isDarkMode 
                ? 'text-white/90 hover:bg-white/10' 
                : 'text-[#1e3a5f] hover:bg-[#f2f6ff]'
            }`}
          >
            <FiBox className={isDarkMode ? 'text-white/70' : 'text-gray-500'} size={18} />
            <span>Mystery box</span>
          </div>

          <div className={`h-[1px] my-2 ${
            isDarkMode ? 'bg-white/10' : 'bg-[#e8edf5]'
          }`}></div>

          {/* Light/Dark Mode Toggle */}
          <div 
            className={`flex items-center gap-3 p-3 rounded-lg text-[15px] cursor-pointer transition-colors ${
              isDarkMode 
                ? 'text-white/90 hover:bg-white/10' 
                : 'text-[#555] hover:bg-[#f2f6ff]'
            }`}
            onClick={toggleTheme}
          >
            {isDarkMode ? (
              <FiMoon className="text-white/70" size={18} />
            ) : (
              <FiSun className="text-gray-500" size={18} />
            )}
            <span>{isDarkMode ? "Dark mode" : "Light mode"}</span>
          </div>

          {/* Logout */}
          <div 
            onClick={handleLogout}
            className={`flex items-center gap-3 p-3 rounded-lg text-[15px] cursor-pointer transition-colors ${
              isDarkMode 
                ? 'text-red-400 hover:bg-white/10' 
                : 'text-[#ff3b30] hover:bg-[#f2f6ff]'
            }`}
          >
            <FiLogOut className={isDarkMode ? 'text-red-400/70' : 'text-gray-500'} size={18} />
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/25 z-[999]"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}







