import axios from "axios";

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api" });

// Attach token if logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Places ─────────────────────────────────────────────────────────────────
export const fetchPlaces = (params = {}) => API.get("/map/places", { params });
export const fetchPlaceById = (id) => API.get(`/map/places/${id}`);
export const createPlace = (data) => API.post("/map/places", data);
export const updatePlace = (id, data) => API.put(`/map/places/${id}`, data);
export const deletePlace = (id) => API.delete(`/map/places/${id}`);

// ─── Road Problems ───────────────────────────────────────────────────────────
export const fetchRoadProblems = () => API.get("/map/road-problems");
export const createRoadProblem = (data) => API.post("/map/road-problems", data);
export const resolveRoadProblem = (id) => API.put(`/map/road-problems/${id}/resolve`);
export const deleteRoadProblem = (id) => API.delete(`/map/road-problems/${id}`);

// ─── Navigation ──────────────────────────────────────────────────────────────
export const getDirections = (body) => API.post("/map/directions", body);

// ─── Search ──────────────────────────────────────────────────────────────────
export const searchPlaces = (q, type) => API.get("/map/search", { params: { q, type } });
