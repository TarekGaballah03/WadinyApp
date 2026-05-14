// src/services/api.js
const API_BASE_URL = 'http://localhost:3000'; // شيل /api/v1

// دالة مساعدة للـ headers
const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  const prefix = localStorage.getItem('token_prefix');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': token && prefix ? `${prefix} ${token}` : '',
  };
};

// دالة للتعامل مع الـ response
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.msg || 'Something went wrong');
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

// Google Login API - للمستخدمين الموجودين بالفعل
export const googleLoginAPI = async (code) => {
  const response = await fetch(`${API_BASE_URL}/users/loginWithGmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  
  const data = await handleResponse(response);
  
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('token_prefix', data.prefix);
    localStorage.setItem('userRole', data.role || 'user');
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('currentUserEmail', data.email || '');
  }
  
  return data;
};

// Google Signup API - للمستخدمين الجدد
export const googleSignupAPI = async (code) => {
  const response = await fetch(`${API_BASE_URL}/users/signupWithGmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  
  const data = await handleResponse(response);
  
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('token_prefix', data.prefix);
    localStorage.setItem('userRole', data.role || 'user');
    localStorage.setItem('loggedIn', 'true');
  }
  
  return data;
};

// للتوافق مع الكود القديم (إذا كان يستخدم loginWithGoogleAPI)
export const loginWithGoogleAPI = async (idTokenOrCode) => {
  // التحقق إذا كان idToken (قديم) أم code (جديد)
  if (typeof idTokenOrCode === 'string') {
    // إذا كان idToken يبدو مثل token (طويل جداً) نستخدم loginWithGmail بالطريقة القديمة
    if (idTokenOrCode.length > 100 && idTokenOrCode.includes('.')) {
      const response = await fetch(`${API_BASE_URL}/users/loginWithGmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: idTokenOrCode }),
      });
      const data = await handleResponse(response);
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_prefix', data.prefix);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userRole', data.role || 'user');
      }
      return data;
    }
  }
  // افتراضياً نستخدم googleLoginAPI
  return googleLoginAPI(idTokenOrCode);
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

// ==================== User APIs (محمية) ====================
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

// ==================== Logout API ====================
export const logoutAPI = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_prefix');
  localStorage.removeItem('userRole');
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('currentUserEmail');
};