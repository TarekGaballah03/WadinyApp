import React, { useState, useEffect, useRef } from 'react'; // ✅ أضف useRef
import { useNavigate } from 'react-router-dom';
import { usePlaces } from './PlacesContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from '../sidebar/Sidebar';
import Navbar from '../navbar/Navbar';
import AIButton from '../AIButton/AIButton';

const Star = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.176 0l-3.388 2.462c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.046 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.285-3.374z" />
  </svg>
);

export default function PlacesPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { places, loading, getUserRatingForPlace, refreshPlaces } = usePlaces();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const hasFetched = useRef(false); // ✅ منع الجلب المتكرر

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // ✅ جلب المطاعم مرة واحدة فقط
  useEffect(() => {
    if (!hasFetched.current && refreshPlaces) {
      hasFetched.current = true;
      refreshPlaces();
    }
  }, [refreshPlaces]);

  const categories = ['all', 'cafe', 'restaurant', 'fastfood', 'bakery', 'juicebar'];

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlaceClick = (placeId) => {
    navigate(`/place/${placeId}`);
  };

  // حالة التحميل
  if (loading && places.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B86ED] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-white' : 'text-gray-600'}>Loading places...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-[#f8fafd]'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <div className="pt-8 pb-2 text-center">
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-wide ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
          Places
        </h1>
        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Discover and review places around you
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-24">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for a place..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-5 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] transition-all ${
              isDarkMode
                ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50'
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#2B86ED] text-white'
                  : isDarkMode
                    ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* عرض عدد المطاعم الموجودة */}
        <div className="mb-4 text-right">
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Showing {filteredPlaces.length} of {places.length} places
          </span>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlaces.map(place => {
            const userRating = getUserRatingForPlace(place.id);
            return (
              <div
                key={place.id}
                onClick={() => handlePlaceClick(place.id)}
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  isDarkMode
                    ? 'bg-white/10 backdrop-blur-md border border-white/10'
                    : 'bg-white shadow-sm'
                }`}
              >
                <img 
                  src={place.image} 
                  alt={place.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                        {place.avgRating}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    📍 {place.location}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} filled={star <= Math.round(place.avgRating)} />
                      ))}
                    </div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ({place.totalReviews} reviews)
                    </span>
                  </div>

                  {userRating > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        You rated: 
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} filled={star <= userRating} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredPlaces.length === 0 && !loading && (
          <div className={`text-center py-16 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No places found</p>
          </div>
        )}
      </div>

      <AIButton />
    </div>
  );
}