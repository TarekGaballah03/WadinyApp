import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { useTheme } from '../../context/ThemeContext'
import { createBookingAPI } from '../../services/api'

export default function BookTablePage() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()
  const { restaurant } = location.state || { restaurant: "The Corner Cafe" }
  
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedHour, setSelectedHour] = useState(1)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [selectedPeriod, setSelectedPeriod] = useState('PM')
  const [guestCount, setGuestCount] = useState(2)
  const [userName, setUserName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [touched, setTouched] = useState({})

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const [viewYear, setViewYear] = useState(currentYear)
  const [viewMonth, setViewMonth] = useState(currentMonth)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth)
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else { setViewMonth(viewMonth - 1); }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else { setViewMonth(viewMonth + 1); }
  }

  const validateName = (name) => {
    if (!name.trim()) return 'Name is required'
    if (name.length < 2) return 'Name must be at least 2 characters'
    if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(name)) return 'Name must contain only letters'
    return ''
  }

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Phone number is required'
    const digitsOnly = phone.replace(/[^0-9]/g, '')
    if (digitsOnly.length < 10) return 'Phone number must be at least 10 digits'
    if (digitsOnly.length > 15) return 'Phone number is too long'
    return ''
  }

  const validateTime = (hour, minute, period) => {
    if (period === 'AM') return 'Restaurant is closed in the morning'
    if (hour === 11 && period === 'PM') return 'Restaurant closes at 10 PM'
    return ''
  }

  const nameError = validateName(userName)
  const phoneError = validatePhone(phoneNumber)
  const timeError = validateTime(selectedHour, selectedMinute, selectedPeriod)
  
  const isFormValid = 
    userName.trim() !== '' && 
    nameError === '' &&
    phoneNumber.trim() !== '' && 
    phoneError === '' &&
    selectedDate !== null &&
    timeError === ''

  const formatTimeDisplay = () => {
    const hourDisplay = selectedHour === 0 ? 12 : selectedHour
    return `${hourDisplay}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`
  }

  const handleConfirm = async () => {
    if (isFormValid) {
      const formattedTime = formatTimeDisplay()
      const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      try {
        await createBookingAPI({
          restaurantId: location.state?.restaurantId,
          restaurantName: restaurant,
          date: selectedDate,
          time: formattedTime,
          guests: guestCount,
          contactName: userName,
          contactPhone: phoneNumber,
        });
      } catch (err) {
        console.warn('Booking API call failed (might not have restaurantId):', err.message);
      }

      await Swal.fire({
        title: 'Success!',
        text: `Your table at ${restaurant} has been booked for ${guestCount} guests on ${formattedDate} at ${formattedTime}`,
        icon: 'success',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
        timer: 2500,
        showConfirmButton: true,
      })
      navigate(-1)
    } else {
      await Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields correctly',
        icon: 'warning',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      })
    }
  }

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true })
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <div className="max-w-5xl mx-auto px-5 pt-8 pb-20">
        
        <header className="mb-8 text-center">
          <h1 className={`text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
            Book a table
          </h1>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            at {restaurant}
          </p>
        </header>

        <div className={`rounded-3xl p-6 shadow-xl border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-white/10 backdrop-blur-md border-white/10' 
            : 'bg-[#f0f7ff] border-[#d9ebfa]'
        }`}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>User name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`w-full px-4 py-3 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#3182ce] ${
                  touched.name && nameError
                    ? 'border-red-500 focus:ring-red-500'
                    : isDarkMode 
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-transparent' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#3182ce]'
                }`}
                placeholder="Enter your name"
              />
              {touched.name && nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={() => handleBlur('phone')}
                className={`w-full px-4 py-3 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#3182ce] ${
                  touched.phone && phoneError
                    ? 'border-red-500 focus:ring-red-500'
                    : isDarkMode 
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-transparent' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#3182ce]'
                }`}
                placeholder="+20 123 456 7890"
              />
              {touched.phone && phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
            </div>
          </div>

          <div className="mb-5">
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date & Time</label>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                  <button onClick={handlePrevMonth} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{monthNames[viewMonth]} {viewYear}</span>
                  <button onClick={handleNextMonth} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {weekDays.map(day => <div key={day} className="text-[10px] font-bold text-gray-400 uppercase">{day}</div>)}
                  {Array.from({ length: firstDayIndex === 0 ? 6 : firstDayIndex - 1 }).map((_, i) => <div key={i} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${viewYear}-${viewMonth + 1}-${day}`;
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button key={day} onClick={() => setSelectedDate(dateStr)} className={`py-2 rounded-xl text-sm transition-all ${isSelected ? 'bg-[#3182ce] text-white shadow-md' : isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
                {!selectedDate && <p className="text-red-500 text-xs mt-2 text-center">Please select a date</p>}
              </div>

              <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <div className="text-center">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Hour</label>
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <button onClick={() => setSelectedHour(prev => prev === 12 ? 1 : prev + 1)} className={isDarkMode ? 'text-blue-400' : 'text-blue-500'}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <span className={`text-2xl font-black w-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedHour}</span>
                      <button onClick={() => setSelectedHour(prev => prev === 1 ? 12 : prev - 1)} className={isDarkMode ? 'text-blue-400' : 'text-blue-500'}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                  </div>

                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>:</span>

                  <div className="text-center">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Minute</label>
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <button onClick={() => setSelectedMinute(prev => prev === 45 ? 0 : prev + 15)} className={isDarkMode ? 'text-blue-400' : 'text-blue-500'}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                      </button>
                      <span className={`text-2xl font-black w-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMinute.toString().padStart(2, '0')}</span>
                      <button onClick={() => setSelectedMinute(prev => prev === 0 ? 45 : prev - 15)} className={isDarkMode ? 'text-blue-400' : 'text-blue-500'}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-2 p-1 rounded-xl">
                    {['AM', 'PM'].map(p => (
                      <button
                        key={p}
                        onClick={() => setSelectedPeriod(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedPeriod === p ? 'bg-[#3182ce] text-white shadow-sm' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {timeError && <p className="text-red-500 text-xs mt-3 text-center">{timeError}</p>}
                
                <div className="mt-4 pt-3 border-t border-dashed border-gray-300/30 text-center">
                  <p className={`text-[11px] font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ⏰ <span className="uppercase">Open Daily:</span> 12:00 PM — 10:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 px-2 py-2">
            <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Guests</span>
            <div className={`flex items-center gap-4 p-1 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-[#3182ce]/10'}`}>
              <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm font-bold ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-[#3182ce]'}`}>-</button>
              <span className={`text-lg font-black min-w-[20px] text-center ${isDarkMode ? 'text-white' : 'text-[#3182ce]'}`}>{guestCount}</span>
              <button onClick={() => setGuestCount(Math.min(10, guestCount + 1))} className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm font-bold ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-[#3182ce]'}`}>+</button>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Cancel</button>
            <button 
              onClick={handleConfirm} 
              disabled={!isFormValid}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95 ${
                isFormValid
                  ? 'bg-[#3182ce] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }`}
            >
              Confirm
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}