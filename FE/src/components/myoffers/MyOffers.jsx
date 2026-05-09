import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { useTheme } from '../../context/ThemeContext'

/* ─── Coupon Card Component ─── */
function CouponCard({ status, title, merchant, expiry, isUsed, isDarkMode }) {
  return (
    <div
      className={`relative w-full rounded-[19px] p-4 flex gap-4 items-center transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
        isDarkMode ? 'bg-white/10 backdrop-blur-sm' : 'bg-[#F3F9FF]'
      }`}
      style={{ minHeight: '114px', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
    >
      {/* Merchant Logo / Image */}
      <div
        className="w-[66px] h-[66px] rounded-full flex items-center justify-center text-2xl shrink-0"
        style={{ 
          background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#D9D9D9', 
          border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.05)' 
        }}
      >
        {merchant === "The Daily Grind" ? "☕" : 
         merchant === "Burger King" ? "🍔" : 
         merchant === "Sushi place" ? "🍣" : 
         merchant === "Moka Cafe" ? "🥤" : "🎁"}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex justify-between items-start">
          <span
            className="text-[15px] font-normal"
            style={{ 
              color: isUsed ? (isDarkMode ? '#888' : '#8F8F8F') : '#5A8D3F', 
              fontFamily: 'Poppins, sans-serif' 
            }}
          >
            {status}
          </span>
        </div>
        
        <h3
          className="text-[15px] font-normal leading-tight mt-1 truncate"
          style={{ 
            color: isUsed ? (isDarkMode ? '#aaa' : '#626262') : (isDarkMode ? '#fff' : '#1A4168'), 
            fontFamily: 'Poppins, sans-serif' 
          }}
        >
          {title}
        </h3>
        
        <p
          className="text-[12px] font-normal mt-1 opacity-70"
          style={{ color: isDarkMode ? '#aaa' : '#A1A1A1', fontFamily: 'Poppins, sans-serif' }}
        >
          {merchant}
        </p>
        
        <p
          className="text-[10px] font-normal mt-1"
          style={{ color: isDarkMode ? '#777' : '#A6A6A6', fontFamily: 'Poppins, sans-serif' }}
        >
          {expiry}
        </p>
      </div>

      {/* Subtle overlay for used items */}
      {isUsed && (
        <div className={`absolute inset-0 rounded-[19px] pointer-events-none ${
          isDarkMode ? 'bg-black/30' : 'bg-white/10'
        }`} />
      )}
    </div>
  )
}

/* ─── Main Page ─── */
export default function MyOffersPage() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Active')

  const tabs = ['Active', 'Used', 'Saved']
  
  const offersData = [
    {
      status: 'Active',
      title: '20% off your Next Coffee',
      merchant: 'The Daily Grind',
      expiry: 'Expires in 3 days',
      tab: 'Active'
    },
    {
      status: 'Active',
      title: 'Buy One Get One Free',
      merchant: 'Burger King',
      expiry: 'Valid until 31/12/2025',
      tab: 'Active'
    },
    {
      status: 'Active',
      title: 'Buy One Get One Free',
      merchant: 'Sushi place',
      expiry: 'Expires in 1 week',
      tab: 'Active'
    },
    {
      status: 'Used',
      title: '15% off all drinks',
      merchant: 'Moka Cafe',
      expiry: 'Used on 5/10/2025',
      tab: 'Used',
      isUsed: true
    }
  ]

  const filteredOffers = offersData.filter(offer => 
    activeTab === 'Active' ? offer.tab === 'Active' : 
    activeTab === 'Used' ? offer.tab === 'Used' : 
    offer.tab === 'Saved'
  )

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-white'
    }`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        
        {/* Page Title */}
        <div className="pt-12 pb-6 text-center">
          <h1 className={`text-2xl md:text-3xl font-extrabold tracking-wide transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-[#1a3650]'
          }`}>
            My Offers
          </h1>
          <p className={`text-sm mt-2 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Track and manage your exclusive deals
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-md mx-auto w-full mt-4">
          <div 
            className="relative w-full h-[42px] rounded-[22px] flex items-center justify-around overflow-hidden p-[4px]"
            style={{ background: isDarkMode ? '#1a3a5a' : '#5C90C9' }}
          >
            {/* Active indicator */}
            <div 
              className="absolute h-[34px] w-[calc(33.33%-6px)] rounded-[42px] transition-all duration-300 ease-in-out"
              style={{ 
                background: isDarkMode ? '#2a5a8a' : '#507CA9',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                transform: `translateX(${tabs.indexOf(activeTab) * 100}%)`,
                left: '4px'
              }}
            />
            
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative z-10 flex-1 text-center text-[14px] font-medium leading-[20px] transition-all duration-200 py-1"
                style={{ color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 pb-10">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer, idx) => (
              <CouponCard key={idx} {...offer} isDarkMode={isDarkMode} />
            ))
          ) : (
            <div className={`col-span-full flex flex-col items-center justify-center py-16 rounded-2xl transition-colors duration-300 ${
              isDarkMode ? 'bg-white/5' : 'bg-gray-50'
            }`}>
              <span className="text-5xl mb-3 opacity-50">🎫</span>
              <p className={`text-base italic transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-400'
              }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                No {activeTab.toLowerCase()} offers yet
              </p>
              <button
                onClick={() => navigate('/offers')}
                className={`mt-4 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-[#2B86ED] text-white hover:bg-[#1a6edb]' 
                    : 'bg-[#2B86ED] text-white hover:bg-[#1a6edb]'
                }`}
              >
                Browse Offers
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}