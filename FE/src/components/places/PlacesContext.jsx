import React, { createContext, useContext, useState, useEffect } from 'react';

const PlacesContext = createContext();
export const usePlaces = () => useContext(PlacesContext);

// ✅ دالة مساعدة لحساب المتوسط والعدد من الريفيوز
const calculatePlaceStats = (reviews) => {
  const totalReviews = reviews.length;
  if (totalReviews === 0) return { avgRating: 0, totalReviews: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avgRating = Number((sum / totalReviews).toFixed(1));
  return { avgRating, totalReviews };
};

export const PlacesProvider = ({ children }) => {
  // ✅ البيانات الأولية - مع التأكد أن totalReviews و avgRating متطابقين مع الريفيوز
  const [places, setPlaces] = useState([
    {
      id: 1,
      name: 'The Corner Cafe',
      location: 'Downtown, Main Street 123',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
      category: 'cafe',
      hours: '7:00 AM - 9:00 PM',
      priceRange: '$$',
      tags: ['Coffee', 'Breakfast', 'Cozy', 'Free WiFi'],
      reviews: [
        {
          id: 101,
          userName: 'John Doe',
          userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          rating: 5,
          comment: 'Best coffee in town! Amazing atmosphere.',
          date: '2024-01-15',
          likes: 12
        },
        {
          id: 102,
          userName: 'Sarah Smith',
          userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          rating: 4,
          comment: 'Great place, but a bit crowded.',
          date: '2024-01-14',
          likes: 5
        }
      ]
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
      reviews: [
        {
          id: 201,
          userName: 'Mike Brown',
          userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
          rating: 5,
          comment: 'Excellent coffee and service!',
          date: '2024-01-13',
          likes: 8
        }
      ]
    },
    {
      id: 3,
      name: 'Sushi Master',
      location: 'Coast Road 22',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
      category: 'restaurant',
      hours: '12:00 PM - 11:00 PM',
      priceRange: '$$$',
      tags: ['Sushi', 'Japanese', 'Seafood'],
      reviews: []  // ✅ reviews مصفوفة فارغة
    },
    {
      id: 4,
      name: 'Burger House',
      location: 'Fast Food Street 10',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      category: 'restaurant',
      hours: '11:00 AM - 12:00 AM',
      priceRange: '$$',
      tags: ['Burgers', 'Fast Food', 'American'],
      reviews: []  // ✅ reviews مصفوفة فارغة
    },
    {
      id: 5,
      name: 'Pizza Heaven',
      location: 'Italian Avenue 5',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      category: 'restaurant',
      hours: '12:00 PM - 11:00 PM',
      priceRange: '$$',
      tags: ['Pizza', 'Italian', 'Family'],
      reviews: []  // ✅ reviews مصفوفة فارغة
    }
  ]);

  // ✅ إضافة الحقول المحسوبة (avgRating, totalReviews) ديناميكياً
  const getPlacesWithStats = () => {
    return places.map(place => {
      const { avgRating, totalReviews } = calculatePlaceStats(place.reviews);
      return {
        ...place,
        avgRating,
        totalReviews
      };
    });
  };

  const [userPlaceRatings, setUserPlaceRatings] = useState(() => {
    const saved = localStorage.getItem('userPlaceRatings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('userPlaceRatings', JSON.stringify(userPlaceRatings));
  }, [userPlaceRatings]);

  // ✅ إضافة تقييم لمكان
  const addPlaceReview = (placeId, rating, comment) => {
    const place = places.find(p => p.id === placeId);
    if (!place) return;

    const userAvatar = localStorage.getItem('userAvatar') || 'https://randomuser.me/api/portraits/lego/1.jpg';
    const userName = localStorage.getItem('userName') || 'You';

    const newReview = {
      id: Date.now(),
      userName: userName,
      userAvatar: userAvatar,
      rating: rating,
      comment: comment,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    // ✅ تحديث المكان مع الـ reviews الجديدة
    setPlaces(prev => prev.map(p => {
      if (p.id !== placeId) return p;
      
      const newReviews = [newReview, ...p.reviews];
      const { avgRating, totalReviews } = calculatePlaceStats(newReviews);
      
      return {
        ...p,
        reviews: newReviews,
        avgRating,      // ✅ يتم حسابه تلقائياً
        totalReviews    // ✅ يتم حسابه تلقائياً
      };
    }));

    // حفظ تقييم المستخدم
    setUserPlaceRatings(prev => {
      const filtered = prev.filter(r => r.placeId !== placeId);
      return [...filtered, { placeId, rating, timestamp: Date.now() }];
    });
  };

  // ✅ دالة حذف تقييم
  const deletePlaceReview = (placeId, reviewId) => {
    setPlaces(prev => prev.map(place => {
      if (place.id !== placeId) return place;
      
      const updatedReviews = place.reviews.filter(review => review.id !== reviewId);
      const { avgRating, totalReviews } = calculatePlaceStats(updatedReviews);
      
      return {
        ...place,
        reviews: updatedReviews,
        avgRating,      // ✅ يتم إعادة الحساب تلقائياً
        totalReviews    // ✅ يتم إعادة الحساب تلقائياً
      };
    }));
    
    // حذف تقييم المستخدم من userPlaceRatings
    setUserPlaceRatings(prev => prev.filter(r => r.placeId !== placeId));
  };

  // ✅ الحصول على تقييم المستخدم لمكان معين
  const getUserRatingForPlace = (placeId) => {
    const userRating = userPlaceRatings.find(r => r.placeId === placeId);
    return userRating ? userRating.rating : 0;
  };

  // ✅ الحصول على أعلى الأماكن تقييماً
  const getTopRatedPlaces = (limit = 3) => {
    const placesWithStats = getPlacesWithStats();
    return [...placesWithStats]
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, limit);
  };

  // ✅ الحصول على مكان بواسطة ID
  const getPlaceById = (id) => {
    const place = places.find(p => p.id === id);
    if (!place) return null;
    
    const { avgRating, totalReviews } = calculatePlaceStats(place.reviews);
    return {
      ...place,
      avgRating,
      totalReviews
    };
  };

  return (
    <PlacesContext.Provider value={{
      places: getPlacesWithStats(),  // ✅ إرجاع الأماكن مع الإحصائيات المحسوبة
      addPlaceReview,
      deletePlaceReview,
      getUserRatingForPlace,
      getTopRatedPlaces,
      getPlaceById
    }}>
      {children}
    </PlacesContext.Provider>
  );
};