/**
 * MiniMap — a compact, top-of-page map strip.
 * Drop this wherever you had an image placeholder.
 *
 * Usage:
 *   import MiniMap from "../components/map/MiniMap";
 *   <MiniMap height="300px" />
 */
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import useMapData from "../../hooks/useMapData";
import ReportRoadProblemModal from "./ReportRoadProblemModal";
import { useNavigate } from "react-router-dom";

// Icons (inline SVG data URIs so no extra deps)
const CAFE_ICON = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='18' fill='%231E90FF' stroke='white' stroke-width='2'/><text x='20' y='26' text-anchor='middle' font-size='18'>☕</text></svg>`;
const RESTAURANT_ICON = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='18' fill='%23FF6B35' stroke='white' stroke-width='2'/><text x='20' y='26' text-anchor='middle' font-size='18'>🍽️</text></svg>`;
const PROBLEM_ICON = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><polygon points='20,4 36,36 4,36' fill='%23FF3B30' stroke='white' stroke-width='2'/><text x='20' y='30' text-anchor='middle' font-size='16' fill='white'>!</text></svg>`;

export default function MiniMap({ height = "280px", showSearch = true, showReportBtn = true }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const navigate = useNavigate();
  const { places, roadProblems, loading } = useMapData();
  const [reportOpen, setReportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Init map
  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [31.2357, 30.0444], // Cairo default
      zoom: 13,
      attributionControl: false,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // Try get user location
    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      const { latitude: lat, longitude: lng } = coords;
      setUserLocation([lng, lat]);
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14 });

      new maplibregl.Marker({ color: "#1E90FF" })
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setHTML("<b>You are here</b>"))
        .addTo(mapRef.current);
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Add place & problem markers when data loads
  useEffect(() => {
    if (!mapRef.current || loading) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Wait for map style to load
    const addMarkers = () => {
      // Place markers
      places.forEach((place) => {
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

      // Road problem markers
      roadProblems.forEach((problem) => {
        const [lng, lat] = problem.location.coordinates;
        const el = document.createElement("div");
        el.style.cssText = `width:32px;height:32px;cursor:pointer;`;
        el.innerHTML = `<img src="${PROBLEM_ICON}" style="width:100%;height:100%" />`;

        const popup = new maplibregl.Popup({ offset: 16, closeButton: false })
          .setHTML(`
            <div style="font-family:sans-serif;min-width:140px">
              <strong style="color:#FF3B30;font-size:13px">⚠️ ${problem.title}</strong>
              <p style="margin:4px 0;font-size:12px;color:#555">${problem.description}</p>
              <span style="font-size:11px;background:#fff0f0;color:#FF3B30;padding:2px 6px;border-radius:4px">${problem.type}</span>
            </div>
          `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
      });
    };

    if (mapRef.current.isStyleLoaded()) {
      addMarkers();
    } else {
      mapRef.current.once("load", addMarkers);
    }
  }, [places, roadProblems, loading]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/map?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height, borderRadius: "16px", overflow: "hidden" }}>
      {/* Map canvas */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* Search overlay */}
      {showSearch && (
        <form
          onSubmit={handleSearch}
          style={{
            position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
            width: "calc(100% - 32px)", maxWidth: 400, zIndex: 10,
          }}
        >
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "white", borderRadius: 50, padding: "8px 16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              style={{ border: "none", outline: "none", flex: 1, fontSize: 14, color: "#333" }}
            />
          </div>
        </form>
      )}

      {/* Report button */}
      {showReportBtn && (
        <button
          onClick={() => setReportOpen(true)}
          style={{
            position: "absolute", bottom: 16, right: 16, zIndex: 10,
            display: "flex", alignItems: "center", gap: 6,
            background: "white", border: "none", borderRadius: 50,
            padding: "8px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#1E90FF",
          }}
        >
          <span style={{ fontSize: 18 }}>+</span> Report
        </button>
      )}

      {/* Open full map link */}
      <button
        onClick={() => navigate("/map")}
        style={{
          position: "absolute", bottom: 16, left: 16, zIndex: 10,
          background: "#1E90FF", color: "white", border: "none",
          borderRadius: 50, padding: "8px 16px", cursor: "pointer",
          fontSize: 13, fontWeight: 600, boxShadow: "0 2px 8px rgba(30,144,255,0.4)",
        }}
      >
        Open Map →
      </button>

      {reportOpen && (
        <ReportRoadProblemModal
          onClose={() => setReportOpen(false)}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}
