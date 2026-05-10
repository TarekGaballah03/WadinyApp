import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { useTheme } from '../../context/ThemeContext'
import { useAppContext } from '../../store/AppContext'
import Swal from 'sweetalert2'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { isDarkMode, toggleTheme } = useTheme()
  const { userAvatar, updateUserAvatar } = useAppContext()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    offers: true,
    comments: true,
    likes: true
  })

  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    showActivity: true
  })

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  })

  useEffect(() => {
    const savedName = localStorage.getItem('userName') || 'John Doe'
    const savedEmail = localStorage.getItem('currentUserEmail') || 'user@example.com'
    const savedPhone = localStorage.getItem('userPhone') || '+20 123 456 7890'
    const savedBio = localStorage.getItem('userBio') || 'Travel enthusiast | Coffee lover | Exploring hidden gems'
    
    setUserInfo({
      name: savedName,
      email: savedEmail,
      phone: savedPhone,
      bio: savedBio
    })
    
    const savedAvatar = localStorage.getItem('userAvatar')
    if (savedAvatar) {
      setPreviewImage(savedAvatar)
    }
  }, [])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const toggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  const togglePrivacy = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const avatarResult = reader.result
        setPreviewImage(avatarResult)
        localStorage.setItem('userAvatar', avatarResult)
        updateUserAvatar(avatarResult)
        Swal.fire({
          icon: 'success',
          title: 'Avatar Updated!',
          text: 'Your profile picture has been changed.',
          confirmButtonColor: '#2B86ED',
          background: isDarkMode ? '#1a1a2e' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          timer: 1500,
          showConfirmButton: false
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // ✅ دالة حذف الصورة
  const handleRemoveAvatar = async () => {
    const result = await Swal.fire({
      title: 'Remove profile picture?',
      text: 'Your profile picture will be replaced with your initial letter.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    })

    if (result.isConfirmed) {
      setPreviewImage(null)
      localStorage.removeItem('userAvatar')
      updateUserAvatar(null)
      Swal.fire({
        title: 'Removed!',
        text: 'Your profile picture has been removed.',
        icon: 'success',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }

  const handleInputChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = () => {
    localStorage.setItem('userName', userInfo.name)
    localStorage.setItem('userPhone', userInfo.phone)
    localStorage.setItem('userBio', userInfo.bio)
    setIsEditing(false)
    Swal.fire({
      icon: 'success',
      title: 'Profile Updated!',
      text: 'Your information has been saved.',
      confirmButtonColor: '#2B86ED',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
      timer: 1500,
      showConfirmButton: false
    })
  }

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem('loggedIn', 'false')
        navigate('/login')
      }
    })
  }

  const handleClearData = () => {
    Swal.fire({
      title: 'Delete Account?',
      text: 'This action cannot be undone! All your data will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete my account',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear()
        Swal.fire({
          icon: 'success',
          title: 'Account Deleted!',
          text: 'Your account has been permanently deleted.',
          confirmButtonColor: '#2B86ED',
          background: isDarkMode ? '#1a1a2e' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        }).then(() => {
          navigate('/login')
        })
      }
    })
  }

  // Toggle Button Component
  const ToggleButton = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-[#2B86ED]' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-[#f8fafd]'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <div className="max-w-3xl mx-auto px-4 pb-16 pt-8">
        
        {/* Header */}
        <div className="pt-2 pb-2 text-center">
          <h1 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide ${
            isDarkMode ? 'text-white' : 'text-[#1a3650]'
          }`}>
            Settings
          </h1>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className={`rounded-2xl overflow-hidden shadow-sm border mb-5 ${isDarkMode ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-white border-gray-100'}`}>
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Profile Information
              </h2>
            </div>
          </div>
          
          <div className="px-6 py-5">
            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6 pb-5 border-b border-gray-100 dark:border-white/10">
              <div className="relative">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-20 h-20 rounded-full object-cover border-3 border-[#2B86ED]" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-3xl text-white">{userInfo.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#2B86ED] text-white cursor-pointer hover:bg-[#1a6edb] transition shadow-lg">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userInfo.name}</h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click the camera icon to change your profile picture</p>
              </div>
            </div>

            {/* Form Fields */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={userInfo.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={userInfo.email}
                    disabled  
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                  <textarea 
                    name="bio"
                    value={userInfo.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
                
                {/* ✅ زر حذف الصورة في وضع التعديل */}
                {previewImage && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="w-full py-2 rounded-xl font-medium transition flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Profile Picture
                  </button>
                )}
                
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditing(false)} className={`flex-1 py-2 rounded-xl font-medium transition ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
                  <button onClick={handleSaveProfile} className="flex-1 py-2 rounded-xl font-medium bg-[#2B86ED] text-white hover:bg-[#1a6edb] transition">Save Changes</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Name</span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userInfo.name}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userInfo.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userInfo.phone}</span>
                </div>
                <div className="py-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bio</span>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userInfo.bio}</p>
                </div>
                <button onClick={() => setIsEditing(true)} className="w-full mt-3 py-2 rounded-xl bg-[#2B86ED]/10 text-[#2B86ED] font-medium hover:bg-[#2B86ED]/20 transition">Edit Profile</button>
              </div>
            )}
          </div>
        </div>

        {/* Appearance Section */}
        <div className={`rounded-2xl overflow-hidden shadow-sm border mb-5 ${isDarkMode ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-white border-gray-100'}`}>
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Appearance
              </h2>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Dark Mode
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Switch between light and dark theme
                </p>
              </div>
              <ToggleButton enabled={isDarkMode} onChange={toggleTheme} />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className={`rounded-2xl overflow-hidden shadow-sm border mb-5 ${isDarkMode ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-white border-gray-100'}`}>
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Notifications
              </h2>
            </div>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Push Notifications</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Receive updates about new offers</p>
              </div>
              <ToggleButton enabled={notifications.push} onChange={() => toggleNotification('push')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Notifications</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Get weekly newsletters and updates</p>
              </div>
              <ToggleButton enabled={notifications.email} onChange={() => toggleNotification('email')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Comments & Likes</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Get notified when someone interacts with your content</p>
              </div>
              <ToggleButton enabled={notifications.comments} onChange={() => toggleNotification('comments')} />
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className={`rounded-2xl overflow-hidden shadow-sm border mb-5 ${isDarkMode ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-white border-gray-100'}`}>
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Privacy & Security
              </h2>
            </div>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show Email on Profile</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Allow others to see your email address</p>
              </div>
              <ToggleButton enabled={privacy.showEmail} onChange={() => togglePrivacy('showEmail')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show Phone Number</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Allow others to see your phone number</p>
              </div>
              <ToggleButton enabled={privacy.showPhone} onChange={() => togglePrivacy('showPhone')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show Activity Status</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Let others see when you're active</p>
              </div>
              <ToggleButton enabled={privacy.showActivity} onChange={() => togglePrivacy('showActivity')} />
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className={`rounded-2xl overflow-hidden shadow-sm border mb-5 ${isDarkMode ? 'bg-white/10 backdrop-blur-md border-white/10' : 'bg-white border-gray-100'}`}>
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636L9.172 14.828M5.636 18.364L14.828 9.172M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
              </div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Account
              </h2>
            </div>
          </div>
          <div className="px-6 py-4 space-y-3">
            <button onClick={handleLogout} className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition">
              Logout
            </button>
            {/* ✅ زر Delete Account باللون الأحمر البارز */}
            <button onClick={handleClearData} className="w-full py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition shadow-md">
              Delete Account
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}