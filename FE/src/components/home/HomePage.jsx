// src/components/home/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapImage from "../../assets/map.jpg";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import AIButton from "../../components/AIButton/AIButton";
import { useTheme } from "../../context/ThemeContext";
import { usePlaces } from "../places/PlacesContext";
import { getPostsAPI, getReportsAPI, getOffersAPI } from "../../services/api";
import {
  mapBackendPostToFeedItem,
  mapOfferToFeedItem,
  mapReportToFeedItem,
} from "../../utils/postMappers";

export default function HomePage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { getTopRatedPlaces, places } = usePlaces();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [feedItems, setFeedItems] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("loggedIn") === "true");
  }, []);

  useEffect(() => {
    const loadFeed = async () => {
      setLoadingFeed(true);
      try {
        const [postsRes, offersRes, reportsRes] = await Promise.all([
          getPostsAPI({ limit: 8 }).catch(() => ({ posts: [] })),
          getOffersAPI({ isActive: true, limit: 4 }).catch(() => ({ offers: [] })),
          getReportsAPI({ limit: 5 }).catch(() => ({ reports: [] })),
        ]);

        const posts = postsRes.posts || [];
        const postIds = new Set(posts.map((p) => p._id?.toString()));

        const fromPosts = posts.map(mapBackendPostToFeedItem);
        const fromReports = (reportsRes.reports || [])
          .filter((r) => {
            const linked = r.linkedPostId?._id || r.linkedPostId;
            return !linked || !postIds.has(linked.toString());
          })
          .map(mapReportToFeedItem);
        const fromOffers = (offersRes.offers || []).map(mapOfferToFeedItem);

        setFeedItems([...fromPosts, ...fromReports, ...fromOffers].slice(0, 8));
      } catch {
        setFeedItems([]);
      } finally {
        setLoadingFeed(false);
      }
    };

    loadFeed();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleProtectedNavigation = (path, state = {}) => {
    if (isLoggedIn) {
      navigate(path, { state });
    } else if (window.openAuthModal) {
      window.openAuthModal();
    }
  };

  const handleFeedAction = (item) => {
    if (item.type === "social" || item.postId) {
      handleProtectedNavigation("/social", {
        scrollToPostId: item.postId || item.id,
      });
    } else if (item.type === "offer") {
      handleProtectedNavigation("/details", { type: "offer", data: item.data });
    } else {
      handleProtectedNavigation("/details", { type: item.type, data: item.data });
    }
  };

  // ============= السيرش الديناميكي =============
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const query = searchQuery.toLowerCase().trim();
      const results = [];

      // 1️⃣ البحث في الأماكن (Places)
      const filteredPlaces = places.filter(place => 
        place.name.toLowerCase().includes(query) ||
        place.location?.toLowerCase().includes(query) ||
        place.category?.toLowerCase().includes(query) ||
        place.tags?.some(tag => tag.toLowerCase().includes(query))
      );

      filteredPlaces.forEach(place => {
        results.push({
          id: place.id,
          title: place.name,
          subtitle: `📍 ${place.location}`,
          type: 'place',
          icon: '🏪',
          data: place,
          action: () => handleProtectedNavigation(`/place/${place.id}`)
        });
      });

      // 2️⃣ البحث في الـ Feed (Posts, Reports, Offers)
      const feedResults = feedItems.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );

      feedResults.forEach(item => {
        let type = item.type || 'post';
        let icon = '📝';
        let path = '/details';
        let state = { type: item.type, data: item.data || item };

        if (item.type === 'hazard') {
          icon = '⚠️';
        } else if (item.type === 'offer') {
          icon = '🎁';
          path = '/details';
          state = { type: 'offer', data: item.data || item };
        } else if (item.type === 'social' || item.postId) {
          icon = '💬';
          path = '/social';
          state = { scrollToPostId: item.postId || item.id };
        }

        const exists = results.some(r => r.id === item.id && r.type === type);
        if (!exists) {
          results.push({
            id: item.id,
            title: item.title,
            subtitle: item.description?.substring(0, 60) + (item.description?.length > 60 ? '...' : ''),
            type: type,
            icon: icon,
            data: item,
            action: () => handleFeedAction(item)
          });
        }
      });

      // 3️⃣ البحث في التقارير (Reports) - إضافي
      try {
        const reportsRes = await getReportsAPI({ limit: 20 }).catch(() => ({ reports: [] }));
        const reports = reportsRes.reports || [];
        const filteredReports = reports.filter(r =>
          r.issueType?.toLowerCase().includes(query) ||
          r.note?.toLowerCase().includes(query) ||
          r.location?.toLowerCase().includes(query)
        );

        filteredReports.forEach(report => {
          const exists = results.some(r => r.id === report._id && r.type === 'report');
          if (!exists) {
            results.push({
              id: report._id,
              title: `⚠️ ${report.issueType || 'Report'}`,
              subtitle: report.note?.substring(0, 60) || report.location || 'No details',
              type: 'report',
              icon: '⚠️',
              data: report,
              action: () => handleProtectedNavigation('/details', { type: 'hazard', data: report })
            });
          }
        });
      } catch (error) {
        console.error('Error fetching reports for search:', error);
      }

      // 4️⃣ البحث في العروض (Offers) - إضافي
      try {
        const offersRes = await getOffersAPI({ isActive: true, limit: 20 }).catch(() => ({ offers: [] }));
        const offers = offersRes.offers || [];
        const filteredOffers = offers.filter(o =>
          o.title?.toLowerCase().includes(query) ||
          o.description?.toLowerCase().includes(query)
        );

        filteredOffers.forEach(offer => {
          const exists = results.some(r => r.id === offer._id && r.type === 'offer');
          if (!exists) {
            results.push({
              id: offer._id,
              title: `🎁 ${offer.title}`,
              subtitle: offer.description?.substring(0, 60) || offer.discount || 'Special offer',
              type: 'offer',
              icon: '🎁',
              data: offer,
              action: () => handleProtectedNavigation('/details', { type: 'offer', data: offer })
            });
          }
        });
      } catch (error) {
        console.error('Error fetching offers for search:', error);
      }

      setSearchResults(results);

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // إغلاق نتائج البحث عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const topRatedPlaces = getTopRatedPlaces(3);

  return (
    <div
      className={`font-sans min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0a0f1a]" : "bg-[#f8fafd]"
      }`}
    >
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={false} />

      <div
        style={{
          backgroundImage: isDarkMode
            ? `linear-gradient(rgba(10,15,26,0.85), rgba(10,15,26,0.85)), url(${mapImage})`
            : `linear-gradient(rgba(240,248,255,0.95), rgba(240,248,255,0.95)), url(${mapImage})`,
        }}
        className="bg-cover p-5 rounded-b-[30px] text-center md:rounded-b-[40px] md:px-10 lg:px-20 transition-all duration-300"
      >
        <h1
          className={`mt-10 text-[32px] font-bold md:text-5xl lg:text-6xl md:mt-12 transition-colors duration-300 ${
            isDarkMode ? "text-white" : "text-[#1a3650]"
          }`}
        >
          Navigate Smarter,
          <br /> together
        </h1>

        <p
          className={`mt-2 md:text-xl transition-colors duration-300 ${
            isDarkMode ? "text-white/70" : "text-[#4a5568]"
          }`}
        >
          Real-time updates from your community
        </p>

        {/* ⭐ Search Bar - ديناميكي مع أيقونة مضبوطة */}
        <div className="mt-5 md:mt-8 relative max-w-md mx-auto w-[90%]">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setShowResults(false);
                  setSearchResults([]);
                }
              }}
              onFocus={() => {
                if (searchQuery.trim() && searchResults.length > 0) {
                  setShowResults(true);
                }
              }}
              placeholder="Search for a place, offer, category..."
              className={`w-full p-3 rounded-[30px] border transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 md:p-4 md:text-lg ${
                isDarkMode
                  ? "bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 focus:ring-white/30"
                  : "bg-white border-none text-[#1a3650] placeholder:text-[#a0aec0] focus:ring-[#4299e1]/30"
              }`}
            />
            {/* ⭐ أيقونة البحث - مضبوطة داخل الـ input */}
            <button
              type="submit"
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                isDarkMode ? "text-white/50 hover:text-white/80" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* ⭐ نتائج البحث */}
          {showResults && searchQuery.trim() && (
            <div
              className={`absolute left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto ${
                isDarkMode
                  ? "bg-[#1a2b3c]/95 backdrop-blur-xl border border-white/10"
                  : "bg-white/95 backdrop-blur-xl border border-gray-200"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {isSearching ? (
                <div className="p-6 text-center">
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto border-[#2B86ED]"></div>
                  <p className={`text-sm mt-2 ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                    Searching...
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center">
                  <p className={`text-sm ${isDarkMode ? "text-white/60" : "text-gray-500"}`}>
                    No results found for "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div>
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.id}-${index}`}
                      onClick={() => {
                        result.action();
                        setShowResults(false);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b last:border-none ${
                        isDarkMode
                          ? "hover:bg-white/10 border-white/5"
                          : "hover:bg-gray-50 border-gray-100"
                      }`}
                    >
                      <span className="text-2xl">{result.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {result.title}
                        </p>
                        <p className={`text-xs truncate ${isDarkMode ? "text-white/50" : "text-gray-500"}`}>
                          {result.subtitle}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode
                          ? "bg-white/10 text-white/60"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {result.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="mt-5 bg-[#3182ce] text-white py-3 px-[30px] rounded-[30px] font-semibold cursor-pointer hover:bg-[#2c5282] transition-all duration-300 shadow-[0_4px_10px_rgba(49,130,206,0.3)] md:py-4 md:px-12 md:text-lg md:mt-8"
          onClick={() => handleProtectedNavigation("/map")}
        >
          Open Map
        </button>
      </div>

      <div className="p-5 md:max-w-4xl md:mx-auto md:p-8">
        <div className="flex justify-between items-center mb-2">
          <h2
            className={`text-xl md:text-2xl font-semibold transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-[#1a3650]"
            }`}
          >
            Live Updates
          </h2>
          <button
            onClick={() => handleProtectedNavigation("/social")}
            className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
              isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-[#3182ce]"
            }`}
            aria-label="Go to Social Feed"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>

        {loadingFeed && (
          <p className={`mt-4 text-sm ${isDarkMode ? "text-white/50" : "text-gray-500"}`}>
            Loading live updates…
          </p>
        )}

        {!loadingFeed && feedItems.length === 0 && (
          <p className={`mt-4 text-sm ${isDarkMode ? "text-white/50" : "text-gray-500"}`}>
            No updates yet. Sign in and share a post or report a hazard.
          </p>
        )}

        {feedItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl p-4 flex justify-between items-center mt-4 shadow-md transition-all duration-300 md:p-6 md:rounded-2xl md:mt-6 ${
              isDarkMode
                ? "bg-white/10 backdrop-blur-md border border-white/10"
                : "bg-white"
            }`}
          >
            <div className="w-[60%] md:w-[70%]">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={`text-[15px] font-semibold md:text-lg transition-colors duration-300 ${
                    isDarkMode ? "text-white" : "text-[#1a3650]"
                  }`}
                >
                  {item.title}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${item.badgeColor} ${
                    item.type === "hazard" ? "animate-pulse" : ""
                  }`}
                >
                  {item.badge}
                </span>
              </div>

              <p
                className={`text-[13px] mt-1 md:text-base transition-colors duration-300 ${
                  isDarkMode ? "text-white/60" : "text-[#718096]"
                }`}
              >
                {item.description}
              </p>

              <button
                onClick={() => handleFeedAction(item)}
                className={`mt-2 rounded-full py-2 px-4 cursor-pointer text-sm font-medium transition-colors duration-300 md:text-base md:py-2.5 md:px-6 ${
                  isDarkMode
                    ? "bg-[#3182ce] text-white hover:bg-[#2c5282]"
                    : "bg-[#3182ce] text-white hover:bg-[#2c5282]"
                }`}
              >
                {item.button}
              </button>
            </div>

            {item.image && (
              <img
                src={item.image}
                alt=""
                className="w-[100px] h-[80px] rounded-xl object-cover md:w-[140px] md:h-[110px]"
              />
            )}
          </div>
        ))}

        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-xl md:text-2xl font-semibold transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-[#1a3650]"
              }`}
            >
              ⭐ Top Rated Places
            </h2>
            <button
              onClick={() => handleProtectedNavigation("/places")}
              className={`text-sm font-medium transition-all duration-300 hover:underline ${
                isDarkMode ? "text-[#2B86ED]" : "text-[#2B86ED]"
              }`}
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRatedPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => handleProtectedNavigation(`/place/${place.id}`)}
                className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isDarkMode
                    ? "bg-white/10 backdrop-blur-md border border-white/10"
                    : "bg-white shadow-md"
                }`}
              >
                <img src={place.image} alt={place.name} className="w-full h-36 object-cover" />
                <div className="p-3">
                  <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {place.avgRating} ({place.totalReviews} reviews)
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    📍 {place.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AIButton onNavigate={handleProtectedNavigation} />
    </div>
  );
}