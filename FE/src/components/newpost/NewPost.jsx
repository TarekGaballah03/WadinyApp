import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { useTheme } from '../../context/ThemeContext'
import { useAppContext } from '../../store/AppContext'

export default function NewPostPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode } = useTheme()
  const { addNewPost } = useAppContext()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [experience, setExperience] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [postType, setPostType] = useState('social')
  const [offerDiscount, setOfferDiscount] = useState('')
  const [offerValidUntil, setOfferValidUntil] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // استقبال الـ defaultPostType من الـ location state
  useEffect(() => {
    if (location.state?.defaultPostType) {
      setPostType(location.state.defaultPostType)
    }
  }, [location.state])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        await Swal.fire({
          title: 'File Too Large',
          text: 'Please upload an image smaller than 5MB',
          icon: 'warning',
          confirmButtonColor: '#2B86ED',
          background: isDarkMode ? '#1a1a2e' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        Swal.fire({
          title: 'Uploaded!',
          text: 'Image uploaded successfully!',
          icon: 'success',
          confirmButtonColor: '#2B86ED',
          background: isDarkMode ? '#1a1a2e' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          timer: 1500,
          showConfirmButton: false,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePostTypeChange = (type) => {
    if (type === 'hazard') {
      navigate('/report')
    } else {
      setPostType(type)
    }
  }

  const handlePost = async () => {
    if (!title.trim() || !experience.trim()) {
      await Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all fields',
        icon: 'warning',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      })
      return
    }

    if (postType === 'offer' && !offerDiscount.trim()) {
      await Swal.fire({
        title: 'Missing Offer Details',
        text: 'Please enter the discount/offer details',
        icon: 'warning',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      })
      return
    }

    setIsPosting(true)

    const userAvatar = localStorage.getItem('userAvatar') || 'https://randomuser.me/api/portraits/lego/1.jpg'
    const userName = localStorage.getItem('userName') || 'You'

    const newPost = {
      id: Date.now(),
      name: title,
      author: userName,
      time: 'Just now',
      body: experience,
      postImage: imagePreview || null,
      avatarImage: userAvatar,
      counts: { like: 0, dislike: 0, liked: false, disliked: false },
      type: postType,
      gradient: postType === 'hazard' 
        ? 'linear-gradient(135deg,#c0392b,#e67e22 50%,#f39c12)'
        : postType === 'offer'
        ? 'linear-gradient(135deg,#2ecc71,#27ae60 50%,#1e8449)'
        : 'linear-gradient(135deg,#3d6e8a,#6baed6 50%,#c4a25a)',
      reviews: [],
      offerDiscount: postType === 'offer' ? offerDiscount : null,
      offerValidUntil: postType === 'offer' ? offerValidUntil : null,
    }

    addNewPost(newPost)

    await Swal.fire({
      title: 'Success!',
      text: postType === 'offer' ? 'Your offer has been created successfully!' : 'Your post has been created successfully!',
      icon: 'success',
      confirmButtonColor: '#2B86ED',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
      timer: 2000,
      showConfirmButton: true,
    })

    setTitle('')
    setExperience('')
    setImagePreview(null)
    setOfferDiscount('')
    setOfferValidUntil('')
    setPostType('social')
    setIsPosting(false)

    // لو كان Offer، يودي لصفحة الـ Recommendations
    if (postType === 'offer') {
      navigate('/offers')
    } else {
      navigate('/social')
    }
  }

  const triggerFileInput = () => {
    document.getElementById('image-upload').click()
  }

  const removeImage = async () => {
    setImagePreview(null)
    await Swal.fire({
      title: 'Removed',
      text: 'Image has been removed',
      icon: 'info',
      confirmButtonColor: '#2B86ED',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
      timer: 1500,
      showConfirmButton: false,
    })
  }

  return (
    <div className={`font-sans min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-[#f8fafd]'
    }`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <input
        type="file"
        id="image-upload"
        accept="image/*,video/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="pt-8 pb-4 text-center">
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-wide ${
          isDarkMode ? 'text-white' : 'text-[#1a3650]'
        }`}>
          Create New Post
        </h1>
        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Share an update, offer, or report a road hazard
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-20">
        <div className={`rounded-2xl p-6 md:p-8 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-white/10 backdrop-blur-md border border-white/10' 
            : 'bg-white shadow-sm'
        }`}>
          
          {/* Post Type Selection - 3 أزرار جنب بعض مع تكبير العرض */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Post Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handlePostTypeChange('social')}
                className={`py-3 px-2 rounded-xl font-medium transition-all duration-300 text-sm md:text-base whitespace-nowrap ${
                  postType === 'social'
                    ? 'bg-[#2B86ED] text-white shadow-md'
                    : isDarkMode 
                      ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  <span>📝</span>
                  <span className="hidden sm:inline">Community</span>
                  <span className="sm:hidden">Post</span>
                </span>
              </button>
              <button
                onClick={() => handlePostTypeChange('offer')}
                className={`py-3 px-2 rounded-xl font-medium transition-all duration-300 text-sm md:text-base whitespace-nowrap ${
                  postType === 'offer'
                    ? 'bg-green-500 text-white shadow-md'
                    : isDarkMode 
                      ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  <span>🏷️</span>
                  <span className="hidden sm:inline">Offer</span>
                  <span className="sm:hidden">Deal</span>
                </span>
              </button>
              <button
                onClick={() => handlePostTypeChange('hazard')}
                className={`py-3 px-2 rounded-xl font-medium transition-all duration-300 text-sm md:text-base whitespace-nowrap ${
                  postType === 'hazard'
                    ? 'bg-red-500 text-white shadow-md'
                    : isDarkMode 
                      ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  <span>⚠️</span>
                  <span className="hidden sm:inline">Hazard</span>
                  <span className="sm:hidden">Report</span>
                </span>
              </button>
            </div>
          </div>

          {/* Share Photo/Video */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Media (Optional)
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition shadow-lg"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div 
                onClick={triggerFileInput}
                className={`w-full h-48 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-2 border-dashed ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#2B86ED]' 
                    : 'bg-[#F1FAFF] border-[#2B86ED]/30 hover:bg-blue-100 hover:border-[#2B86ED]'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/10' : 'bg-[#2B86ED]/10'
                }`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B86ED" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-[#2B86ED]'}`}>
                  Click to upload photo or video
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  PNG, JPG, MP4 up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* Title/Location Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {postType === 'hazard' 
                ? 'Hazard Location' 
                : postType === 'offer'
                ? 'Business / Place Name'
                : 'Title / Place Name'}
            </label>
            <input 
              type="text"
              placeholder={postType === 'hazard' 
                ? "e.g., Main Street, Highway 101..." 
                : postType === 'offer'
                ? "e.g., Starbucks, Pizza Hut, Local Cafe..."
                : "e.g., Woods Cafe, My Experience..."}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2B86ED] ${
                isDarkMode 
                  ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-transparent' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#2B86ED]'
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Offer Discount Field - يظهر بس لو type offer */}
          {postType === 'offer' && (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                🏷️ Offer / Discount Details
              </label>
              <input 
                type="text"
                placeholder="e.g., 20% off, Buy 1 Get 1 Free, $5 off..."
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-transparent' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500'
                }`}
                value={offerDiscount}
                onChange={(e) => setOfferDiscount(e.target.value)}
              />
            </div>
          )}

          {/* Offer Valid Until - يظهر بس لو type offer */}
          {postType === 'offer' && (
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                📅 Valid Until (Optional)
              </label>
              <input 
                type="date"
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-transparent' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-green-500'
                }`}
                value={offerValidUntil}
                onChange={(e) => setOfferValidUntil(e.target.value)}
              />
            </div>
          )}

          {/* Experience Description */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {postType === 'hazard' 
                ? 'Hazard Description' 
                : postType === 'offer'
                ? 'Offer Description'
                : 'Your Story'}
            </label>
            <textarea 
              placeholder={postType === 'hazard' 
                ? "Describe the hazard (pothole, closure, accident, etc.)..." 
                : postType === 'offer'
                ? "Describe the offer, terms, and how to redeem..."
                : "Share your experience, thoughts, or recommendation..."}
              rows="4"
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2B86ED] resize-none ${
                isDarkMode 
                  ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-transparent' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#2B86ED]'
              }`}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </div>

          {/* Post Button */}
          <button 
            onClick={handlePost}
            disabled={!title.trim() || !experience.trim() || (postType === 'offer' && !offerDiscount.trim()) || isPosting}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 ${
              !title.trim() || !experience.trim() || (postType === 'offer' && !offerDiscount.trim()) || isPosting
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : postType === 'hazard'
                  ? 'bg-red-500 hover:bg-red-600 transform hover:scale-[1.02] active:scale-98 shadow-lg'
                  : postType === 'offer'
                  ? 'bg-green-500 hover:bg-green-600 transform hover:scale-[1.02] active:scale-98 shadow-lg'
                  : 'bg-[#2B86ED] hover:bg-[#1a6edb] transform hover:scale-[1.02] active:scale-98 shadow-lg'
            }`}
          >
            {isPosting 
              ? 'Posting...' 
              : postType === 'offer' 
              ? 'Share Offer' 
              : 'Post Now'}
          </button>
        </div>

        {/* Info Card */}
        <div className={`mt-6 rounded-2xl p-4 transition-all duration-300 ${
          isDarkMode 
            ? 'bg-white/5 backdrop-blur-sm border border-white/10' 
            : 'bg-white shadow-sm'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${
              postType === 'hazard' 
                ? 'bg-red-100' 
                : postType === 'offer'
                ? 'bg-green-100'
                : 'bg-blue-100'
            }`}>
              {postType === 'hazard' 
                ? '⚠️' 
                : postType === 'offer'
                ? '🏷️'
                : '📝'}
            </div>
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {postType === 'hazard' 
                  ? 'Help keep our community safe!' 
                  : postType === 'offer'
                  ? 'Share great deals with the community!'
                  : 'Share your experience with the community!'}
              </p>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {postType === 'hazard'
                  ? 'Report road hazards to alert other drivers'
                  : postType === 'offer'
                  ? 'Post exclusive deals and offers for everyone'
                  : 'Share updates, recommendations, and connect with others'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}