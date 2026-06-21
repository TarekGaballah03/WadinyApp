import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "../../context/ThemeContext";

export default function LocationPickerModal({ onClose, onConfirm }) {
  const { isDarkMode } = useTheme();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [29.9187, 31.2001], // Alexandria center
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // Click to drop a pin
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setSelectedLocation({ lng, lat });

      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({ color: "#FF3B30" })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
    });

    // Try get user location to center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        mapRef.current.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14 });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleConfirm = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation.lat, selectedLocation.lng);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-3xl h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-[#1a2b3c] border border-white/10' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 flex justify-between items-center border-b ${
          isDarkMode ? 'border-white/10' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#1e3a5f]'}`}>
            Pick Location on Map
          </h3>
          <button 
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              isDarkMode ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full" />
          
          {/* Overlay info */}
          {!selectedLocation && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full shadow-md text-sm font-medium z-10">
              Click anywhere on the map to drop a pin 📍
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 flex justify-end gap-3 border-t ${
          isDarkMode ? 'bg-[#0a0f1a]/50 border-white/10' : 'bg-gray-50 border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-medium transition ${
              isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              selectedLocation 
                ? 'bg-[#2a85ec] text-white hover:bg-[#1e6ac7] shadow-md shadow-[#2a85ec]/30' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
