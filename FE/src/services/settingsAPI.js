// src/services/settingsAPI.js
import { getHeaders, handleResponse } from './api';
import { API_BASE_URL } from '../config/apiConfig';

// ==================== Settings APIs ====================

// جلب الإعدادات من السيرفر
export const getSettingsAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/users/settings`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// تحديث إعدادات الإشعارات
export const updateNotificationsAPI = async (notifications) => {
  const response = await fetch(`${API_BASE_URL}/users/settings/notifications`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(notifications),
  });
  return handleResponse(response);
};

// تحديث إعدادات الخصوصية
export const updatePrivacyAPI = async (privacy) => {
  const response = await fetch(`${API_BASE_URL}/users/settings/privacy`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(privacy),
  });
  return handleResponse(response);
};

// ==================== Profile APIs ====================

// جلب بيانات الملف الشخصي من السيرفر
export const getMyProfileAPI = async () => {
  const response = await fetch(`${API_BASE_URL}/users/my-profile`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// تحديث بيانات الملف الشخصي
export const updateProfileAPI = async (userData) => {
  const formData = new FormData();
  if (userData.name) formData.append('name', userData.name);
  if (userData.phone) formData.append('phone', userData.phone);
  if (userData.gender) formData.append('gender', userData.gender);
  if (userData.removeImage === true) formData.append('removeImage', 'true');
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

// تحديث كلمة المرور
export const updatePasswordAPI = async (oldPassword, newPassword, cPassword) => {
  const response = await fetch(`${API_BASE_URL}/users/updatePassword`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ oldPassword, newPassword, cPassword }),
  });
  return handleResponse(response);
};

// حذف الحساب
export const deleteAccountAPI = async (password) => {
  const response = await fetch(`${API_BASE_URL}/users/deleteAccount`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ password }),
  });
  return handleResponse(response);
};