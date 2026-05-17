/**
 * NavigationPanel
 * Implements the 3-screen flow from Image 2:
 *  1. Route Preview  — ETA, transport selector, Start Navigation
 *  2. Turn-by-turn  — driving banner, steps list, Exit
 *  3. Arrived        — Rate Place, Explore Nearby, End Trip
 */
import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { getDirections } from "../../services/mapApi";
import { useNavigate } from "react-router-dom";

// ORS profile mapping
const TRANSPORT_MODES = [
  { key: "driving-car",     icon: "🚗", label: "Drive",  profile: "driving-car" },
  { key: "foot-walking",    icon: "🚶", label: "Walk",   profile: "foot-walking" },
  { key: "cycling-regular", icon: "🚲", label: "Bike",   profile: "cycling-regular" },
  // Bus is not in ORS free tier; we show it as ~2x drive time estimate
  { key: "bus",             icon: "🚌", label: "Bus",    profile: "driving-car", isBus: true },
];

export default function NavigationPanel({ destination, userLocation, onClose, mapRef: parentMapRef }) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("preview"); // preview | navigating | arrived
  const [activeMode, setActiveMode] = useState("driving-car");
  const [routeData, setRouteData] = useState(null); // { distance, duration, steps }
  const [allRoutes, setAllRoutes] = useState({});   // cache per mode
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const routeLayerRef = useRef(null);

  // Decode ORS encoded polyline to GeoJSON coordinates
  const decodePolyline = (encoded) => {
    const coords = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : result >> 1;
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : result >> 1;
      coords.push([lng / 1e5, lat / 1e5]);
    }
    return coords;
  };

  const drawRoute = (geometry) => {
    if (!parentMapRef?.current) return;
    const map = parentMapRef.current;
    const coords = decodePolyline(geometry);

    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route")) map.removeSource("route");

    map.addSource("route", { type: "geojson", data: { type: "Feature", geometry: { type: "LineString", coordinates: coords } } });
    map.addLayer({ id: "route-line", type: "line", source: "route", paint: { "line-color": "#1E90FF", "line-width": 5, "line-cap": "round" } });
    routeLayerRef.current = "route-line";

    // Fit map to route
    const bounds = coords.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, { padding: 80 });
  };

  const fetchRoute = async (mode) => {
    if (!userLocation) return;
    if (allRoutes[mode]) { setRouteData(allRoutes[mode]); return; }
    setLoading(true);
    try {
      const profile = TRANSPORT_MODES.find((m) => m.key === mode)?.profile || "driving-car";
      const res = await getDirections({
        originLat: userLocation[1], originLng: userLocation[0],
        destLat: destination.location.coordinates[1],
        destLng: destination.location.coordinates[0],
        mode: profile,
      });
      let data = res.data.data;
      if (TRANSPORT_MODES.find((m) => m.key === mode)?.isBus) {
        data = { ...data, duration: data.duration * 1.8 }; // rough bus estimate
      }
      setAllRoutes((prev) => ({ ...prev, [mode]: data }));
      setRouteData(data);
      drawRoute(data.geometry);
    } catch (err) {
      console.error("Directions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoute(activeMode); }, [activeMode, userLocation]);

  const formatDuration = (seconds) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };
  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // ── Screen: Preview ───────────────────────────────────────────────────────
  if (screen === "preview") return (
    <Panel onClose={onClose}>
      {/* Destination header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, background: "#EAF4FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          {destination.type === "cafe" ? "☕" : "🍽️"}
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Destination</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{destination.name}</div>
        </div>
      </div>

      {/* Transport mode selector */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, gap: 8 }}>
        {TRANSPORT_MODES.map((m) => {
          const cached = allRoutes[m.key];
          return (
            <button key={m.key} onClick={() => setActiveMode(m.key)} style={{
              flex: 1, padding: "10px 4px", borderRadius: 12, border: "2px solid",
              borderColor: activeMode === m.key ? "#1E90FF" : "#e8e8e8",
              background: activeMode === m.key ? "#EAF4FF" : "white",
              cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: 22 }}>{m.icon}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{m.label}</div>
              {cached && <div style={{ fontSize: 12, fontWeight: 700, color: "#1E90FF", marginTop: 2 }}>{formatDuration(cached.duration)}</div>}
            </button>
          );
        })}
      </div>

      {/* ETA summary */}
      {routeData && !loading ? (
        <div style={{ marginBottom: 20, padding: "14px 16px", background: "#f8f9ff", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#1E90FF" }}>{formatDuration(routeData.duration)}</span>
            <span style={{ color: "#888" }}>({formatDistance(routeData.distance)})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00b060", display: "inline-block" }}/>
            <span style={{ color: "#00b060", fontWeight: 600 }}>Fluid traffic</span>
            <span style={{ color: "#888" }}>via {routeData.steps?.[0]?.instruction?.split(" ").slice(0, 5).join(" ")}</span>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 20, color: "#aaa" }}>
          {loading ? "Calculating route…" : userLocation ? "" : "Enable location to get directions"}
        </div>
      )}

      <button
        disabled={!routeData || loading}
        onClick={() => { setStepIndex(0); setScreen("navigating"); }}
        style={{
          width: "100%", padding: "15px", borderRadius: 14, border: "none",
          background: !routeData ? "#ccc" : "#1E90FF", color: "white",
          fontWeight: 700, fontSize: 16, cursor: routeData ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        🧭 Start Navigation
      </button>
    </Panel>
  );

  // ── Screen: Navigating ────────────────────────────────────────────────────
  if (screen === "navigating") {
    const currentStep = routeData?.steps?.[stepIndex];
    const nextStep = routeData?.steps?.[stepIndex + 1];
    return (
      <>
        {/* Turn instruction banner */}
        <div style={{
          position: "absolute", top: 80, left: 16, right: 16, zIndex: 25,
          background: "#1E90FF", borderRadius: 16, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 4px 20px rgba(30,144,255,0.4)",
        }}>
          <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            ➡️
          </div>
          <div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, fontWeight: 700 }}>
              {formatDistance(currentStep?.distance || 0)}
            </div>
            <div style={{ color: "white", fontSize: 14, fontWeight: 500 }}>
              {currentStep?.instruction || "Continue on route"}
            </div>
          </div>
        </div>

        {/* Bottom panel */}
        <Panel onClose={onClose} compact>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 800 }}>{formatDuration(routeData.duration)}</span>
                <span style={{ background: "#e6f9f0", color: "#00b060", padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>On time</span>
              </div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
                {formatDistance(routeData.distance)} · Arriving ~{new Date(Date.now() + routeData.duration * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <button onClick={onClose} style={{ padding: "8px 16px", border: "none", background: "#fff0f0", color: "#FF3B30", fontWeight: 700, borderRadius: 10, cursor: "pointer" }}>
              ✕ Exit
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={altBtnStyle} onClick={() => {}}>🔀 Alt Route</button>
            <button style={altBtnStyle} onClick={() => {}}>⛽ Add Stop</button>
            {stepIndex < (routeData?.steps?.length || 0) - 1 && (
              <button onClick={() => setStepIndex((i) => i + 1)} style={{ ...altBtnStyle, background: "#1E90FF", color: "white" }}>Next ›</button>
            )}
            {stepIndex >= (routeData?.steps?.length || 0) - 1 && (
              <button onClick={() => setScreen("arrived")} style={{ ...altBtnStyle, background: "#00b060", color: "white" }}>Arrive ✓</button>
            )}
          </div>
        </Panel>
      </>
    );
  }

  // ── Screen: Arrived ───────────────────────────────────────────────────────
  if (screen === "arrived") return (
    <Panel onClose={onClose}>
      <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>✅</div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>You have arrived!</h2>
        <p style={{ margin: 0, color: "#888", fontSize: 14 }}>You reached {destination.name}</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => navigate(`/place/${destination._id}?tab=review`)}
          style={{ flex: 1, padding: 14, border: "2px solid #f5a623", borderRadius: 14, background: "white", cursor: "pointer", fontWeight: 600 }}
        >
          ⭐ Rate Place
        </button>
        <button
          onClick={() => navigate(`/map?lat=${destination.location.coordinates[1]}&lng=${destination.location.coordinates[0]}&nearby=true`)}
          style={{ flex: 1, padding: 14, border: "2px solid #e0e0e0", borderRadius: 14, background: "white", cursor: "pointer", fontWeight: 600 }}
        >
          🗺️ Explore Nearby
        </button>
      </div>

      <button
        onClick={onClose}
        style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", background: "#1E90FF", color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
      >
        ✓ End Trip
      </button>
    </Panel>
  );
}

function Panel({ children, onClose, compact = false }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
      background: "white", borderRadius: "20px 20px 0 0",
      padding: compact ? "16px 20px 24px" : "20px 20px 32px",
      boxShadow: "0 -4px 30px rgba(0,0,0,0.15)",
      animation: "slideUp 0.3s ease",
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(60%)}to{transform:translateY(0)}}`}</style>
      <div style={{ width: 40, height: 4, background: "#e0e0e0", borderRadius: 2, margin: "0 auto 16px" }} />
      {children}
    </div>
  );
}

const altBtnStyle = {
  flex: 1, padding: "10px 12px", border: "2px solid #e8e8e8",
  borderRadius: 12, background: "white", cursor: "pointer",
  fontSize: 13, fontWeight: 600,
};
