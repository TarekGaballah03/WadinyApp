// src/components/report/ReportPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Camera, Video, ChevronDown, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useTheme } from "../../context/ThemeContext";
import { submitReportAPI } from "../../services/api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function ReportPage() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("loggedIn") === "true");
    
    if (localStorage.getItem("loggedIn") !== "true") {
      if (window.openAuthModal) {
        window.openAuthModal();
      }
    }
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [issue, setIssue] = useState("Pothole");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [note, setNote] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [shareToSocial, setShareToSocial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [locationAddress, setLocationAddress] = useState("");

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!isLoggedIn) {
    return null;
  }

  // ============= Map Modal Functions =============
  const openMapModal = () => {
    setShowMapModal(true);
    setTimeout(() => {
      initMap();
    }, 300);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  const initMap = () => {
    if (mapRef.current) return;

    const defaultCenter = [31.2357, 30.0444];

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: defaultCenter,
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    const el = document.createElement("div");
    el.style.cssText = `
      width: 44px;
      height: 44px;
      background: #FF3B30;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 25px rgba(255, 59, 48, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      cursor: grab;
      transition: transform 0.2s;
    `;
    el.innerHTML = "📍";

    markerRef.current = new maplibregl.Marker({ 
      element: el,
      draggable: true 
    })
      .setLngLat(defaultCenter)
      .addTo(mapRef.current);

    markerRef.current.on("dragend", () => {
      const lngLat = markerRef.current.getLngLat();
      const lat = lngLat.lat;
      const lng = lngLat.lng;
      setSelectedLocation({ lat, lng });
      getAddressFromCoords(lat, lng);
    });

    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
        markerRef.current.setLngLat([lng, lat]);
        setSelectedLocation({ lat, lng });
        getAddressFromCoords(lat, lng);

        const userEl = document.createElement("div");
        userEl.style.cssText = `
          width: 16px;
          height: 16px;
          background: #1E90FF;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 20px rgba(30, 144, 255, 0.6);
        `;
        userMarkerRef.current = new maplibregl.Marker({ element: userEl })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      },
      () => {
        console.log("Could not get location");
      }
    );

    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current.setLngLat([lng, lat]);
      setSelectedLocation({ lat, lng });
      getAddressFromCoords(lat, lng);
    });
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setLocationAddress(data.display_name);
      } else {
        setLocationAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch (error) {
      console.error("Error getting address:", error);
      setLocationAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      if (!locationAddress) {
        getAddressFromCoords(selectedLocation.lat, selectedLocation.lng);
      }
      closeMapModal();
    } else {
      alert("Please select a location on the map first.");
    }
  };

  const handleUpload = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      setPreview(URL.createObjectURL(uploaded));
    }
  };

  // ============= handleSubmit المعدل (شيلنا createPostAPI) =============
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // بناء بيانات التقرير
      const reportData = {
        issueType: issue,
        note: note || undefined,
        sharedToFeed: shareToSocial,
        media: file || undefined,
      };

      if (selectedLocation) {
        reportData.lat = selectedLocation.lat;
        reportData.lng = selectedLocation.lng;
      }

      if (locationAddress) {
        reportData.location = locationAddress;
      }

      console.log("📤 Submitting report:", reportData);
      
      const reportResult = await submitReportAPI(reportData);
      console.log("✅ Report submitted:", reportResult);

      setShowPopup(true);
      setFile(null);
      setPreview(null);
      setNote("");
      setIssue("Pothole");
      setSelectedLocation(null);
      setLocationAddress("");

      setTimeout(() => {
        setShowPopup(false);
        setIsSubmitting(false);
        if (shareToSocial) {
          navigate('/social');
        } else {
          navigate('/home');
        }
      }, 3000);

    } catch (err) {
      console.error('❌ Report submission failed:', err);
      console.error('❌ Error details:', err.data);
      alert(`Failed to submit report: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const issueOptions = [
    { value: "Pothole", label: "Pothole" },
    { value: "Road Block", label: "Road Block" },
    { value: "Accident", label: "Accident" },
    { value: "Heavy Traffic", label: "Heavy Traffic" },
    { value: "Construction", label: "Construction" },
    { value: "Other", label: "Other" },
  ];

  const handleSelectIssue = (value) => {
    setIssue(value);
    setIsDropdownOpen(false);
  };

  const isImage = (file) => file && file.type.startsWith("image");
  const isVideo = (file) => file && file.type.startsWith("video");

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-[#f5f7fa]'
    }`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="p-[26px_22px] max-w-[420px] mx-auto flex flex-col gap-[22px]">
        <h2 className={`text-[30px] font-bold text-center mb-[5px] transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#1e3a5f]'
        }`}>
          Describe the Issue
        </h2>

        {/* Type of issue */}
        <p className={`text-base font-semibold mb-[-8px] transition-colors duration-300 ${
          isDarkMode ? 'text-gray-300' : 'text-[#334155]'
        }`}>
          Type of Issue
        </p>

        {/* Custom Dropdown */}
        <div className="relative w-full">
          <div 
            className={`w-full p-4 text-base border-none rounded-[18px] cursor-pointer font-medium shadow-[0_4px_10px_rgba(79,114,202,0.2)] flex justify-between items-center transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-800/70 backdrop-blur-lg border border-gray-700/50 text-white'
                : 'bg-gradient-to-r from-[#6ea1e1] to-[#4d7fc4] text-white'
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{issue}</span>
            <ChevronDown className={`w-[22px] h-[22px] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isDropdownOpen && (
            <div className={`absolute top-[calc(100%+8px)] left-0 w-full rounded-[18px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] overflow-hidden z-[1000] max-h-[280px] overflow-y-auto transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gray-800/90 backdrop-blur-lg border border-gray-700/50'
                : 'bg-white border border-[#edf2f9]'
            }`}>
              {issueOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-[14px_20px] text-[15px] cursor-pointer transition-all duration-200 border-b last:border-none ${
                    isDarkMode
                      ? issue === option.value
                        ? 'bg-blue-600/50 text-white font-medium border-gray-700'
                        : 'text-gray-200 border-gray-700 hover:bg-white/10 hover:text-white'
                      : issue === option.value
                        ? 'bg-gradient-to-r from-[#6ea1e1] to-[#4d7fc4] text-white font-medium border-[#eef3f8]'
                        : 'text-[#1e3a5f] border-[#eef3f8] hover:bg-[#eaf2ff] hover:pl-[25px] hover:font-medium'
                  }`}
                  onClick={() => handleSelectIssue(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload */}
        <label className={`border-2 border-dashed rounded-[28px] p-10 text-center cursor-pointer transition-all duration-300 ${
          isDarkMode
            ? 'border-white/20 bg-white/5 backdrop-blur-sm'
            : 'border-[#b8cde0] bg-[#f4f8ff]'
        }`}>
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleUpload}
          />
          <div className={`flex justify-center gap-5 mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-blue-400' : 'text-[#6a93c9]'
          }`}>
            <Camera className="w-[34px] h-[34px]" />
            <Video className="w-[34px] h-[34px]" />
          </div>
          <h4 className={`text-[18px] font-semibold mb-[5px] transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-[#1e3a5f]'
          }`}>
            Add Photo or Video
          </h4>
          <p className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-[#6b7280]'
          }`}>
            Upload a file from your device
          </p>
        </label>

        {/* Preview */}
        {preview && (
          <div className={`rounded-[20px] p-[18px] shadow-[0_8px_20px_rgba(0,0,0,0.06)] border max-w-full mx-auto transition-all duration-300 ${
            isDarkMode
              ? 'bg-white/10 backdrop-blur-md border-white/20'
              : 'bg-white border-[#edf2f9]'
          }`}>
            <div className={`w-full max-h-[250px] rounded-[16px] overflow-hidden flex items-center justify-center ${
              isDarkMode ? 'bg-white/5' : 'bg-[#f0f4fa]'
            }`}>
              {isImage(file) ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : isVideo(file) ? (
                <video src={preview} controls className="w-full h-full object-cover" />
              ) : null}
            </div>
            <textarea
              placeholder="Write something about this photo or video..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className={`w-full border-2 rounded-[16px] p-[14px] resize-none text-sm font-sans mt-4 transition-all duration-200 focus:outline-none focus:shadow-[0_4px_12px_rgba(26,92,158,0.1)] box-border ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-white/30'
                  : 'bg-white border-[#eef3f8] text-gray-900 placeholder:text-[#94a3b8] focus:border-[#1a5c9e]'
              }`}
            />
          </div>
        )}

        {/* Share to Social Feed */}
        <div className={`rounded-2xl p-4 transition-all duration-300 ${
          isDarkMode
            ? 'bg-white/10 backdrop-blur-md border border-white/20'
            : 'bg-white border border-[#eef3f8] shadow-sm'
        }`}>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                shareToSocial ? 'bg-green-500/20' : 'bg-gray-500/20'
              }`}>
                {shareToSocial ? '🌐' : '🔒'}
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-[#1e3a5f]'}`}>
                  Share to Social Feed
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Post this report to the community feed
                </p>
              </div>
            </div>
            <div
              onClick={() => setShareToSocial(!shareToSocial)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                shareToSocial 
                  ? 'bg-green-500' 
                  : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                  shareToSocial ? 'left-7' : 'left-1'
                }`}
              />
            </div>
          </label>
        </div>

        {/* Map */}
        <div className={`rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.04)] border transition-all duration-300 ${
          isDarkMode
            ? 'bg-white/10 backdrop-blur-md border-white/20'
            : 'bg-white border-[#eef3f8]'
        }`}>
          <div 
            className="w-full h-[120px] bg-cover bg-center relative cursor-pointer"
            style={{
              backgroundImage: selectedLocation 
                ? `url(https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s(${selectedLocation.lng},${selectedLocation.lat})/${selectedLocation.lng},${selectedLocation.lat},14,0/400x120?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw)`
                : 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop'
            }}
            onClick={openMapModal}
          >
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isDarkMode 
                  ? 'bg-black/50 backdrop-blur-sm text-white' 
                  : 'bg-white/90 text-[#1e3a5f]'
              }`}>
                <MapPin size={18} />
                <span className="text-sm font-medium">
                  {selectedLocation ? '📍 Location Selected' : 'Select Location'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <h4 className={`text-base font-semibold mb-1.5 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-[#1e3a5f]'
            }`}>
              Pin Location on Map
            </h4>
            {locationAddress && (
              <p className={`text-xs mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white/50' : 'text-[#64748b]'
              }`}>
                📍 {locationAddress}
              </p>
            )}
            <p className={`text-sm mb-[18px] transition-colors duration-300 ${
              isDarkMode ? 'text-white/60' : 'text-[#64748b]'
            }`}>
              Tap the map above to select the location
            </p>
            <button 
              className={`block mx-auto border-none py-[14px] px-9 rounded-[40px] text-base font-semibold cursor-pointer shadow-[0_6px_14px_rgba(26,92,158,0.3)] w-fit transition-all duration-300 ${
                isDarkMode
                  ? 'bg-[#1a5c9e]/80 text-white hover:bg-[#1a5c9e]'
                  : 'bg-[#5f8fce] text-white hover:bg-[#4a7bb3]'
              }`}
              onClick={openMapModal}
            >
              {selectedLocation ? 'Change Location' : 'Select Location'}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button 
          className={`w-full border-none py-[18px] rounded-[40px] text-[17px] font-semibold cursor-pointer shadow-[0_8px_20px_rgba(26,92,158,0.25)] mt-[5px] transition-all duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-b from-[#2a85ec] to-[#1a5c9e] backdrop-blur-lg border border-white/20 text-white hover:from-[#1a5c9e] hover:to-[#0a3a6b]'
              : 'bg-gradient-to-b from-[#6ea1e1] to-[#3f6aa0] text-white hover:from-[#5f8fce] hover:to-[#2c5282]'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-[500px] h-[80vh] max-h-[600px] m-4 rounded-3xl overflow-hidden shadow-2xl">
            <div ref={mapContainer} className="w-full h-full" />

            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm font-medium">
              📍 Drag the marker or click to select
            </div>

            <button
              onClick={closeMapModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all duration-300 flex items-center justify-center"
            >
              <X size={20} />
            </button>

            <button
              onClick={confirmLocation}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-8 py-3 rounded-full bg-[#4A90D9] text-white font-semibold shadow-lg hover:bg-[#3A7BC8] transition-all duration-300"
            >
              ✓ Confirm Location
            </button>

            {selectedLocation && (
              <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full text-xs font-medium max-w-[90%] truncate ${
                isDarkMode
                  ? 'bg-black/60 backdrop-blur-md text-white/80'
                  : 'bg-white/90 backdrop-blur-md text-gray-700'
              }`}>
                📍 {locationAddress || `${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showPopup && (
        <div className={`fixed inset-0 flex items-center justify-center z-[999] ${
          isDarkMode ? 'bg-black/50 backdrop-blur-md' : 'bg-black/25'
        }`}>
          <div className={`p-[35px] rounded-[28px] text-center w-[300px] shadow-[0_20px_35px_rgba(0,0,0,0.2)] transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800/90 backdrop-blur-lg border border-gray-700/50'
              : 'bg-white'
          }`}>
            <div className="w-[70px] h-[70px] bg-[#22c55e] text-white text-[36px] rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_8px_15px_rgba(34,197,94,0.3)]">
              ✓
            </div>
            <h3 className={`mb-2 text-xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-[#1e3a5f]'
            }`}>Report Submitted</h3>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-[#64748b]'
            }`}>
              {shareToSocial 
                ? 'Your report has been uploaded and shared to the Social Feed'
                : 'Your report has been uploaded successfully'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}