import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRestaurantsAPI, getRestaurantByIdAPI } from '../../services/restaurantAPI';
import { API_BASE_URL } from '../../config/apiConfig';
const PlacesContext = createContext();
export const usePlaces = () => useContext(PlacesContext);

// دالة مساعدة لحساب المتوسط والعدد من الريفيوز
const calculatePlaceStats = (reviews) => {
  const totalReviews = reviews.length;
  if (totalReviews === 0) return { avgRating: 0, totalReviews: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avgRating = Number((sum / totalReviews).toFixed(1));
  return { avgRating, totalReviews };
};

// دالة مساعدة لاستخراج الـ ownerId كـ string
const extractOwnerId = (ownerId) => {
  if (!ownerId) return null;
  if (typeof ownerId === 'object') {
    return ownerId._id || ownerId.id || null;
  }
  return ownerId;
};

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

export const PlacesProvider = ({ children }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPlaceRatings, setUserPlaceRatings] = useState(() => {
    const saved = localStorage.getItem('userPlaceRatings');
    return saved ? JSON.parse(saved) : [];
  });

  // جلب المطاعم من الـ API عند تحميل الصفحة
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const result = await getRestaurantsAPI();
      
      console.log('✅ Restaurants fetched:', result);
      
      if (result.restaurants && result.restaurants.length > 0) {
        const formattedPlaces = result.restaurants.map(restaurant => ({
          id: restaurant._id,
          name: restaurant.name,
          location: restaurant.location,
          address: restaurant.address,
          image: restaurant.image?.secure_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=200&fit=crop',
          category: restaurant.category,
          hours: restaurant.hours ? `${restaurant.hours.open} - ${restaurant.hours.close}` : '9:00 AM - 11:00 PM',
          priceRange: restaurant.priceRange,
          tags: restaurant.tags || [],
          phone: restaurant.phone,
          avgRating: restaurant.avgRating || 0,
          totalReviews: restaurant.totalReviews || 0,
          reviews: [],
          isFromAPI: true,
          ownerId: extractOwnerId(restaurant.ownerId),
          originalData: restaurant
        }));
        setPlaces(formattedPlaces);
      } else {
        console.log('No restaurants found, using mock data');
        setPlaces(getMockPlaces());
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setPlaces(getMockPlaces());
    } finally {
      setLoading(false);
    }
  };

  // بيانات وهمية كـ fallback في حالة فشل الـ API
  const getMockPlaces = () => {
    return [
      {
        id: 1,
        name: 'The Corner Cafe',
        location: 'Downtown, Main Street 123',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
        category: 'cafe',
        hours: '7:00 AM - 9:00 PM',
        priceRange: '$$',
        tags: ['Coffee', 'Breakfast', 'Cozy', 'Free WiFi'],
        avgRating: 4.5,
        totalReviews: 12,
        reviews: [],
        isFromAPI: false,
        ownerId: null
      },
      {
        id: 2,
        name: 'Woods Cafe',
        location: 'Park Street 45',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        category: 'cafe',
        hours: '8:00 AM - 10:00 PM',
        priceRange: '$$',
        tags: ['Coffee', 'Offers', 'Cozy'],
        avgRating: 4.8,
        totalReviews: 8,
        reviews: [],
        isFromAPI: false,
        ownerId: null
      }
    ];
  };

  // حفظ تقييمات المستخدم في localStorage
  useEffect(() => {
    localStorage.setItem('userPlaceRatings', JSON.stringify(userPlaceRatings));
  }, [userPlaceRatings]);

  // إضافة تقييم لمكان
  const addPlaceReview = async (placeId, rating, comment) => {
    try {
      const token = localStorage.getItem('access_token');
      const prefix = localStorage.getItem('token_prefix');
      
      console.log('📤 Sending review:', { restaurantId: placeId, rating, comment });
      
      const response = await fetch(`${API_BASE_URL}/reviews/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token && prefix ? `${prefix} ${token}` : '',
        },
        body: JSON.stringify({ restaurantId: placeId, rating, comment }),
      });
      
      const data = await response.json();
      console.log('📥 Response:', data);
      
      if (!response.ok) {
        throw new Error(data.msg || data.message || 'Failed to add review');
      }
      
      const currentUserId = getCurrentUserId();
      
      // تحديث المكان في الـ state
      setPlaces(prev => prev.map(place => {
        if (place.id !== placeId) return place;
        
        const userAvatar = localStorage.getItem('userAvatar') || 'https://randomuser.me/api/portraits/lego/1.jpg';
        const userName = localStorage.getItem('userName') || 'You';
        
        const newReview = {
          id: data.review?._id || Date.now(),
          userName: userName,
          userAvatar: userAvatar,
          rating: rating,
          comment: comment,
          date: new Date().toISOString().split('T')[0],
          likes: 0,
          userId: currentUserId
        };
        
        const newReviews = [newReview, ...(place.reviews || [])];
        const { avgRating, totalReviews } = calculatePlaceStats(newReviews);
        
        return {
          ...place,
          reviews: newReviews,
          avgRating: data.restaurantStats?.avgRating || avgRating,
          totalReviews: data.restaurantStats?.totalReviews || totalReviews
        };
      }));

      // حفظ تقييم المستخدم
      setUserPlaceRatings(prev => {
        const filtered = prev.filter(r => r.placeId !== placeId);
        return [...filtered, { placeId, rating, timestamp: Date.now() }];
      });

      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  };

  // حذف تقييم
  const deletePlaceReview = async (placeId, reviewId) => {
    try {
      const token = localStorage.getItem('access_token');
      const prefix = localStorage.getItem('token_prefix');
      
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token && prefix ? `${prefix} ${token}` : '',
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Failed to delete review');
      }
      
      setPlaces(prev => prev.map(place => {
        if (place.id !== placeId) return place;
        
        const updatedReviews = (place.reviews || []).filter(review => review.id !== reviewId);
        const { avgRating, totalReviews } = calculatePlaceStats(updatedReviews);
        
        return {
          ...place,
          reviews: updatedReviews,
          avgRating,
          totalReviews
        };
      }));
      
      setUserPlaceRatings(prev => prev.filter(r => r.placeId !== placeId));
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  // الحصول على تقييم المستخدم لمكان معين
  const getUserRatingForPlace = (placeId) => {
    const userRating = userPlaceRatings.find(r => r.placeId === placeId);
    return userRating ? userRating.rating : 0;
  };

  // الحصول على أعلى الأماكن تقييماً
  const getTopRatedPlaces = (limit = 3) => {
    const placesWithReviews = [...places];
    return placesWithReviews
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);
  };

  // الحصول على مكان بواسطة ID
  const getPlaceById = async (id) => {
    let place = places.find(p => p.id == id);
    const currentUserId = getCurrentUserId();
    
    try {
      // جلب الـ reviews من الـ API
      const reviewsResult = await fetch(`${API_BASE_URL}/reviews/${id}`);
      const reviewsData = await reviewsResult.json();
      
      let reviews = [];
      if (reviewsData.success && reviewsData.reviews) {
        reviews = reviewsData.reviews.map(r => {
          const reviewUserId = r.userId?._id || r.userId?.id;
          const isCurrentUser = currentUserId && reviewUserId && String(reviewUserId) === String(currentUserId);
          
          return {
            id: r._id,
            userName: isCurrentUser ? 'You' : (r.userId?.name || 'Anonymous'),
            userAvatar: r.userId?.image?.secure_url || 'https://randomuser.me/api/portraits/lego/1.jpg',
            rating: r.rating,
            comment: r.comment,
            date: new Date(r.createdAt).toISOString().split('T')[0],
            likes: r.likes?.length || 0,
            userId: reviewUserId
          };
        });
      }
      
      if (place) {
        return {
          ...place,
          reviews: reviews,
          avgRating: reviewsData.avgRating || place.avgRating,
          totalReviews: reviewsData.totalReviews || place.totalReviews
        };
      }
      
      // جلب المطعم من API إذا مش موجود
      const result = await getRestaurantByIdAPI(id);
      if (result.restaurant) {
        const restaurant = result.restaurant;
        
        // استخراج ownerId بشكل صحيح
        const ownerIdValue = extractOwnerId(restaurant.ownerId);
        
        console.log('Restaurant ownerId:', restaurant.ownerId);
        console.log('Extracted ownerId:', ownerIdValue);
        
        place = {
          id: restaurant._id,
          name: restaurant.name,
          location: restaurant.location,
          address: restaurant.address,
          image: restaurant.image?.secure_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=200&fit=crop',
          category: restaurant.category,
          hours: restaurant.hours ? `${restaurant.hours.open} - ${restaurant.hours.close}` : '9:00 AM - 11:00 PM',
          priceRange: restaurant.priceRange,
          tags: restaurant.tags || [],
          phone: restaurant.phone,
          avgRating: reviewsData.avgRating || restaurant.avgRating || 0,
          totalReviews: reviewsData.totalReviews || restaurant.totalReviews || 0,
          reviews: reviews,
          isFromAPI: true,
          ownerId: ownerIdValue,
          originalData: restaurant
        };
        
        setPlaces(prev => {
          const exists = prev.find(p => p.id == id);
          if (!exists) {
            return [...prev, place];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error fetching place by id:', error);
    }
    
    return place || null;
  };

  return (
    <PlacesContext.Provider value={{
      places,
      loading,
      addPlaceReview,
      deletePlaceReview,
      getUserRatingForPlace,
      getTopRatedPlaces,
      getPlaceById,
      refreshPlaces: fetchRestaurants
    }}>
      {children}
    </PlacesContext.Provider>
  );
};