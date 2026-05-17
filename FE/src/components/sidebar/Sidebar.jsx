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
  FiMessageSquare,
  FiPlusCircle,
  FiShoppingBag,
  FiPieChart,
  FiShield
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout, isAuthenticated, user } = useAuth();

  // جلب الـ role من localStorage أو من user object
  const userRole = localStorage.getItem('userRole') || user?.role || 'user';

  const handleLogout = () => {
    logout();
    toggleSidebar();
    navigate("/home");
  };

  const handleNavigation = (path) => {
    toggleSidebar();
    navigate(path);
  };

  // ==================== تعريف الأزرار حسب الـ Role ====================

  // أزرار أساسية للجميع
  const baseMenuItems = [
    { path: "/home", icon: <FiHome size={18} />, label: "Home" },
    { path: "/social", icon: <FiMessageSquare size={18} />, label: "Social Feed" },
    { path: "/profile", icon: <FiUser size={18} />, label: "My Profile" },
    { path: "/settings", icon: <FiSettings size={18} />, label: "Settings" },
    { path: "/offers", icon: <FiBox size={18} />, label: "Mystery Box" },
  ];

  // أزرار إضافية لـ Restaurant Owner
  const restaurantMenuItems = [
    { path: "/my-restaurant", icon: <FiShoppingBag size={18} />, label: "My Restaurant" },
    { path: "/my-offers/manage", icon: <FiPlusCircle size={18} />, label: "Manage Offers" },
  ];

  // أزرار إضافية لـ Admin
  const adminMenuItems = [
    { path: "/admin/dashboard", icon: <FiPieChart size={18} />, label: "Admin Panel" },
    { path: "/admin/restaurants", icon: <FiShield size={18} />, label: "All Restaurants" },
  ];

  // دمج القوائم حسب الـ role
  const getMenuItems = () => {
    let items = [...baseMenuItems];
    
    if (userRole === 'restaurant') {
      items = [...items, ...restaurantMenuItems];
    } else if (userRole === 'admin') {
      items = [...items, ...restaurantMenuItems, ...adminMenuItems];
    }
    
    return items;
  };

  const menuItems = getMenuItems();

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
          
          {/* عرض الـ Role Badge للمطعم أو الأدمن */}
          {(userRole === 'restaurant' || userRole === 'admin') && (
            <div className={`mb-3 p-2 rounded-lg text-center text-xs font-semibold ${
              userRole === 'admin' 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {userRole === 'admin' ? '👑 Admin Mode' : 'Owner'}
            </div>
          )}

          {/* عرض الأزرار ديناميكياً */}
          {menuItems.map((item, index) => (
            <div 
              key={index}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center gap-3 p-3 rounded-lg text-[15px] cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'text-white/90 hover:bg-white/10' 
                  : 'text-[#1e3a5f] hover:bg-[#f2f6ff]'
              }`}
            >
              <span className={isDarkMode ? 'text-white/70' : 'text-gray-500'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          ))}

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