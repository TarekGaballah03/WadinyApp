import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Coffee, Tag } from "lucide-react";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import MiniMap from "./MiniMap";
import AIButton from "../AIButton/AIButton";
import { useTheme } from "../../context/ThemeContext";
import { getPostsAPI } from "../../services/api";
import { fetchRoadProblems } from "../../services/mapApi";

const TYPE_META = {
  hazard: { label: "Problem", Icon: AlertCircle, color: "text-[#dc2626]" },
  social: { label: "Update", Icon: Coffee, color: "text-[#16a34a]" },
  cafe: { label: "Open", Icon: Coffee, color: "text-[#16a34a]" },
  offer: { label: "Offer", Icon: Tag, color: "text-[#2563eb]" },
  pothole: { label: "Road issue", Icon: AlertCircle, color: "text-[#dc2626]" },
  closure: { label: "Closure", Icon: AlertCircle, color: "text-[#dc2626]" },
};

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} day ago`;
}

export default function MapPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const loadLiveUpdates = async () => {
      try {
        const [postsRes, roadsRes] = await Promise.all([
          getPostsAPI({ limit: 10 }).catch(() => ({ posts: [] })),
          fetchRoadProblems().catch(() => ({ data: { data: [] } })),
        ]);

        const postItems = (postsRes.posts || []).map((p) => ({
          id: `post-${p._id}`,
          name: p.author?.name || "User",
          time: formatTimeAgo(p.createdAt),
          text: p.body,
          status: p.type || "social",
          img: p.image?.secure_url,
          profileImg:
            p.author?.image?.secure_url ||
            "https://randomuser.me/api/portraits/lego/1.jpg",
        }));

        const roadItems = (roadsRes.data?.data || []).map((r) => ({
          id: `road-${r._id}`,
          name: r.reporter?.name || "Reporter",
          time: formatTimeAgo(r.createdAt),
          text: r.description || `${r.type} reported`,
          status: r.type || "hazard",
          img: null,
          profileImg:
            r.reporter?.image?.secure_url ||
            "https://randomuser.me/api/portraits/lego/2.jpg",
        }));

        setUpdates([...roadItems, ...postItems].slice(0, 12));
      } catch {
        setUpdates([]);
      } finally {
        setLoadingUpdates(false);
      }
    };

    loadLiveUpdates();
  }, []);

  return (
    <div
      className={`h-screen flex flex-col font-sans overflow-y-auto relative transition-colors duration-300 ${
        isDarkMode ? "bg-[#0a0f1a]" : "bg-[#f5f7fa]"
      }`}
    >
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} />

      <MiniMap height="320px" showSearch showReportBtn />

      <div
        className={`p-5 pt-6 flex-1 transition-colors duration-300 md:max-w-4xl md:mx-auto md:w-full md:p-8 ${
          isDarkMode ? "bg-[#0a0f1a]" : "bg-[#f5f7fa]"
        }`}
      >
        <h3
          className={`text-xl mb-[18px] font-semibold md:text-2xl md:mb-6 ${
            isDarkMode ? "text-white" : "text-[#0a2540]"
          }`}
        >
          Live Updates
        </h3>

        {loadingUpdates && (
          <p className={isDarkMode ? "text-white/60" : "text-[#64748b]"}>Loading updates…</p>
        )}

        {!loadingUpdates && updates.length === 0 && (
          <p className={isDarkMode ? "text-white/60" : "text-[#64748b]"}>
            No live updates yet.{" "}
            <button type="button" onClick={() => navigate("/report")} className="text-[#3182ce] underline">
              Report a problem
            </button>{" "}
            or post to the social feed.
          </p>
        )}

        {updates.map((item) => {
          const meta = TYPE_META[item.status] || TYPE_META.social;
          const StatusIcon = meta.Icon;
          return (
            <div
              key={item.id}
              className={`flex justify-between p-4 rounded-2xl mb-3 items-start transition-all duration-300 ${
                isDarkMode
                  ? "bg-[#1a2b3c]/40 backdrop-blur-md border border-[#2a3f55]/30"
                  : "bg-[#eef5ff] border border-[#d9e6f5]"
              }`}
            >
              <div className="flex gap-3 flex-1">
                <img src={item.profileImg} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <strong className={`text-[15px] ${isDarkMode ? "text-white" : "text-[#0a2540]"}`}>
                    {item.name}
                  </strong>
                  <span className={`text-[11px] block ${isDarkMode ? "text-white/50" : "text-[#64748b]"}`}>
                    {item.time}
                  </span>
                  <p className={`text-[13px] mb-2 mt-1 ${isDarkMode ? "text-white/80" : "text-[#334155]"}`}>
                    {item.text}
                  </p>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase ${meta.color}`}>
                    <StatusIcon size={14} />
                    {meta.label}
                  </span>
                </div>
              </div>
              {item.img && (
                <img src={item.img} alt="" className="w-[110px] h-[100px] object-cover rounded-[18px] ml-3" />
              )}
            </div>
          );
        })}
      </div>

      <AIButton />
    </div>
  );
}
