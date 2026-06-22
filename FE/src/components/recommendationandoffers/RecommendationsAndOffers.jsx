// src/components/recommendationandoffers/RecommendationsAndOffers.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { useTheme } from '../../context/ThemeContext'
import { useAppContext } from '../../store/AppContext'
import { getOffersAPI } from '../../services/restaurantAPI'

// استيراد الصورة
import mysteryImage from '../../assets/image2.png'

/* ─── Live countdown hook ─── */
function useCountdown(initSeconds) {
  const [rem, setRem] = useState(initSeconds)
  useEffect(() => {
    if (rem <= 0) return
    const id = setInterval(() => setRem(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [rem])
  const pad = n => String(n).padStart(2, '0')
  return [
    pad(Math.floor(rem / 86400)),
    pad(Math.floor((rem % 86400) / 3600)),
    pad(Math.floor((rem % 3600) / 60)),
    pad(rem % 60),
  ]
}

/* ─── Star ─── */
function Star({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
      <path
        d="M6 1L7.545 4.09L11 4.545L8.5 6.98L9.09 10.42L6 8.82L2.91 10.42L3.5 6.98L1 4.545L4.455 4.09L6 1Z"
        fill={filled ? '#F5A623' : '#ddd'}
        stroke={filled ? '#F5A623' : '#ddd'}
        strokeWidth="0.5"
      />
    </svg>
  )
}

/* ─── Mystery Box card ─── */
function MysteryBoxCard({ onNavigate, isDarkMode }) {
  const [days, hours, minutes, seconds] = useCountdown(8 * 3600 + 21 * 60 + 47)

  const timeUnits = [
    { val: days, label: 'Days', boxBg: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)' },
    { val: hours, label: 'Hours', boxBg: isDarkMode ? 'rgba(255,255,255,0.1)' : '#C8CDF0' },
    { val: minutes, label: 'Mins', boxBg: isDarkMode ? 'rgba(255,255,255,0.08)' : '#C1C7E9' },
    { val: seconds, label: 'Secs', boxBg: isDarkMode ? 'rgba(255,255,255,0.06)' : '#C4CAED' },
  ]

  return (
    <div
      className="relative w-full rounded-[24px] overflow-hidden transition-all duration-300"
      style={{ minHeight: '240px' }}
      aria-label="Mystery Box Offer"
    >
      <img 
        src={mysteryImage} 
        alt="Mystery Box" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)'
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[240px] p-6 text-center">
        <h2
          className="text-white font-bold leading-snug tracking-tight text-xl md:text-2xl lg:text-3xl max-w-[280px] mx-auto"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Mystery Box : Unlock a Surprise Deal !
        </h2>

        <p className="mt-1 text-[13px] text-white/80" style={{ fontFamily: 'Poppins, sans-serif' }}>
          offer ends in :
        </p>

        <div className="flex gap-2 flex-wrap justify-center mt-2">
          {timeUnits.map(({ val, label, boxBg }) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className="flex items-center justify-center rounded-[9px] h-[46px] w-[60px] sm:w-[65px] transition-all duration-300"
                style={{ background: boxBg, backdropFilter: isDarkMode ? 'blur(5px)' : 'none' }}
              >
                <span
                  className="text-[18px] font-semibold transition-colors duration-300"
                  style={{ color: isDarkMode ? '#fff' : '#0C355E', fontFamily: 'Poppins, sans-serif' }}
                >
                  {val}
                </span>
              </div>
              <span
                className="mt-[2px] text-[10px] text-white/70"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onNavigate}
          className="mt-5 w-full max-w-[260px] mx-auto h-[46px] rounded-full flex items-center justify-center font-bold text-white text-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer backdrop-blur-md"
          style={{ 
            background: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: isDarkMode ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.1)',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.5)'
          }}
          aria-label="Unlock Now"
        >
          Unlock Now
        </button>
      </div>
    </div>
  )
}

/* ─── Restaurant card ─── */
function RestaurantCard({ 
  title, 
  rating, 
  ratingStars, 
  distance, 
  statusColor, 
  statusText, 
  offerText, 
  imageUrl, 
  isDarkMode,
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className="relative w-full rounded-[24px] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
      style={{ 
        boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.08)', 
        background: isDarkMode ? 'transparent' : '#fff'
      }}
      aria-label={title}
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-[180px] md:h-[200px] object-cover"
      />

      <div
        className="px-5 pt-3 pb-4 transition-all duration-300"
        style={{ 
          background: isDarkMode 
            ? 'rgba(255,255,255,0.06)' 
            : 'rgba(255,255,255,0.75)',
          backdropFilter: isDarkMode ? 'blur(12px)' : 'none',
          borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : 'none'
        }}
      >
        <h3
          className="text-[16px] font-bold leading-snug transition-colors duration-300"
          style={{ color: isDarkMode ? '#fff' : '#1A4168', fontFamily: 'Poppins, sans-serif' }}
        >
          {title}
        </h3>

        <div className="flex items-center gap-1 mt-1 flex-wrap">
          <div className="flex gap-[2px]">
            {[1,2,3,4,5].map(i => <Star key={i} filled={i <= Math.round(ratingStars)} />)}
          </div>
          <span className="text-[12px] transition-colors duration-300" style={{ color: isDarkMode ? '#ccc' : '#1A4168', fontFamily: 'Poppins, sans-serif' }}>
            {rating}
          </span>
          <span className="text-[12px] opacity-60 transition-colors duration-300" style={{ color: isDarkMode ? '#aaa' : '#1A4168', fontFamily: 'Poppins, sans-serif' }}>
            🌍 {distance}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <span
            className="text-[12px] font-medium flex items-center gap-1"
            style={{ color: statusColor, fontFamily: 'Poppins, sans-serif' }}
          >
            <span className="text-[14px] leading-none">●</span>
            {statusText}
          </span>
          <span
            className="px-3 py-[2px] rounded-full text-[12px] text-white transition-all duration-300"
            style={{ 
              background: isDarkMode ? 'rgba(90,143,201,0.7)' : '#5A8FC9', 
              fontFamily: 'Poppins, sans-serif',
              backdropFilter: isDarkMode ? 'blur(5px)' : 'none',
            }}
          >
            {offerText}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function RecommendationsAndOffers() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const { posts } = useAppContext()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // State للعروض الحقيقية من الـ API
  const [apiOffers, setApiOffers] = useState([])
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    setIsLoggedIn(localStorage.getItem("loggedIn") === "true")
    fetchOffers()
  }, [])

  // جلب العروض من الـ API
  const fetchOffers = async () => {
    setLoading(true)
    try {
      const result = await getOffersAPI({ isActive: true, sort: 'newest' })
      if (result.offers) {
        setApiOffers(result.offers)
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const handleProtectedNavigation = (path, state = {}) => {
    if (isLoggedIn) {
      navigate(path, { state })
    } else {
      if (window.openAuthModal) {
        window.openAuthModal()
      }
    }
  }

  // دالة للتعامل مع الضغط على Plus Button - تودي لـ NewPostPage مع تحديد نوع Offer
  const handleCreateOffer = () => {
    navigate('/social/new-post', { state: { defaultPostType: 'offer' } })
  }

  // عروض من البوستات (المستخدمين)
  const offerPostsFromFeed = posts
    .filter(post => post.type === 'offer')
    .map(post => ({
      id: post.id,
      title: post.name,
      rating: "4.8",
      ratingStars: 4.8,
      distance: "Just now",
      statusColor: "#46B400",
      statusText: "Active",
      offerText: post.offerDiscount || "Special Offer",
      imageUrl: post.postImage || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=200&fit=crop",
      description: post.body,
      author: post.author,
      originalPost: post,
      isFromAPI: false,
      restaurantId: null // ⭐ إضافة restaurantId فارغ
    }))

  // تحويل العروض من الـ API لصيغة الـ RestaurantCard
  const apiOffersFormatted = apiOffers.map(offer => ({
    id: offer._id,
    title: offer.title,
    rating: "4.5",
    ratingStars: 4.5,
    distance: offer.restaurantId?.location || "Near you",
    statusColor: "#46B400",
    statusText: "Active",
    offerText: offer.discount,
    imageUrl: offer.image?.secure_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=200&fit=crop",
    description: offer.description,
    restaurantName: offer.restaurantId?.name || "Restaurant",
    code: offer.code,
    validUntil: offer.validUntil,
    restaurantId: offer.restaurantId?._id || offer.restaurantId, // ⭐ تأكدي من الـ ID
    isFromAPI: true
  }))

  // دمج العروض من البوستات ومن الـ API
  const allOffers = [...offerPostsFromFeed, ...apiOffersFormatted]

  // دالة للتعامل مع الضغط على عرض
  const handleOfferClick = (offer) => {
    console.log('🔄 handleOfferClick - offer:', offer);
    console.log('🔄 restaurantId:', offer.restaurantId);
    console.log('🔄 isFromAPI:', offer.isFromAPI);
    
    if (offer.isFromAPI) {
      // عرض من الـ API (من صاحب مطعم)
      handleProtectedNavigation('/details', {
        type: 'offer',
        data: {
          title: offer.title,
          type: 'offer',
          offer: offer.offerText,
          description: offer.description,
          location: offer.restaurantName || 'Restaurant',
          image: offer.imageUrl,
          validUntil: offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'Limited time',
          code: offer.code,
          isRestaurantOffer: true,
          restaurantId: offer.restaurantId // ⭐ هذا مهم عشان نجيب الإحداثيات
        }
      })
    } else if (offer.originalPost) {
      // عرض من مستخدم
      handleProtectedNavigation('/details', {
        type: 'offer',
        data: {
          title: offer.title,
          type: 'offer',
          offer: offer.offerText,
          description: offer.description || `Check out this great offer from ${offer.author}! ${offer.offerText}`,
          location: offer.distance,
          image: offer.imageUrl,
          validUntil: offer.originalPost?.offerValidUntil || 'Limited time',
          code: `COMMUNITY${offer.id}`,
          isCommunityOffer: true,
          author: offer.author
        }
      })
    } else {
      // عرض من المطاعم الثابتة (mock data - كاحتياطي)
      handleProtectedNavigation('/details', {
        type: 'offer',
        data: {
          title: offer.title,
          type: 'offer',
          offer: offer.offerText,
          description: `Check out ${offer.title}! ${offer.offerText}. ${offer.statusText === 'Open' ? 'Open now!' : 'Currently busy.'}`,
          location: offer.distance,
          image: offer.imageUrl,
          validUntil: 'Dec 31, 2025',
          code: `${offer.title.replace(/\s+/g, '').toUpperCase()}2025`
        }
      })
    }
  }

  // إذا كان في حالة تحميل
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B86ED] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-white' : 'text-gray-600'}>Loading offers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`font-sans min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'
    }`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <div className="pt-12 pb-4 text-center">
        <h1 className={`text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wide transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#1a3650]'
        }`}>
          Recommendations & Offers
        </h1>
        <p className={`text-sm mt-2 transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Discover amazing deals near you
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <MysteryBoxCard 
            onNavigate={() => handleProtectedNavigation('/mystery-offer')} 
            isDarkMode={isDarkMode}
          />
        </div>

        {/* عرض جميع العروض (من المستخدمين والمطاعم ومن الـ API) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allOffers.map((offer, index) => (
            <RestaurantCard
              key={offer.id || index}
              title={offer.title}
              rating={offer.rating}
              ratingStars={offer.ratingStars}
              distance={offer.distance}
              statusColor={offer.statusColor}
              statusText={offer.statusText}
              offerText={offer.offerText}
              imageUrl={offer.imageUrl}
              isDarkMode={isDarkMode}
              onClick={() => handleOfferClick(offer)}
            />
          ))}
        </div>

        {/* رسالة لو مفيش عروض */}
        {allOffers.length === 0 && (
          <div className={`text-center py-12 rounded-2xl transition-all duration-300 ${
            isDarkMode ? 'bg-white/5' : 'bg-white'
          }`}>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No offers available right now. Be the first to share one! 🏷️
            </p>
            <button
              onClick={handleCreateOffer}
              className={`mt-4 px-6 py-2 rounded-full text-sm font-medium transition ${
                isDarkMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Share an Offer
            </button>
          </div>
        )}

        <div className="mt-10 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => handleProtectedNavigation('/offers/my-offers')}
            className={`px-10 py-3 rounded-[21px] font-bold text-[16px] shadow-md transition-all duration-300 hover:opacity-90 hover:scale-[1.02] w-full max-w-[320px] ${
              isDarkMode ? 'bg-[#1a6edb] text-white' : 'bg-[#2B86ED] text-white'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
            aria-label="My offers"
          >
            My Offers
          </button>
        </div>
      </div>

      {/* Plus Button - يودي لـ NewPostPage مع تحديد نوع Offer */}
      <button
        onClick={handleCreateOffer}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-105 flex items-center justify-center z-50"
        aria-label="Create new offer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}