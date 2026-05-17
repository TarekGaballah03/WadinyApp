// src/services/api.js
const API_BASE_URL = 'http://localhost:3000';

// ==================== Helper Functions ====================

// دالة مساعدة للـ headers
export const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  const prefix = localStorage.getItem('token_prefix');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token && prefix ? `${prefix} ${token}` : '',
  };
};

// دالة للتعامل مع الـ response
export const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data.msg || data.message || 'Something went wrong';
    const error = new Error(errorMessage);
    error.data = data;
    throw error;
  }
  return data;
};

// ==================== Auth APIs ====================
export const signupAPI = async (userData) => {
  const formData = new FormData();
  formData.append('name', userData.name);
  formData.append('email', userData.email);
  formData.append('password', userData.password);
  formData.append('cPassword', userData.confirmPassword);
  formData.append('phone', userData.phone);
  formData.append('gender', userData.gender || 'male');
  if (userData.attachment) {
    formData.append('attachment', userData.attachment);
  }
  
  const response = await fetch(`${API_BASE_URL}/users/signUp`, {
    method: 'POST',
    body: formData,
  });
  
  return handleResponse(response);
};

export const confirmEmailAPI = async (email, code) => {
  const response = await fetch(`${API_BASE_URL}/users/confirmEmail`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp: code }),
  });
  return handleResponse(response);
};

export const loginAPI = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await handleResponse(response);
  
  if (data.token) {
    localStorage.setItem('access_token', data.token.access_token);
    localStorage.setItem('refresh_token', data.token.refresh_token);
    localStorage.setItem('token_prefix', data.token.prefix);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('currentUserEmail', email);
  }
  
  return data;
};

export const googleLoginAPI = async (code) => {
  console.log('🔵 Sending Google Login code:', code);
  
  const response = await fetch(`${API_BASE_URL}/users/loginWithGmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  
  const data = await handleResponse(response);
  console.log('🟢 Google Login Response:', data);
  
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('token_prefix', data.prefix);
    localStorage.setItem('userRole', data.role || 'user');
    localStorage.setItem('loggedIn', 'true');
  }
  
  return data;
};

export const googleSignupAPI = async (code) => {
  console.log('🔵 Sending Google Signup code:', code);
  
  const response = await fetch(`${API_BASE_URL}/users/signupWithGmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  
  const data = await handleResponse(response);
  console.log('🟢 Google Signup Response:', data);
  
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('token_prefix', data.prefix);
    localStorage.setItem('userRole', data.role || 'user');
    localStorage.setItem('loggedIn', 'true');
  }
  
  return data;
};

export const refreshTokenAPI = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const prefix = localStorage.getItem('token_prefix');
  
  const response = await fetch(`${API_BASE_URL}/users/refreshToken`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${prefix} ${refreshToken}`,
    },
  });
  
  const data = await handleResponse(response);
  
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  
  return data;
};

export const forgetPasswordAPI = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/forgetPassword`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const resetPasswordAPI = async (email, code, newPassword, cPassword) => {
  const response = await fetch(`${API_BASE_URL}/users/resetPassword`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword, cPassword }),
  });
  return handleResponse(response);
};

// ==================== User APIs ====================
export const getMyProfileAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/users/my-profile`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateProfileAPI = async (userData) => {
  const formData = new FormData();
  if (userData.name) formData.append('name', userData.name);
  if (userData.phone) formData.append('phone', userData.phone);
  if (userData.gender) formData.append('gender', userData.gender);
  if (userData.removeImage) formData.append('removeImage', userData.removeImage);
  if (userData.attachment) formData.append('attachment', userData.attachment);
  
  const response = await fetch(`${API_BASE_URL}/users/updateProfile`, {
    method: 'PATCH',
    headers: {
      'Authorization': getHeaders().Authorization,
    },
    body: formData,
  });
  return handleResponse(response);
};

export const updatePasswordAPI = async (oldPassword, newPassword, cPassword) => {
  const response = await fetch(`${API_BASE_URL}/users/updatePassword`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ oldPassword, newPassword, cPassword }),
  });
  return handleResponse(response);
};

export const deleteAccountAPI = async (password) => {
  const response = await fetch(`${API_BASE_URL}/users/deleteAccount`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ password }),
  });
  return handleResponse(response);
};

// ==================== Settings APIs ====================
export const getSettingsAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/users/settings`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateNotificationsAPI = async (notifications) => {
  const response = await fetch(`${API_BASE_URL}/users/settings/notifications`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(notifications),
  });
  return handleResponse(response);
};

export const updatePrivacyAPI = async (privacy) => {
  const response = await fetch(`${API_BASE_URL}/users/settings/privacy`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(privacy),
  });
  return handleResponse(response);
};

// ==================== Follow APIs ====================
export const followUserAPI = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/follow/${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const unfollowUserAPI = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/unfollow/${userId}`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getFollowersAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/users/followers`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getFollowingAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/users/following`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const checkFollowingAPI = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/checkFollow/${userId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==================== Offers APIs ====================
export const getUserOffersAPI = async (type = 'all') => {
  const response = await fetch(`${API_BASE_URL}/users/my-offers?type=${type}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==================== Resend OTP API ====================
export const resendOtpAPI = async (email) => {
  const response = await fetch(`${API_BASE_URL}/users/resendOtp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

// ==================== Restaurant APIs ====================
export const getRestaurantsAPI = async (filters = {}) => {
  const { category, search, minRating, sort, page = 1, limit = 10 } = filters;
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  if (minRating) params.append('minRating', minRating);
  if (sort) params.append('sort', sort);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  
  const response = await fetch(`${API_BASE_URL}/restaurants?${params.toString()}`);
  return handleResponse(response);
};

export const getRestaurantByIdAPI = async (id) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/${id}`);
  return handleResponse(response);
};

export const getMyRestaurantAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/restaurants/my-restaurant`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createRestaurantAPI = async (restaurantData) => {
  const formData = new FormData();
  formData.append('name', restaurantData.name);
  formData.append('location', restaurantData.location);
  formData.append('address', JSON.stringify(restaurantData.address));
  formData.append('category', restaurantData.category);
  if (restaurantData.cuisine) formData.append('cuisine', JSON.stringify(restaurantData.cuisine));
  if (restaurantData.hours) formData.append('hours', JSON.stringify(restaurantData.hours));
  formData.append('phone', restaurantData.phone);
  formData.append('priceRange', restaurantData.priceRange || '$$');
  if (restaurantData.tags) formData.append('tags', JSON.stringify(restaurantData.tags));
  if (restaurantData.attachment) formData.append('attachment', restaurantData.attachment);
  
  const response = await fetch(`${API_BASE_URL}/restaurants/create`, {
    method: 'POST',
    headers: {
      'Authorization': getHeaders().Authorization,
    },
    body: formData,
  });
  return handleResponse(response);
};

export const updateRestaurantAPI = async (id, restaurantData) => {
  const formData = new FormData();
  if (restaurantData.name) formData.append('name', restaurantData.name);
  if (restaurantData.location) formData.append('location', restaurantData.location);
  if (restaurantData.address) formData.append('address', JSON.stringify(restaurantData.address));
  if (restaurantData.category) formData.append('category', restaurantData.category);
  if (restaurantData.cuisine) formData.append('cuisine', JSON.stringify(restaurantData.cuisine));
  if (restaurantData.hours) formData.append('hours', JSON.stringify(restaurantData.hours));
  if (restaurantData.phone) formData.append('phone', restaurantData.phone);
  if (restaurantData.priceRange) formData.append('priceRange', restaurantData.priceRange);
  if (restaurantData.tags) formData.append('tags', JSON.stringify(restaurantData.tags));
  if (restaurantData.image) formData.append('image', restaurantData.image);
  
  const response = await fetch(`${API_BASE_URL}/restaurants/update/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': getHeaders().Authorization,
    },
    body: formData,
  });
  return handleResponse(response);
};

export const deleteRestaurantAPI = async (id) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/delete/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==================== Offer APIs ====================
export const getOffersAPI = async (filters = {}) => {
  const { restaurantId, isActive, sort, page = 1, limit = 10 } = filters;
  const params = new URLSearchParams();
  if (restaurantId) params.append('restaurantId', restaurantId);
  if (isActive !== undefined) params.append('isActive', isActive);
  if (sort) params.append('sort', sort);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  
  const response = await fetch(`${API_BASE_URL}/restaurants/offers?${params.toString()}`);
  return handleResponse(response);
};

export const getMyRestaurantOffersAPI = async (filters = {}) => {
  const { isActive, sort, page = 1, limit = 10 } = filters;
  const params = new URLSearchParams();
  if (isActive !== undefined) params.append('isActive', isActive);
  if (sort) params.append('sort', sort);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);
  
  const response = await fetch(`${API_BASE_URL}/restaurants/my-offers?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const addOfferAPI = async (offerData) => {
  const formData = new FormData();
  formData.append('restaurantId', offerData.restaurantId);
  formData.append('title', offerData.title);
  formData.append('description', offerData.description);
  formData.append('discount', offerData.discount);
  formData.append('validUntil', offerData.validUntil);
  if (offerData.maxUses) formData.append('maxUses', offerData.maxUses);
  if (offerData.image) formData.append('image', offerData.image);
  
  const response = await fetch(`${API_BASE_URL}/restaurants/offer/add`, {
    method: 'POST',
    headers: {
      'Authorization': getHeaders().Authorization,
    },
    body: formData,
  });
  return handleResponse(response);
};

export const deleteOfferAPI = async (offerId) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/offer/delete/${offerId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const useOfferAPI = async (code) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/offer/use`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code }),
  });
  return handleResponse(response);
};

// ==================== Review APIs ====================
export const getReviewsAPI = async (restaurantId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${restaurantId}`);
  return handleResponse(response);
};

export const addReviewAPI = async (restaurantId, rating, comment) => {
  const response = await fetch(`${API_BASE_URL}/reviews/add`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ restaurantId, rating, comment }),
  });
  return handleResponse(response);
};

export const deleteReviewAPI = async (reviewId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const likeReviewAPI = async (reviewId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/like`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==================== Logout API ====================
export const logoutAPI = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_prefix');
  localStorage.removeItem('userRole');
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('currentUserEmail');
};