// src/services/reviewAPI.js
import { getHeaders, handleResponse } from './api';

const API_BASE_URL = 'http://localhost:3000';

// جلب تقييمات مطعم
export const getReviewsAPI = async (restaurantId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${restaurantId}`);
  return handleResponse(response);
};

// إضافة تقييم
export const addReviewAPI = async (restaurantId, rating, comment) => {
  const response = await fetch(`${API_BASE_URL}/reviews/add`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ restaurantId, rating, comment }),
  });
  return handleResponse(response);
};

// حذف تقييم
export const deleteReviewAPI = async (reviewId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Like/Unlike تقييم
export const likeReviewAPI = async (reviewId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/like`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return handleResponse(response);
};