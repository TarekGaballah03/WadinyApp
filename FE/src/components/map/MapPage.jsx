import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, AlertCircle, Coffee, Tag, MapPin } from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { FiPlus } from "react-icons/fi";
import AIButton from "../../components/AIButton/AIButton";
import { useTheme } from "../../context/ThemeContext";

export default function MapPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const mapImage = "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop";
  const roadImage = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop";
  const cafeImage = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop";
  const offerImage = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop";

  const updates = [
    {
      name: "Sara Morgan",
      time: "2 min ago",
      text: "Roadblock on 5th Avenue due to construction. Avoid the area if possible",
      status: "problem",
      img: roadImage,
      profileImg: "https://randomuser.me/api/portraits/women/44.jpg",
      icon: <AlertCircle size={14} />
    },
    {
      name: "John Alex",
      time: "5 min ago",
      text: "The new cafe on Elm Street is officially open. It's beautiful",
      status: "open",
      img: cafeImage,
      profileImg: "https://randomuser.me/api/portraits/men/32.jpg",
      icon: <Coffee size={14} />
    },
    {
      name: "Chris Lee",
      time: "15 min ago",
      text: "Woods Cafe has a 2-for-1 offer on coffee today. Highly recommended their latte",
      status: "offer",
      img: offerImage,
      profileImg: "https://randomuser.me/api/portraits/women/68.jpg",
      icon: <Tag size={14} />
    }
  ];

  const getStatusText = (status) => {
    switch(status) {
      case "problem": return "Problem";
      case "open": return "Open";
      case "offer": return "Offer";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "problem": return "text-[#dc2626]";
      case "open": return "text-[#16a34a]";
      case "offer": return "text-[#2563eb]";
      default: return "";
    }
  };

  return (
    <div className={`h-screen flex flex-col font-sans overflow-y-auto relative transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-[#f5f7fa]'
    }`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} />

      {/* MAP */}
      <div className="relative h-[300px] w-full overflow-hidden flex-shrink-0 md:h-[400px]">
        <img src={mapImage} alt="map" className="w-full h-full object-cover" />

        {/* SEARCH - كحلي مع Glass في الدارك */}
        <div className={`absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 py-3 px-5 rounded-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] w-[300px] transition-all duration-300 md:w-[400px] md:py-4 md:px-6 ${
          isDarkMode
            ? 'bg-[#1a2b3c]/60 backdrop-blur-xl border border-[#2a3f55]/50' // كحلي مع Glass
            : 'bg-white'
        }`}>
          <Search size={18} className={isDarkMode ? 'text-white/70' : 'text-[#64748b]'} />
          <input
            type="text"
            placeholder="Search for a location"
            className={`border-none outline-none text-[15px] w-full bg-transparent md:text-base transition-colors duration-300 ${
              isDarkMode ? 'text-white/90 placeholder:text-white/50' : 'text-[#0a2540] placeholder:text-[#94a3b8]'
            }`}
          />
        </div>

        {/* ZOOM BUTTONS */}
        <div className="absolute right-4 top-5 flex flex-col gap-0.5 md:right-8 md:top-8">
          <button className={`w-[42px] h-[42px] text-white text-2xl flex items-center justify-center rounded-t-[12px] transition-colors duration-300 ${
            isDarkMode ? 'bg-[#1a2b3c]/60 backdrop-blur-md border border-[#2a3f55]/30 hover:bg-[#1a2b3c]/80' : 'bg-[#4a5c6b] hover:bg-[#3a4a58]'
          }`}>+</button>
          <button className={`w-[42px] h-[42px] text-white text-2xl flex items-center justify-center transition-colors duration-300 ${
            isDarkMode ? 'bg-[#1a2b3c]/60 backdrop-blur-md border border-[#2a3f55]/30 hover:bg-[#1a2b3c]/80' : 'bg-[#4a5c6b] hover:bg-[#3a4a58]'
          }`}>-</button>
          <button className={`w-[42px] h-[42px] text-white flex items-center justify-center rounded-b-[12px] transition-colors duration-300 ${
            isDarkMode ? 'bg-[#1a2b3c]/60 backdrop-blur-md border border-[#2a3f55]/30 hover:bg-[#1a2b3c]/80' : 'bg-[#4a5c6b] hover:bg-[#3a4a58]'
          }`}>
            <MapPin size={18}/>
          </button>
        </div>
      </div>

      {/* REPORT BUTTON - مع تكبير الخط */}
      <div className="relative h-0 w-full flex justify-end z-50 pr-5">
        <button 
          className={`absolute -top-6 right-5 py-3 px-8 rounded-[40px] flex items-center justify-center gap-2.5 font-semibold transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#1a2b3c]/50 backdrop-blur-xl border border-[#2a3f55]/50 text-white shadow-[0_8px_20px_rgba(0,0,0,0.3)] hover:bg-[#1a2b3c]/70 text-[18px]' // كحلي مع Glass وخط أكبر
              : 'bg-[#3182ce] text-white shadow-[0_8px_20px_rgba(49,130,206,0.4)] hover:bg-[#2c5282] text-[18px]' // نفس لون Open Map بدون border وخط أكبر
          }`}
          onClick={() => navigate("/report")}
        >
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isDarkMode ? 'border border-white/60' : 'border-2 border-white'
          }`}>
            <FiPlus size={16} className="text-white" />
          </span>
          Report
        </button>
      </div>

      {/* LIVE UPDATES */}
      <div className={`p-5 pt-[30px] flex-1 transition-colors duration-300 md:max-w-4xl md:mx-auto md:w-full md:p-8 ${
        isDarkMode ? 'bg-[#0a0f1a]' : 'bg-[#f5f7fa]'
      }`}>
        <h3 className={`text-xl mb-[18px] font-[600] md:text-2xl md:mb-6 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#0a2540]'
        }`}>
          Live Updates
        </h3>

        {updates.map((item, index) => (
          <div key={index} className={`flex justify-between p-4 rounded-2xl mb-3 items-start transition-all duration-300 ${
            isDarkMode
              ? 'bg-[#1a2b3c]/40 backdrop-blur-md border border-[#2a3f55]/30' // كحلي مع Glass للبطاقات أيضاً
              : 'bg-[#eef5ff] border border-[#d9e6f5]'
          }`}>
            <div className="flex gap-3 flex-1">
              <img src={item.profileImg} alt="" className="w-10 h-10 rounded-full object-cover"/>

              <div className="flex-1">
                <div className="flex flex-col mb-1">
                  <strong className={`text-[15px] transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-[#0a2540]'
                  }`}>{item.name}</strong>
                  <span className={`text-[11px] transition-colors duration-300 ${
                    isDarkMode ? 'text-white/50' : 'text-[#64748b]'
                  }`}>{item.time}</span>
                </div>

                <p className={`text-[13px] mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white/80' : 'text-[#334155]'
                }`}>
                  {item.text}
                </p>

                <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase transition-colors duration-300 ${getStatusColor(item.status)}`}>
                  {item.icon}
                  {getStatusText(item.status)}
                </span>
              </div>
            </div>

            <img src={item.img} alt="" className="w-[110px] h-[100px] object-cover rounded-[18px] ml-3"/>
          </div>
        ))}
      </div>

      {/* AI Assistant */}
      <AIButton />
    </div>
  );
}