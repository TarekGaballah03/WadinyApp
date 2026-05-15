import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaces } from './PlacesContext';
import { useTheme } from '../../context/ThemeContext';
import Sidebar from '../sidebar/Sidebar';
import Navbar from '../navbar/Navbar';
import Swal from 'sweetalert2';

const Star = ({ filled }) => (
  <svg className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.176 0l-3.388 2.462c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.046 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.285-3.374z" />
  </svg>
);

const StarRatingInput = ({ rating, onRate }) => (
  <div className="flex gap-2 justify-center">
    {[1, 2, 3, 4, 5].map(star => (
      <button key={star} onClick={() => onRate(star)} className="focus:outline-none transition-transform hover:scale-125">
        <svg className="w-8 h-8" viewBox="0 0 20 20" fill={star <= rating ? '#FBBF24' : 'none'} stroke="#FBBF24" strokeWidth="1">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.176 0l-3.388 2.462c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.046 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.285-3.374z" />
        </svg>
      </button>
    ))}
  </div>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round"/>
    <line x1="10" y1="11" x2="10" y2="17" strokeLinecap="round"/>
    <line x1="14" y1="11" x2="14" y2="17" strokeLinecap="round"/>
  </svg>
);

// دالة للحصول على الـ user ID الحالي
const getCurrentUserId = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload._id || null;
  } catch (e) {
    return null;
  }
};

export default function PlaceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { getPlaceById, addPlaceReview, getUserRatingForPlace, deletePlaceReview } = usePlaces();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // جلب الـ user ID
  useEffect(() => {
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
    console.log('✅ Current User ID:', userId);
  }, []);

  // جلب المكان عند تحميل الصفحة
  useEffect(() => {
    const fetchPlace = async () => {
      setLoading(true);
      try {
        const result = await getPlaceById(id);
        console.log('📍 Place ownerId:', result?.ownerId);
        console.log('👤 Current User ID:', currentUserId);
        setPlace(result);
      } catch (error) {
        console.error('Error fetching place:', error);
        setPlace(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPlace();
    }
  }, [id, getPlaceById, currentUserId]);

  const userRating = place ? getUserRatingForPlace(place.id) : 0;
  const hasUserReviewed = place?.reviews?.some(review => review.userName === 'You');
  const userReview = place?.reviews?.find(review => review.userName === 'You');
  const userReviewId = userReview?.id;
  
  // ✅ التحقق إذا كان المستخدم هو صاحب المطعم
  const isOwner = place?.ownerId && currentUserId && 
    String(place.ownerId) === String(currentUserId);
  const canReview = !hasUserReviewed && !isOwner && !loading;

  // ✅ منع التقييم للمطاعم الوهمية
  const isMockPlace = !place?.isFromAPI;

  console.log('🔍 isOwner:', isOwner);
  console.log('🔍 canReview:', canReview);
  console.log('🔍 isMockPlace:', isMockPlace);
  console.log('🔍 place.ownerId:', place?.ownerId);
  console.log('🔍 currentUserId:', currentUserId);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B86ED] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-white' : 'text-gray-600'}>Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={isDarkMode ? 'text-white' : 'text-[#1a3650]'}>Place not found</p>
          <button
            onClick={() => navigate('/places')}
            className="mt-4 px-6 py-2 rounded-xl bg-[#2B86ED] text-white"
          >
            Back to Places
          </button>
        </div>
      </div>
    );
  }

  // ✅ إذا كان المكان وهمي، منع التقييم
  if (isMockPlace) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <p className={isDarkMode ? 'text-white' : 'text-[#1a3650]'}>Demo Place</p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Reviews are only available for real restaurants
          </p>
          <button
            onClick={() => navigate('/places')}
            className="mt-4 px-6 py-2 rounded-xl bg-[#2B86ED] text-white"
          >
            Back to Places
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      await Swal.fire({
        title: 'Missing Rating',
        text: 'Please select a rating before submitting',
        icon: 'warning',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
      return;
    }

    if (!comment.trim()) {
      await Swal.fire({
        title: 'Missing Comment',
        text: 'Please write a comment before submitting',
        icon: 'warning',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
      });
      return;
    }

    try {
      // ✅ تأكد من صحة الـ ID
      if (!place.id || place.id.length !== 24) {
        throw new Error('Invalid restaurant ID. Please refresh the page.');
      }

      console.log('✅ Submitting review for place ID:', place.id);
      
      await addPlaceReview(place.id, rating, comment);
      
      await Swal.fire({
        title: 'Review Added!',
        text: 'Thank you for your feedback',
        icon: 'success',
        confirmButtonColor: '#2B86ED',
        background: isDarkMode ? '#1a1a2e' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
        timer: 2000,
        showConfirmButton: true,
      });

      setRating(0);
      setComment('');
      setShowReviewModal(false);
      
      const updatedPlace = await getPlaceById(id);
      setPlace(updatedPlace);
    } catch (error) {
      let errorMessage = error.message || 'Failed to add review';
      if (error.message?.includes('duplicate')) {
        errorMessage = 'You have already reviewed this restaurant. You can edit your existing review.';
      }
      await Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#2B86ED',
      });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;
    
    const result = await Swal.fire({
      title: 'Delete Review?',
      text: 'Are you sure you want to delete your review? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: isDarkMode ? '#1a1a2e' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await deletePlaceReview(place.id, reviewId);
        await Swal.fire({
          title: 'Deleted!',
          text: 'Your review has been deleted.',
          icon: 'success',
          confirmButtonColor: '#2B86ED',
          background: isDarkMode ? '#1a1a2e' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          timer: 1500,
          showConfirmButton: true,
        });
        
        const updatedPlace = await getPlaceById(id);
        setPlace(updatedPlace);
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to delete review',
          icon: 'error',
          confirmButtonColor: '#2B86ED',
        });
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-50'}`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} showBackButton={true} />

      <div className="max-w-3xl mx-auto px-4 py-6 pt-20 pb-24">
        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-xl group h-64 md:h-80">
          <img 
            src={place.image} 
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* زر Add Review - يظهر فقط للمستخدمين العاديين (ليس صاحب المطعم) */}
          {canReview && !isMockPlace && (
            <button
              onClick={() => setShowReviewModal(true)}
              className={`absolute top-5 right-5 backdrop-blur-md px-4 py-2.5 rounded-2xl hover:scale-105 transition-all flex items-center gap-2 font-bold ${
                isDarkMode 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'bg-[#2B86ED] text-white shadow-lg'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Add Review</span>
            </button>
          )}
          
          {/* Badge للمالك */}
          {isOwner && (
            <div className="absolute top-5 left-5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg">
                👑 Your Restaurant
              </span>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {place.name}
            </h1>
            <p className="text-white/80 text-sm mt-1">
              📍 {place.location}
            </p>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className={`flex p-1 rounded-2xl mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'details' ? (isDarkMode ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-[#2B86ED] shadow-sm') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}
          >
            Details
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'reviews' ? (isDarkMode ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-[#2B86ED] shadow-sm') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}
          >
            Reviews ({place.reviews?.length || 0})
          </button>
        </div>

        {/* Tab Content 1: Details */}
        {activeTab === 'details' && (
          <div className="animate-fadeIn">
            <div className={`rounded-2xl p-5 mb-5 shadow-md ${isDarkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-white'}`}>
              
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-2xl">★</span>
                    <span className={`text-2xl font-bold ml-1 ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
                      {place.avgRating}
                    </span>
                  </div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({place.totalReviews} reviews)
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} filled={star <= Math.round(place.avgRating)} />
                  ))}
                </div>
              </div>

              <div className="py-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <svg className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Hours</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{place.hours}</p>
                  </div>
                </div>
              </div>

              <div className="py-4 space-y-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <svg className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{place.phone || '+20 123 456 7890'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                {place.tags?.map((tag, idx) => (
                  <span key={idx} className={`px-3 py-1 rounded-full text-xs ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    #{tag}
                  </span>
                ))}
              </div>

              {hasUserReviewed && userRating > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Rating</p>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} filled={star <= userRating} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/map', { state: { location: place.location } })}
                className="w-full py-3.5 rounded-full font-semibold text-base bg-[#3182ce] text-white hover:bg-[#2c5282] transition-all hover:scale-[1.02] active:scale-95"
              >
                View on Map
              </button>
              
              <button
                onClick={() => navigate('/book-table', { state: { restaurant: place.name } })}
                className={`w-full py-3.5 rounded-full font-semibold text-base transition-all hover:scale-[1.02] active:scale-95 ${
                  isDarkMode 
                    ? 'bg-white/15 text-white border border-white/25 hover:bg-white/25' 
                    : 'bg-[#5f8fce] text-white hover:bg-[#4a7bb3]'
                }`}
              >
                Book a table
              </button>
            </div>
          </div>
        )}

        {/* Tab Content 2: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {place.reviews?.length > 0 ? (
              place.reviews.map(review => {
                const isUserReview = review.userId && currentUserId && 
                  String(review.userId) === String(currentUserId);
                
                return (
                  <div key={review.id} className={`p-4 md:p-5 rounded-2xl shadow-sm transition-all duration-300 ${
                    isDarkMode ? 'bg-white/10 backdrop-blur-md border border-white/10' : 'bg-white shadow-md'
                  }`}>
                    <div className="flex gap-3 md:gap-4">
                      <img src={review.userAvatar} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" alt=""/>
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <h4 className={`font-bold text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-[#1a3650]'}`}>
                              {review.userName}
                            </h4>
                            <span className={`text-[10px] md:text-[11px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {review.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(i => <Star key={i} filled={i <= review.rating} />)}
                            </div>
                            {isUserReview && (
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-red-500 hover:text-red-700 transition p-1"
                                title="Delete your review"
                              >
                                <DeleteIcon />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm leading-relaxed mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`text-center py-16 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-md'}`}>
                <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No reviews yet</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Be the first to write a review!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowReviewModal(false)} />
          <div className={`relative w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden ${
            isDarkMode 
              ? 'bg-white/10 border border-white/20 text-white' 
              : 'bg-white text-[#1a3650] shadow-xl'
          }`}>
            <div className="relative z-10">
              <h3 className={`text-2xl font-black mb-2 ${!isDarkMode && 'text-[#1a3650]'}`}>Post a Review</h3>
              <p className={`text-sm opacity-60 mb-8 ${!isDarkMode && 'text-gray-500'}`}>How was your visit to {place.name}?</p>
              
              <div className={`mb-8 flex flex-col items-center p-4 rounded-2xl ${
                isDarkMode ? 'bg-white/5' : 'bg-blue-50'
              }`}>
                <StarRatingInput rating={rating} onRate={setRating} />
                <span className={`text-xs font-bold mt-2 uppercase tracking-widest ${
                  isDarkMode ? 'text-blue-400' : 'text-[#2B86ED]'
                }`}>Tap to rate</span>
              </div>

              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write something honest..."
                className={`w-full p-5 rounded-3xl h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-6 ${
                  isDarkMode 
                    ? 'bg-black/20 border border-white/10 placeholder:text-gray-400 text-white' 
                    : 'bg-gray-50 border-none placeholder:text-gray-400 text-[#1a3650]'
                }`}
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowReviewModal(false)} 
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                    isDarkMode 
                      ? 'bg-white/5 hover:bg-white/10 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitReview} 
                  className="flex-1 py-4 rounded-2xl bg-[#2B86ED] text-white font-bold shadow-xl shadow-blue-500/30 hover:bg-[#1a6edb] transition-all"
                >
                  Post Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}