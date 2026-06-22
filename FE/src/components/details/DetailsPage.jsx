// src/components/details/DetailsPage.jsx
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { useTheme } from '../../context/ThemeContext'
import { getRestaurantByIdAPI } from '../../services/restaurantAPI'

/* ─── Redeem Popup Component ─── */
function RedeemPopup({ isOpen, onClose, isDarkMode, offerTitle, offerCode }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-[360px] rounded-[40px] shadow-2xl p-8 flex flex-col items-center animate-in zoom-in duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-[#1a2a4a] to-[#0a1a3a]' 
          : 'bg-white'
      }`}>
        
        <h2 className={`text-2xl font-bold mb-2 mt-4 ${
          isDarkMode ? 'text-white' : 'text-[#1a3650]'
        }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
          Offer Redeemed !
        </h2>

        <p className={`text-center text-sm mb-6 px-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-400'
        }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
          Show this code at the counter to claim your offer
        </p>

        <div className={`w-full rounded-[32px] p-6 flex flex-col items-center ${
          isDarkMode ? 'bg-white/10' : 'bg-[#f4f9ff]'
        }`}>
          <div className={`w-16 h-12 rounded-xl flex items-center justify-center mb-4 ${
            isDarkMode ? 'bg-white/20' : 'bg-[#cfe4ff]'
          }`}>
             <svg className="w-8 h-8 text-[#2B86ED]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 7H4c-1.1 0-2 .9-2 2v1c1.1 0 2 .9 2 2s-.9 2-2 2v1c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-1c-1.1 0-2-.9-2-2s.9-2 2-2V9c0-1.1-.9-2-2-2zm-7 10h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z" />
              </svg>
          </div>
          <p className={`text-[10px] font-medium mb-2 uppercase tracking-tight ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`}>Your Redemption Code</p>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            isDarkMode 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white/80 border-blue-100'
          }`}>
            <span className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-[#1a3650]'
            }`}>{offerCode}</span>
            <button 
              onClick={() => navigator.clipboard.writeText(offerCode)} 
              className={isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-300 hover:text-gray-500'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-12 h-12 bg-[#2B86ED] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#1a76db] transition-transform active:scale-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function DetailsPage() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRedeemPopupOpen, setIsRedeemPopupOpen] = useState(false)
  const location = useLocation()
  const { type, data } = location.state || {}

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const getData = () => {
    if (data) return data
    
    if (type === 'hazard') {
      return {
        title: "Road closure reported on Main street",
        type: 'hazard',
        severity: "High",
        description: "Roadblock on 5th Avenue due to construction. Avoid the area if possible. Traffic is being redirected to side streets.",
        location: "Main Street & 5th Avenue",
        reportedBy: "Local Resident",
        time: "2 hours ago",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
        status: "Active",
        detour: "Use Oak Street or Pine Avenue as alternative routes"
      }
    } else if (type === 'offer') {
      return {
        title: "50% off at Woods Cafe",
        type: 'offer',
        offer: "50% off all drinks",
        description: "Get 50% off on all hot drinks. Limited time offer. Don't miss the chance!",
        location: "Woods Cafe, Park Street 45",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
        validUntil: "Dec 31, 2025",
        code: "WADINY50",
        terms: "Valid for one-time use. Cannot be combined with other offers."
      }
    } else if (type === 'social') {
      return {
        title: "Woods Cafe",
        type: 'social',
        author: "John",
        time: "4 min ago",
        description: "The new turkish coffee is amazing! Must try! Grab a coffee and enjoy the futuristic vibe. #coffee #woodscafe",
        location: "Woods Cafe, Park Street 45",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
        likes: 45,
        comments: 12
      }
    }
    
    return {
      title: "Details",
      type: 'default',
      description: "No details available",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93"
    }
  }

  const item = getData()
  const isHazard = item.type === 'hazard'
  const isOffer = item.type === 'offer'
  const isSocial = item.type === 'social'

  const getPageTitle = () => {
    if (isHazard) return 'Hazard Report'
    if (isOffer) return 'Special Offer'
    if (isSocial) return 'Community Post'
    return 'Details'
  }

  // ⭐⭐ دالة للتعامل مع View on Map (معدلة نهائياً) ⭐⭐
  const handleViewOnMap = async () => {
    
    console.log('🔍 handleViewOnMap - data:', data);
    console.log('🔍 data.restaurantId:', data?.restaurantId);
    console.log('🔍 data.address:', data?.address);
    
    // محاولة استخراج الإحداثيات من مصادر مختلفة
    let lat, lng, id;
    
    // 1️⃣ من الـ data (لو فيه address.coordinates مباشر)
    if (data?.address?.coordinates) {
      lat = data.address.coordinates.lat;
      lng = data.address.coordinates.lng;
      id = data._id || data.id;
      console.log('📍 Found coordinates in data.address:', { lat, lng });
    } 
    // 2️⃣ من الـ item
    else if (item?.coordinates) {
      lat = item.coordinates.lat;
      lng = item.coordinates.lng;
      id = item.id;
      console.log('📍 Found coordinates in item:', { lat, lng });
    }
    // 3️⃣ من الـ offer (عندها restaurantId)
    else if (data?.restaurantId) {
      try {
        console.log('🔄 Fetching restaurant by ID:', data.restaurantId);
        const result = await getRestaurantByIdAPI(data.restaurantId);
        console.log('📦 Restaurant data:', result);
        
        // نجيب الإحداثيات من الـ restaurant
        if (result.restaurant?.address?.coordinates) {
          lat = result.restaurant.address.coordinates.lat;
          lng = result.restaurant.address.coordinates.lng;
          id = data.restaurantId;
          console.log('📍 Found coordinates from restaurant:', { lat, lng });
        } else {
          console.log('❌ No coordinates found in restaurant data');
        }
      } catch (error) {
        console.error('Error fetching restaurant for offer:', error);
      }
    }
    
    // لو لقينا إحداثيات
    if (lat && lng) {
      console.log('✅ Navigating to map with:', { lat, lng, id });
      navigate(`/map?lat=${lat}&lng=${lng}&zoom=16&highlight=${id || ''}`);
    } else {
      console.log('⚠️ No coordinates found, going to map without location');
      // لو مفيش إحداثيات، نروح للـ Map العادي
      navigate('/map');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <RedeemPopup 
        isOpen={isRedeemPopupOpen}
        onClose={() => setIsRedeemPopupOpen(false)}
        isDarkMode={isDarkMode}
        offerTitle={item.offer}
        offerCode={item.code}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 pt-20 pb-24">
        
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-xl">
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-56 md:h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4">
            {isHazard && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse">
                ⚠️ ROAD HAZARD
              </span>
            )}
            {isOffer && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white">
                🎁 SPECIAL OFFER
              </span>
            )}
            {isSocial && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                💬 COMMUNITY POST
              </span>
            )}
          </div>

          {/* More Offers Button - يظهر للعروض فقط (فوق يمين) */}
          {isOffer && (
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => navigate('/offers')}
                className={`backdrop-blur-md text-[10px] uppercase tracking-wider font-bold py-1.5 px-3 rounded-lg border transition-all active:scale-95 shadow-sm ${
                  isDarkMode 
                    ? 'bg-white/20 text-white border-white/30 hover:bg-white/40' 
                    : 'bg-white/80 text-[#3182ce] border-[#3182ce]/30 hover:bg-white hover:border-[#3182ce]'
                }`}
              >
                More Offers
              </button>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {item.title}
            </h1>
            <p className="text-white/80 text-sm mt-1">
              {getPageTitle()}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className={`rounded-2xl p-5 mb-5 shadow-md ${isDarkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-white'}`}>
          
          {/* Hazard Alert Banner */}
          {isHazard && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium text-red-500">Active Hazard - Please avoid this area if possible</span>
            </div>
          )}

          {/* Offer Banner - مع زر Redeem */}
          {isOffer && (
            <div className={`mb-4 p-3 rounded-xl flex items-center justify-between gap-2 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30' 
                : 'bg-orange-500/10 border border-orange-200 hover:bg-orange-500/15'
            }`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  Limited Time Offer - {item.validUntil}
                </span>
              </div>
              <button
                onClick={() => setIsRedeemPopupOpen(true)}
                className={`text-[10px] uppercase tracking-wider font-bold py-1.5 px-3 rounded-lg transition-all duration-300 active:scale-95 shadow-sm ${
                  isDarkMode
                    ? 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105'
                    : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-105'
                }`}
              >
                🎁 Redeem
              </button>
            </div>
          )}

          {/* Hazard Severity */}
          {isHazard && (
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Severity: {item.severity}
                </span>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          )}

          {/* Author Info for Social Post */}
          {isSocial && (
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center text-white font-bold">
                {item.author?.charAt(0)}
              </div>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.author}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.time}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-start gap-3 py-4 border-b border-gray-200 dark:border-gray-700">
            <svg className="w-5 h-5 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.location}</p>
            </div>
          </div>

          {/* Detour for Hazard */}
          {isHazard && item.detour && (
            <div className={`flex items-start gap-3 py-4 border-b border-gray-200 dark:border-gray-700 ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'} -mx-5 px-5 rounded-lg`}>
              <svg className="w-5 h-5 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Detour / Alternative Route</p>
                <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>{item.detour}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="py-4">
            <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</p>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
          </div>

          {/* Social Stats */}
          {isSocial && (
            <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.likes} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.comments} comments</span>
              </div>
            </div>
          )}

          {/* Reported By for Hazard */}
          {isHazard && item.reportedBy && (
            <div className="flex items-center gap-2 pt-4 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Reported by {item.reportedBy} • {item.time}</span>
            </div>
          )}
        </div>

        {/* ⭐ Action Buttons ⭐ */}
        <div className="space-y-3">
          {/* View on Map */}
          <button
            onClick={handleViewOnMap}
            className={`w-full py-3.5 rounded-full font-semibold text-base transition-all hover:scale-[1.02] active:scale-95 ${
              isHazard
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#3182ce] text-white hover:bg-[#2c5282]'
            }`}
          >
            View on Map
          </button>
          
          {/* Book a table - للعروض والمنشورات الاجتماعية */}
          {(isOffer || isSocial) && (
            <button
              onClick={() => navigate('/book-table', { state: { restaurant: item.title } })}
              className={`w-full py-3.5 rounded-full font-semibold text-base transition-all hover:scale-[1.02] active:scale-95 ${
                isDarkMode 
                  ? 'bg-white/15 text-white border border-white/25 hover:bg-white/25' 
                  : 'bg-[#5f8fce] text-white hover:bg-[#4a7bb3]'
              }`}
            >
              Book a table
            </button>
          )}

          {/* Report Issue - للمخاطر فقط */}
          {isHazard && (
            <button
              onClick={() => navigate('/report')}
              className={`w-full py-3.5 rounded-full font-semibold text-base transition-all hover:scale-[1.02] active:scale-95 ${
                isDarkMode 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                  : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              }`}
            >
              Report Similar Issue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}