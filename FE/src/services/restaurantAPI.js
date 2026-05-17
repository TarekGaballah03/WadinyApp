// src/services/restaurantAPI.js
import { getHeaders, handleResponse } from './api';

const API_BASE_URL = 'http://localhost:3000';

// ==================== Restaurant APIs ====================

// جلب كل المطاعم
export const getRestaurantsAPI = async (filters = {}) => {
  const { category, search, minRating, sort, page = 1, limit = 10 } = filters;
  const params = new URLSearchParams();
  
  // ✅ فقط أضف الـ parameters اللي ليها قيمة حقيقية
  if (category && category !== 'all' && category !== 'undefined') params.append('category', category);
  if (search && search.trim() && search !== 'undefined') params.append('search', search.trim());
  if (minRating && minRating > 0) params.append('minRating', minRating);
  if (sort && sort !== 'undefined') params.append('sort', sort);
  if (page && page > 0) params.append('page', page);
  if (limit && limit > 0 && limit <= 100) params.append('limit', limit);
  
  const url = `${API_BASE_URL}/restaurants${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('📡 Fetching restaurants from:', url);
  
  const response = await fetch(url);
  return handleResponse(response);
};

// جلب مطعم بواسطة ID
export const getRestaurantByIdAPI = async (id) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/${id}`);
  return handleResponse(response);
};

// جلب مطعمي (لصاحب المطعم)
export const getMyRestaurantAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/restaurants/my-restaurant`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// إنشاء مطعم جديد
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

// تحديث مطعم
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

// حذف مطعم (Soft Delete)
export const deleteRestaurantAPI = async (id) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/delete/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==================== Offer APIs ====================

// جلب كل العروض (للعامة)
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

// جلب عروض مطعمي (لصاحب المطعم)
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

// إضافة عرض جديد
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

// حذف عرض
export const deleteOfferAPI = async (offerId) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/offer/delete/${offerId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// استخدام عرض (للمستخدمين)
export const useOfferAPI = async (code) => {
  const response = await fetch(`${API_BASE_URL}/restaurants/offer/use`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code }),
  });
  return handleResponse(response);
};