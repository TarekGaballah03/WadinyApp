import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { useTheme } from '../../context/ThemeContext'

/* ─── Countdown Timer Hook ─── */
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')
  return {
    hours: pad(timeLeft.hours),
    minutes: pad(timeLeft.minutes),
    seconds: pad(timeLeft.seconds)
  }
}

/* ─── Redeem Popup Component (مع Dark Mode) ─── */
function RedeemPopup({ isOpen, onClose, isDarkMode }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-[360px] rounded-[40px] shadow-2xl p-8 flex flex-col items-center animate-in zoom-in duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-[#1a2a4a] to-[#0a1a3a]' 
          : 'bg-white'
      }`}>
        
        {/* Title */}
        <h2 className={`text-2xl font-bold mb-2 mt-4 ${
          isDarkMode ? 'text-white' : 'text-[#1a3650]'
        }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
          Offer Redeemed !
        </h2>

        {/* Description */}
        <p className={`text-center text-sm mb-6 px-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-400'
        }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
          Show this code at the counter to claim your offer
        </p>

        {/* Inner Box */}
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
            }`}>Wadiny 2025</span>
            <button 
              onClick={() => navigator.clipboard.writeText('Wadiny 2025')} 
              className={isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-300 hover:text-gray-500'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </button>
          </div>
        </div>

        {/* X Button */}
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

/* ─── Mystery Offer Page ─── */
export default function MysteryOfferPage() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRedeemPopupOpen, setIsRedeemPopupOpen] = useState(false)
  const { hours, minutes, seconds } = useCountdown()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const handleBack = () => navigate(-1)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-white'
    }`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} onBack={handleBack} />

      {/* Redeem Popup */}
      <RedeemPopup 
        isOpen={isRedeemPopupOpen} 
        onClose={() => setIsRedeemPopupOpen(false)} 
        isDarkMode={isDarkMode}
      />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-5 py-8">
        
        {/* Surprise Card */}
        <div className={`w-full max-w-md rounded-[32px] overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-[#1a2a4a]/80 to-[#0a1a3a]/80 shadow-2xl' 
            : 'bg-[#E8F4FD] shadow-md'
        }`}>
          
          <div className="flex justify-center pt-10">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center animate-bounce ${
              isDarkMode ? 'bg-white/15' : 'bg-white/60'
            }`}>
              <span className="text-6xl">🎁</span>
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-center text-2xl font-bold mt-5 px-6 ${
            isDarkMode ? 'text-white' : 'text-[#1a3650]'
          }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
            You have Unlocked a Surprise!
          </h1>

          {/* Offer Details */}
          <div className="text-center mt-3 px-6">
            <p className={`text-base font-medium ${
              isDarkMode ? 'text-white/90' : 'text-[#1a3650]/80'
            }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
              20% off all drinks at Daily Grid
            </p>
          </div>

          {/* Countdown Section */}
          <div className="text-center mt-8">
            <div className="flex justify-center items-end gap-3">
              <div className="text-center">
                <div className={`w-[70px] h-[70px] rounded-xl flex items-center justify-center ${
                  isDarkMode ? 'bg-white/15 backdrop-blur-md' : 'bg-white/50'
                }`}>
                  <span className={`text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-[#1a3650]'
                  }`}>{hours}</span>
                </div>
                <p className={`text-[11px] mt-2 ${
                  isDarkMode ? 'text-white/70' : 'text-[#1a3650]/60'
                }`}>Hours</p>
              </div>
              
              <span className={`text-3xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-[#1a3650]'
              }`}>:</span>
              
              <div className="text-center">
                <div className={`w-[70px] h-[70px] rounded-xl flex items-center justify-center ${
                  isDarkMode ? 'bg-white/15 backdrop-blur-md' : 'bg-white/50'
                }`}>
                  <span className={`text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-[#1a3650]'
                  }`}>{minutes}</span>
                </div>
                <p className={`text-[11px] mt-2 ${
                  isDarkMode ? 'text-white/70' : 'text-[#1a3650]/60'
                }`}>Minutes</p>
              </div>
              
              <span className={`text-3xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-[#1a3650]'
              }`}>:</span>
              
              <div className="text-center">
                <div className={`w-[70px] h-[70px] rounded-xl flex items-center justify-center ${
                  isDarkMode ? 'bg-white/15 backdrop-blur-md' : 'bg-white/50'
                }`}>
                  <span className={`text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-[#1a3650]'
                  }`}>{seconds}</span>
                </div>
                <p className={`text-[11px] mt-2 ${
                  isDarkMode ? 'text-white/70' : 'text-[#1a3650]/60'
                }`}>Seconds</p>
              </div>
            </div>
          </div>

          {/* Valid Until */}
          <p className={`text-center text-sm mt-6 ${
            isDarkMode ? 'text-white/80' : 'text-[#1a3650]/70'
          }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
            Valid until Dec 31, 2025
          </p>

          {/* Buttons */}
          <div className="p-6 space-y-3">
            <button
              onClick={() => setIsRedeemPopupOpen(true)}
              className={`w-full py-3.5 rounded-full font-semibold text-base transition-all hover:scale-[1.02] active:scale-95 ${
                isDarkMode 
                  ? 'bg-[#2B86ED] text-white hover:bg-[#1a6edb] shadow-lg' 
                  : 'bg-[#5f8fce] text-white hover:bg-[#4a7bb3]'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Redeem Offer
            </button>
            
            <button
              onClick={() => navigate('/map')}
              className={`w-full py-3.5 rounded-full font-semibold text-base transition-all hover:scale-[1.02] active:scale-95 ${
                isDarkMode 
                  ? 'bg-white/15 text-white border border-white/25 hover:bg-white/25' 
                  : 'bg-[#3182ce] text-white hover:bg-[#2c5282]'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}