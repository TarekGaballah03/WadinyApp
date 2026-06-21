import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { MapPin, Star, Utensils, Coffee } from "lucide-react";

export default function PlaceCard({ place }) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  if (!place) return null;

  const { id, name, lat, lng, image, rating, category } = place;
  const isCafe = category?.toLowerCase() === "cafe";
  const Icon = isCafe ? Coffee : Utensils;

  const handleOpenMap = () => {
    if (lat && lng) {
      navigate(`/map?lat=${lat}&lng=${lng}&zoom=16&highlight=${id}`);
    } else {
      navigate(`/map`);
    }
  };

  return (
    <div 
      className={`mt-3 w-full max-w-[280px] rounded-2xl overflow-hidden transition-all duration-300 shadow-lg border ${
        isDarkMode 
          ? "bg-[#1a2b3c]/80 backdrop-blur-xl border-white/10" 
          : "bg-white border-[#eef2f7] shadow-[#2a85ec]/10"
      }`}
    >
      {/* Image Header */}
      <div className="h-[120px] w-full relative bg-gray-200">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`}>
            <Icon size={32} className={isDarkMode ? "text-white/20" : "text-gray-300"} />
          </div>
        )}
        
        {/* Rating Badge */}
        {rating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-yellow-500 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star size={12} fill="currentColor" /> {Number(rating).toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={`font-semibold text-base leading-tight truncate ${isDarkMode ? "text-white" : "text-[#1e3a5f]"}`}>
            {name}
          </h4>
        </div>
        
        <p className={`text-xs capitalize flex items-center gap-1 mb-4 ${isDarkMode ? "text-white/60" : "text-[#6b7280]"}`}>
          <Icon size={12} /> {category || "Restaurant"}
        </p>

        <button
          onClick={handleOpenMap}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex justify-center items-center gap-2 transition-all duration-300 ${
            isDarkMode
              ? "bg-[#2a85ec] text-white hover:bg-[#1e6ac7]"
              : "bg-[#2a85ec] text-white hover:bg-[#1e6ac7] shadow-md shadow-[#2a85ec]/20"
          }`}
        >
          <MapPin size={16} /> Open on Map
        </button>
      </div>
    </div>
  );
}
