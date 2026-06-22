// src/components/map/MapPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useTheme } from "../../context/ThemeContext";
import { getReportsAPI } from "../../services/api";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Icons
const CAFE_ICON = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='18' fill='%231E90FF' stroke='white' stroke-width='2'/><text x='20' y='26' text-anchor='middle' font-size='18'>☕</text></svg>`;
const RESTAURANT_ICON = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='18' fill='%23FF6B35' stroke='white' stroke-width='2'/><text x='20' y='26' text-anchor='middle' font-size='18'>🍽️</text></svg>`;

const WARNING_ICON_REAL = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><defs><linearGradient id='grad1' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' style='stop-color:%23FF5B52;stop-opacity:1' /><stop offset='100%' style='stop-color:%23D92C23;stop-opacity:1' /></linearGradient></defs><path d='M24 4L2 44h44L24 4z' fill='url(%23grad1)' stroke='%23B21E17' stroke-width='1.5'/><path d='M24 14v16h-1.5V14H24zm-0.75 22a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z' fill='white'/></svg>`;

export default function MapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reports, setReports] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // ============= جلب التقارير =============
  const fetchReports = async () => {
    try {
      const result = await getReportsAPI({ status: 'active', limit: 50 });
      console.log('📦 Active Reports:', result.reports);
      
      const reportsWithCoords = result.reports?.filter(r => r.coordinates?.lat && r.coordinates?.lng) || [];
      console.log('📍 Reports with coordinates:', reportsWithCoords);
      
      if (result.reports) {
        setReports(result.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  // ============= دالة إضافة الـ Markers =============
  const addMarkersToMap = () => {
    if (!mapRef.current) return;

    const mockPlaces = [
      { _id: "1", name: "Cafe Cairo", type: "cafe", location: { coordinates: [31.233, 30.044] }, address: "Downtown Cairo", averageRating: 4.5 },
      { _id: "2", name: "Restaurant Nile", type: "restaurant", location: { coordinates: [31.238, 30.048] }, address: "Zamalek", averageRating: 4.8 },
      { _id: "3", name: "Coffee House", type: "cafe", location: { coordinates: [31.230, 30.040] }, address: "Garden City", averageRating: 4.2 },
    ];

    mockPlaces.forEach((place) => {
      const [lng, lat] = place.location.coordinates;
      const iconUrl = place.type === "cafe" ? CAFE_ICON : RESTAURANT_ICON;

      const el = document.createElement("div");
      el.style.cssText = `width:36px;height:36px;cursor:pointer;`;
      el.innerHTML = `<img src="${iconUrl}" style="width:100%;height:100%" />`;

      const popup = new maplibregl.Popup({ offset: 20, closeButton: false })
        .setHTML(`
          <div style="font-family:sans-serif;min-width:160px">
            <strong style="font-size:14px">${place.name}</strong>
            <p style="margin:4px 0;color:#666;font-size:12px">${place.address}</p>
            <p style="margin:0;color:#f5a623">⭐ ${place.averageRating?.toFixed(1) || "New"}</p>
            <button onclick="window.location='/place/${place._id}'"
              style="margin-top:8px;padding:4px 12px;background:#1E90FF;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px">
              View Details
            </button>
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });

    reports.forEach((report) => {
      if (!report.coordinates?.lat || !report.coordinates?.lng) {
        return;
      }

      const { lat, lng } = report.coordinates;

      const el = document.createElement("div");
      el.style.cssText = `
        width: 44px;
        height: 44px;
        cursor: pointer;
      `;
      el.innerHTML = `<img src="${WARNING_ICON_REAL}" style="width:100%;height:100%;display:block;" />`;

      const popupHTML = `
        <div style="font-family:sans-serif;min-width:180px;max-width:260px;padding:10px 12px;background:white;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;border-bottom:1px solid #f0f0f0;padding-bottom:8px">
            <img src="${WARNING_ICON_REAL}" style="width:20px;height:20px;" />
            <strong style="font-size:15px;color:#D92C23">${report.issueType || 'Unknown Issue'}</strong>
          </div>
          ${report.note ? `<p style="margin:8px 0;font-size:13px;color:#555;line-height:1.5">${report.note}</p>` : ''}
          ${report.location ? `<p style="margin:4px 0;font-size:12px;color:#888">📍 ${report.location}</p>` : ''}
          <p style="margin:8px 0 0;font-size:10px;color:#999;border-top:1px solid #f5f5f5;padding-top:8px">
            🕐 ${new Date(report.createdAt).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      `;

      const popup = new maplibregl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        className: 'report-popup'
      }).setHTML(popupHTML);

      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center'
      })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  };

  // ============= البحث عن مكان =============
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [parseFloat(lon), parseFloat(lat)],
            zoom: 15,
            duration: 2000,
          });
        }

        if (window.searchMarker) {
          window.searchMarker.remove();
        }

        const el = document.createElement("div");
        el.style.cssText = `
          width: 40px;
          height: 40px;
          background: #4A90D9;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 20px rgba(74, 144, 217, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        `;
        el.innerHTML = "📍";

        window.searchMarker = new maplibregl.Marker({ element: el })
          .setLngLat([parseFloat(lon), parseFloat(lat)])
          .setPopup(
            new maplibregl.Popup({ offset: 25, closeButton: false })
              .setHTML(`
                <div style="font-family:sans-serif;padding:4px;max-width:250px">
                  <strong style="font-size:14px">🔍 ${display_name.split(',')[0]}</strong>
                  <p style="margin:4px 0 0;font-size:11px;color:#666">${display_name}</p>
                </div>
              `)
          )
          .addTo(mapRef.current);

        setTimeout(() => {
          if (window.searchMarker) {
            window.searchMarker.togglePopup();
          }
        }, 500);

      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for location. Please try again.');
    }
  };

  // ⭐⭐⭐ دالة التعامل مع الإحداثيات (من URL أو State) ⭐⭐⭐
  const handleLocation = () => {
    if (!mapRef.current) return;

    // 1️⃣ نجيب الإحداثيات من الـ URL params
    const searchParams = new URLSearchParams(location.search);
    let latParam = parseFloat(searchParams.get("lat"));
    let lngParam = parseFloat(searchParams.get("lng"));
    let zoomParam = parseFloat(searchParams.get("zoom")) || 15;
    let highlightId = searchParams.get("highlight");

    // 2️⃣ لو مفيش في الـ URL، نجيب من الـ state
    if (isNaN(latParam) || isNaN(lngParam)) {
      if (location.state?.lat && location.state?.lng) {
        latParam = location.state.lat;
        lngParam = location.state.lng;
        zoomParam = location.state.zoom || 15;
        highlightId = location.state.highlight || null;
        console.log('📍 Using state location:', { latParam, lngParam });
      }
    }

    console.log('🔍 Final Location:', { latParam, lngParam, zoomParam, highlightId });

    if (!isNaN(latParam) && !isNaN(lngParam)) {
      console.log(`📍 Moving map to: ${latParam}, ${lngParam}`);
      
      mapRef.current.flyTo({
        center: [lngParam, latParam],
        zoom: zoomParam,
        duration: 2000,
      });

      if (window.highlightMarker) {
        window.highlightMarker.remove();
        window.highlightMarker = null;
      }

      const el = document.createElement("div");
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background: ${highlightId ? '#FF1493' : '#4A90D9'};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 25px rgba(74, 144, 217, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: white;
        font-weight: bold;
      `;
      el.innerHTML = '📍';

      window.highlightMarker = new maplibregl.Marker({ element: el })
        .setLngLat([lngParam, latParam])
        .addTo(mapRef.current);

      setTimeout(() => {
        if (window.highlightMarker) {
          window.highlightMarker.togglePopup();
        }
      }, 1000);
    }
  };

  // جلب التقارير كل 30 ثانية
  useEffect(() => {
    fetchReports();
    
    const interval = setInterval(() => {
      fetchReports();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // ⭐⭐⭐ معالجة الـ state عند أول تحميل ⭐⭐⭐
  useEffect(() => {
    // لو فيه state، نحوله لـ URL params عشان يفضل موجود
    if (location.state?.lat && location.state?.lng) {
      const { lat, lng, zoom = 15, highlight } = location.state;
      const params = new URLSearchParams();
      params.set('lat', String(lat));
      params.set('lng', String(lng));
      params.set('zoom', String(zoom));
      if (highlight) params.set('highlight', String(highlight));
      
      console.log('🔄 Converting state to URL:', params.toString());
      navigate(`/map?${params.toString()}`, { replace: true, state: null });
    }
  }, []);

  // ============= Init Map =============
  useEffect(() => {
    if (mapRef.current) return;

    const searchParams = new URLSearchParams(location.search);
    const latParam = parseFloat(searchParams.get("lat"));
    const lngParam = parseFloat(searchParams.get("lng"));
    const zoomParam = parseFloat(searchParams.get("zoom")) || 13;

    const initialCenter = (!isNaN(latParam) && !isNaN(lngParam)) 
      ? [lngParam, latParam] 
      : [31.2357, 30.0444];

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: initialCenter,
      zoom: (!isNaN(latParam) && !isNaN(lngParam)) ? zoomParam : 13,
      attributionControl: false,
    });

    mapRef.current.on('load', () => {
      console.log('✅ Map loaded successfully');
      setMapLoaded(true);
      
      setTimeout(() => {
        handleLocation();
      }, 500);
    });

    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      const { latitude: lat, longitude: lng } = coords;
      if (mapRef.current && (isNaN(latParam) || isNaN(lngParam))) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });
      }
      if (mapRef.current) {
        new maplibregl.Marker({ color: "#1E90FF" })
          .setLngLat([lng, lat])
          .setPopup(new maplibregl.Popup().setHTML("<b>You are here</b>"))
          .addTo(mapRef.current);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ⭐⭐⭐ متابعة تغييرات الـ URL بعد تحميل الخريطة ⭐⭐⭐
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    console.log('🔄 URL changed, updating map location...');
    handleLocation();
  }, [location.search, mapLoaded]);

  // ============= Add Markers =============
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    markersRef.current.forEach((m) => { try { m.remove(); } catch (e) {} });
    markersRef.current = [];
    if (mapRef.current.isStyleLoaded()) { addMarkersToMap(); } 
    else { mapRef.current.once("load", addMarkersToMap); }
  }, [reports, mapLoaded]);

  const handleZoomIn = () => { if (mapRef.current) mapRef.current.zoomIn(); };
  const handleZoomOut = () => { if (mapRef.current) mapRef.current.zoomOut(); };

  return (
    <div className={`h-screen w-full flex flex-col font-sans overflow-hidden relative transition-colors duration-300 ${isDarkMode ? "bg-[#0a0f1a]" : "bg-[#f5f7fa]"}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Search Bar */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 w-[280px] sm:w-[300px] md:w-[400px] pointer-events-none">
          <form onSubmit={handleSearch} className="pointer-events-auto">
            <div className={`flex items-center gap-2.5 py-2.5 px-4 sm:py-3 sm:px-5 rounded-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 ${isDarkMode ? 'bg-[#1a2b3c]/60 backdrop-blur-xl border border-[#2a3f55]/50' : 'bg-white/90 backdrop-blur-xl border border-white/20'}`}>
              <Search size={16} className={isDarkMode ? 'text-white/50' : 'text-gray-400'} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search for a location" 
                className={`border-none outline-none text-[13px] sm:text-[15px] w-full bg-transparent md:text-base transition-colors duration-300 ${isDarkMode ? 'text-white/90 placeholder:text-white/50' : 'text-gray-800 placeholder:text-gray-400'}`} 
              />
            </div>
          </form>
        </div>
        
        {/* Zoom Buttons */}
        <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
          <button onClick={handleZoomIn} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-[#1a2b3c]/50 backdrop-blur-xl border border-[#2a3f55]/50 text-white hover:bg-[#1a2b3c]/70' : 'bg-[#4A90D9] text-white hover:bg-[#3A7BC8]'}`}>+</button>
          <button onClick={handleZoomOut} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-[#1a2b3c]/50 backdrop-blur-xl border border-[#2a3f55]/50 text-white hover:bg-[#1a2b3c]/70' : 'bg-[#4A90D9] text-white hover:bg-[#3A7BC8]'}`}>−</button>
        </div>
        
        {/* Report Button */}
        <button onClick={() => navigate("/report")} className={`absolute left-1/2 -translate-x-1/2 z-10 py-2.5 px-6 sm:py-3 sm:px-8 rounded-[40px] flex items-center justify-center font-semibold text-[15px] sm:text-[18px] text-white transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.3)] bottom-20 sm:bottom-16 md:bottom-10 lg:bottom-8 ${isDarkMode ? 'bg-[#1a2b3c]/50 backdrop-blur-xl border border-[#2a3f55]/50 hover:bg-[#1a2b3c]/70' : 'bg-[#4A90D9] hover:bg-[#3A7BC8]'}`}>Report</button>
      </div>
    </div>
  );
}