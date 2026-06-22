import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "../../context/ThemeContext";
import { Search, X, MapPin, Check, Navigation } from "lucide-react";

export default function LocationPickerModal({ onClose, onConfirm }) {
  const { isDarkMode } = useTheme();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [29.9187, 31.2001], // Alexandria center
      zoom: 12,
      attributionControl: false,
    });

    // إضافة أزرار التحكم
    mapRef.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    // Click to drop a pin
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setSelectedLocation({ lat, lng });

      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({
          color: "#FF3B30",
          draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        // ⭐ جعل الماركر قابل للسحب
        markerRef.current.on("dragend", () => {
          const { lng, lat } = markerRef.current.getLngLat();
          setSelectedLocation({ lat, lng });
        });
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }
    });

    // Try get user location to center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          mapRef.current.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 14,
            duration: 1500,
          });
        },
        () => {
          console.log("Location permission denied");
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ============= البحث عن مكان =============
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const lng = lon;
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        // التحرك إلى المكان
        mapRef.current.flyTo({
          center: [lngNum, latNum],
          zoom: 15,
          duration: 2000,
        });

        // تحديث الماركر
        setSelectedLocation({ lat: latNum, lng: lngNum });
        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker({
            color: "#FF3B30",
            draggable: true,
          })
            .setLngLat([lngNum, latNum])
            .addTo(mapRef.current);

          markerRef.current.on("dragend", () => {
            const { lng, lat } = markerRef.current.getLngLat();
            setSelectedLocation({ lat, lng });
          });
        } else {
          markerRef.current.setLngLat([lngNum, latNum]);
        }

        // عرض رسالة نجاح
        const locationName = display_name.split(",")[0];
        alert(`📍 Location found: ${locationName}`);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching for location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // ============= الذهاب لموقع المستخدم =============
  const goToMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          mapRef.current.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 15,
            duration: 1500,
          });

          // تحديث الماركر
          setSelectedLocation({ lat: coords.latitude, lng: coords.longitude });
          if (!markerRef.current) {
            markerRef.current = new maplibregl.Marker({
              color: "#FF3B30",
              draggable: true,
            })
              .setLngLat([coords.longitude, coords.latitude])
              .addTo(mapRef.current);

            markerRef.current.on("dragend", () => {
              const { lng, lat } = markerRef.current.getLngLat();
              setSelectedLocation({ lat, lng });
            });
          } else {
            markerRef.current.setLngLat([coords.longitude, coords.latitude]);
          }
        },
        () => {
          alert("Unable to get your location. Please allow location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      console.log("📍 Confirming location:", selectedLocation);
      onConfirm(selectedLocation.lat, selectedLocation.lng);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
          isDarkMode ? "bg-[#1a2b3c] border border-white/10" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b ${
            isDarkMode ? "border-white/10" : "border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-bold ${
              isDarkMode ? "text-white" : "text-[#1e3a5f]"
            }`}
          >
            📍 Pick Location on Map
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 sm:flex-initial">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                  isDarkMode
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-gray-100 border-gray-200"
                }`}
              >
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location..."
                  className={`border-none outline-none text-sm bg-transparent w-28 sm:w-40 ${
                    isDarkMode ? "text-white placeholder:text-white/50" : "text-gray-800"
                  }`}
                />
                {isSearching && (
                  <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin border-[#2a85ec]"></div>
                )}
              </div>
            </form>

            {/* My Location Button */}
            <button
              onClick={goToMyLocation}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Go to my location"
            >
              <Navigation size={18} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full" />

          {/* Overlay info */}
          {!selectedLocation && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-md text-sm font-medium z-10 transition-all ${
                isDarkMode
                  ? "bg-[#1a2b3c]/90 text-white backdrop-blur-sm"
                  : "bg-white/90 text-gray-800 backdrop-blur-sm"
              }`}
            >
              Click anywhere on the map to drop a pin 📍
            </div>
          )}

          {/* Selected Location Info */}
          {selectedLocation && (
            <div
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-md text-xs font-medium z-10 transition-all ${
                isDarkMode
                  ? "bg-[#1a2b3c]/90 text-white backdrop-blur-sm border border-white/10"
                  : "bg-white/90 text-gray-800 backdrop-blur-sm border border-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-red-500" />
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 flex justify-end gap-3 border-t ${
            isDarkMode
              ? "bg-[#0a0f1a]/50 border-white/10"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-medium transition ${
              isDarkMode
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
              selectedLocation
                ? "bg-[#2a85ec] text-white hover:bg-[#1e6ac7] shadow-md shadow-[#2a85ec]/30"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
            }`}
          >
            <Check size={18} />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}