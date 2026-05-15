import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./store/AppContext";
import { PlacesProvider } from "./components/places/PlacesContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import AuthModal from "./components/common/AuthModal";
import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
import ConfirmEmail from "./components/confirmemail/ConfirmEmail";

import ForgotPassword from "./components/forgetpassword/ForgetPassword";
import ResetPassword from "./components/resetpassword/ResetPassword";
import Success from "./components/success/Success";
import HomePage from "./components/home/HomePage";
import MapPage from "./components/map/MapPage";
import AIPage from "./components/ai/AIPage";
import ReportPage from "./components/report/ReportPage";
import SocialFeed from "./components/socialfeed/SocialFeed";
import NewPostPage from "./components/newpost/NewPost";
import RecommendationsAndOffers from "./components/recommendationandoffers/RecommendationsAndOffers";
import MyOffers from "./components/myoffers/MyOffers";
import MysteryOfferPage from "./components/mysteryoffer/MysteryOfferPage";
import DetailsPage from "./components/details/DetailsPage";
import BookTablePage from "./components/booktable/BookTablePage";
import SplashScreen from "./components/splash/SplashScreen";
import UserProfilePage from "./components/userprofile/UserProfilePage";

// Profile & Settings Pages
import ProfilePage from "./components/profile/ProfilePage";
import SettingsPage from "./components/settings/SettingsPage";

// Places Pages
import PlacesPage from "./components/places/PlacesPage";
import PlaceDetailsPage from "./components/places/PlaceDetailsPage";

// Restaurant Pages (جديدة)
import MyRestaurantPage from "./components/restaurant/MyRestaurantPage";
import ManageOffersPage from "./components/restaurant/ManageOffersPage";

// ✅ Google OAuth Provider
import { GoogleOAuthProvider } from '@react-oauth/google';

// ✅ ضعي Client ID حقك هنا
const GOOGLE_CLIENT_ID = "1001249800736-t71bsv2que8phgq4av6k94lhfmj06umb.apps.googleusercontent.com";

// ==================== مكون حماية المسارات مع Role ====================
function ProtectedRoute({ children, requiredRole }) {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRole, setHasRole] = useState(true);
  
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      const loggedIn = localStorage.getItem("loggedIn") === "true";
      const userRole = localStorage.getItem("userRole");
      const isValid = !!(token && loggedIn);
      
      setIsAuth(isValid);
      
      // التحقق من الـ role المطلوب
      if (requiredRole && isValid) {
        if (requiredRole === 'restaurant' && userRole !== 'restaurant' && userRole !== 'admin') {
          setHasRole(false);
        } else if (requiredRole === 'admin' && userRole !== 'admin') {
          setHasRole(false);
        } else {
          setHasRole(true);
        }
      }
      
      setIsLoading(false);
      
      if (!isValid) {
        setTimeout(() => {
          if (window.openAuthModal) {
            window.openAuthModal();
          }
        }, 100);
      }
    };
    
    checkAuth();
    
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [requiredRole]);
  
  if (isLoading) {
    return null;
  }
  
  if (!isAuth) {
    return null;
  }
  
  if (!hasRole) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
}

// ==================== مكون الـ App الداخلي ====================
function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const openAuthModal = useCallback(() => {
    console.log("🔓 Opening auth modal, isAuthenticated:", isAuthenticated);
    if (!isAuthenticated) {
      setShowModal(true);
    }
  }, [isAuthenticated]);

  const closeAuthModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    window.openAuthModal = openAuthModal;
    return () => {
      delete window.openAuthModal;
    };
  }, [openAuthModal]);

  return (
    <>
      {/* AuthModal يظهر كـ Overlay في كل مكان */}
      <AuthModal 
        isOpen={showModal} 
        onClose={closeAuthModal}
      />
      
      <Routes>
        {/* 1. المسار الأساسي يفتح الـ Splash Screen */}
        <Route path="/" element={<SplashScreen />} />
        
        {/* 2. صفحة الـ Home الرئيسية (عامة - مش محمية) */}
        <Route path="/home" element={<HomePage />} />
        
        {/* 3. صفحات المصادقة (غير محمية) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />
        
        {/* 4. المسارات المحمية - تتطلب تسجيل دخول */}
        <Route path="/map" element={
          <ProtectedRoute>
            <MapPage />
          </ProtectedRoute>
        } />
        
        <Route path="/ai" element={
          <ProtectedRoute>
            <AIPage />
          </ProtectedRoute>
        } />
        
        <Route path="/report" element={
          <ProtectedRoute>
            <ReportPage />
          </ProtectedRoute>
        } />
        
        <Route path="/social" element={
          <ProtectedRoute>
            <SocialFeed />
          </ProtectedRoute>
        } />
        
        <Route path="/social/new-post" element={
          <ProtectedRoute>
            <NewPostPage />
          </ProtectedRoute>
        } />
        
        <Route path="/user-profile" element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/offers" element={
          <ProtectedRoute>
            <RecommendationsAndOffers />
          </ProtectedRoute>
        } />
        
        <Route path="/offers/my-offers" element={
          <ProtectedRoute>
            <MyOffers />
          </ProtectedRoute>
        } />
        
        <Route path="/mystery-offer" element={
          <ProtectedRoute>
            <MysteryOfferPage />
          </ProtectedRoute>
        } />
        
        <Route path="/details" element={
          <ProtectedRoute>
            <DetailsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/book-table" element={
          <ProtectedRoute>
            <BookTablePage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/places" element={
          <ProtectedRoute>
            <PlacesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/place/:id" element={
          <ProtectedRoute>
            <PlaceDetailsPage />
          </ProtectedRoute>
        } />

        {/* 5. مسارات Restaurant Owner (محمية بالـ role) */}
        <Route path="/my-restaurant" element={
          <ProtectedRoute requiredRole="restaurant">
            <MyRestaurantPage />
          </ProtectedRoute>
        } />
        
        <Route path="/my-offers/manage" element={
          <ProtectedRoute requiredRole="restaurant">
            <ManageOffersPage />
          </ProtectedRoute>
        } />

        {/* Redirection for unknown paths - يروح للـ home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

// ==================== مكون الـ App الرئيسي ====================
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <PlacesProvider>
            <AppProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </AppProvider>
          </PlacesProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;