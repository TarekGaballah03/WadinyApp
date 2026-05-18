import { useState, useEffect, useCallback } from "react";
import { fetchPlaces, fetchRoadProblems, createRoadProblem as apiCreateRoadProblem, searchPlaces as apiSearch } from "../services/mapApi";
import io from "socket.io-client";
import { API_BASE_URL } from "../config/apiConfig";

export default function useMapData() {
  const [places, setPlaces] = useState([]);
  const [roadProblems, setRoadProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all map data
  const loadData = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const [placesRes, problemsRes] = await Promise.all([
        fetchPlaces(params),
        fetchRoadProblems(),
      ]);
      setPlaces(placesRes.data.data);
      setRoadProblems(problemsRes.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time socket updates for road problems
  useEffect(() => {
    loadData();

    const socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });

    socket.on("new_road_problem", (problem) => {
      setRoadProblems((prev) => [problem, ...prev]);
    });

    socket.on("road_problem_resolved", ({ id }) => {
      setRoadProblems((prev) => prev.filter((p) => p._id !== id));
    });

    return () => socket.disconnect();
  }, [loadData]);

  const reportRoadProblem = async (data) => {
    const res = await apiCreateRoadProblem(data);
    // socket will push the update, but optimistically add it:
    setRoadProblems((prev) => [res.data.data, ...prev]);
    return res.data.data;
  };

  const search = async (q, type) => {
    const res = await apiSearch(q, type);
    return res.data.data;
  };

  return { places, roadProblems, loading, error, loadData, reportRoadProblem, search };
}
