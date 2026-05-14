/**
 * ReportRoadProblemModal
 * Users click on the map to pin the exact location of the problem,
 * fill in the form, and submit. The report immediately appears on the map via socket.
 */
import React, { useState, useEffect, useRef } from "react";
import { createRoadProblem } from "../../services/mapApi";

const PROBLEM_TYPES = [
  { value: "pothole",      label: "🕳️ Pothole" },
  { value: "closure",      label: "🚧 Road Closure" },
  { value: "construction", label: "👷 Construction" },
  { value: "accident",     label: "🚨 Accident" },
  { value: "flooding",     label: "💧 Flooding" },
  { value: "other",        label: "⚠️ Other" },
];

export default function ReportRoadProblemModal({ onClose, userLocation, mapRef }) {
  const [form, setForm] = useState({
    title: "", description: "", type: "pothole", severity: "medium",
    address: "", lat: "", lng: "",
  });
  const [pinMode, setPinMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const clickHandlerRef = useRef(null);

  // Pre-fill with user location
  useEffect(() => {
    if (userLocation) {
      setForm((f) => ({ ...f, lng: userLocation[0], lat: userLocation[1] }));
    }
  }, [userLocation]);

  // Map click to pin location
  useEffect(() => {
    if (!mapRef?.current || !pinMode) return;

    const handler = (e) => {
      const { lng, lat } = e.lngLat;
      setForm((f) => ({ ...f, lng, lat }));
      setPinMode(false);
    };

    mapRef.current.getCanvas().style.cursor = "crosshair";
    mapRef.current.on("click", handler);
    clickHandlerRef.current = handler;

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handler);
        mapRef.current.getCanvas().style.cursor = "";
      }
    };
  }, [pinMode, mapRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) { setError("Please set a location on the map."); return; }
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSubmitting(true);
    try {
      await createRoadProblem({
        title: form.title,
        description: form.description,
        type: form.type,
        severity: form.severity,
        address: form.address,
        location: { type: "Point", coordinates: [parseFloat(form.lng), parseFloat(form.lat)] },
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />

      {/* Modal */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "white", borderRadius: "20px 20px 0 0",
        padding: "24px 20px 32px",
        maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>⚠️ Report Road Problem</h2>
          <button onClick={onClose} style={{ border: "none", background: "#f5f5f5", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <label style={labelStyle}>
            Problem Title *
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Large pothole on Main St"
              style={inputStyle}
              required
            />
          </label>

          {/* Type */}
          <label style={labelStyle}>
            Problem Type
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {PROBLEM_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, type: value })}
                  style={{
                    padding: "6px 12px", borderRadius: 20, border: "2px solid",
                    borderColor: form.type === value ? "#1E90FF" : "#e8e8e8",
                    background: form.type === value ? "#EAF4FF" : "white",
                    cursor: "pointer", fontSize: 13, fontWeight: 600,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </label>

          {/* Severity */}
          <label style={labelStyle}>
            Severity
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {["low", "medium", "high"].map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => setForm({ ...form, severity: s })}
                  style={{
                    flex: 1, padding: "8px", borderRadius: 10, border: "2px solid",
                    borderColor: form.severity === s ? severityColor(s) : "#e8e8e8",
                    background: form.severity === s ? `${severityColor(s)}20` : "white",
                    cursor: "pointer", fontWeight: 600, fontSize: 13,
                    color: form.severity === s ? severityColor(s) : "#555",
                    textTransform: "capitalize",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </label>

          {/* Description */}
          <label style={labelStyle}>
            Description (optional)
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the problem..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </label>

          {/* Location */}
          <label style={labelStyle}>
            Location
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
              <span style={{ fontSize: 13, color: form.lat ? "#00b060" : "#aaa", flex: 1 }}>
                {form.lat ? `📍 ${parseFloat(form.lat).toFixed(5)}, ${parseFloat(form.lng).toFixed(5)}` : "No location set"}
              </span>
              {mapRef && (
                <button
                  type="button"
                  onClick={() => setPinMode(true)}
                  style={{ padding: "8px 14px", borderRadius: 10, border: "2px solid #1E90FF", background: pinMode ? "#1E90FF" : "white", color: pinMode ? "white" : "#1E90FF", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  {pinMode ? "Click the map…" : "📍 Pin on Map"}
                </button>
              )}
            </div>
          </label>

          {error && <p style={{ color: "#FF3B30", fontSize: 13, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%", padding: 15, borderRadius: 14, border: "none",
              background: submitting ? "#ccc" : "#FF3B30", color: "white",
              fontWeight: 700, fontSize: 16, cursor: submitting ? "not-allowed" : "pointer",
              marginTop: 4,
            }}
          >
            {submitting ? "Submitting…" : "⚠️ Submit Report"}
          </button>
        </form>
      </div>
    </>
  );
}

const severityColor = (s) => ({ low: "#f5a623", medium: "#FF9500", high: "#FF3B30" }[s] || "#aaa");
const labelStyle = { display: "flex", flexDirection: "column", gap: 4, fontSize: 13, fontWeight: 600, color: "#333" };
const inputStyle = { padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", marginTop: 4, fontFamily: "inherit" };
