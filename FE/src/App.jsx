// src/App.jsx
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

// ==================== مكون حماية المسارات (معدل - يظهر المودال كـ overlay) ====================
function ProtectedRoute({ children }) {
  // نقرأ من localStorage مباشرة
  const [showModal, setShowModal] = useState(false);
  
  // دالة للتحقق من المصادقة
  const checkAuth = () => {
    const token = localStorage.getItem("access_token");
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    return !!(token || loggedIn);
  };
  
  const isAuth = checkAuth();
  
  useEffect(() => {
    console.log("🔒 ProtectedRoute - isAuth:", isAuth);
    if (!isAuth) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isAuth]);

  // ⭐ التغيير المهم: نخلي الصفحة تظهر والمودال يظهر فوقها كـ overlay
  if (!isAuth) {
    return (
      <>
        {children}  {/* الصفحة تظهر في الخلفية */}
        <AuthModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
        />
      </>
    );
  }

  return children;
}

// ==================== مكون الـ App الداخلي ====================
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const openAuthModal = useCallback(() => {
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
      <AuthModal 
        isOpen={showModal} 
        onClose={closeAuthModal}
      />
      
      <Routes>
        {/* 1. المسار الأساسي يفتح الـ Splash Screen */}
        <Route path="/" element={<SplashScreen />} />
        
        {/* 2. صفحة الـ Home الرئيسية (عامة - مش محمية) */}
        <Route path="/home" element={<HomePage />} />
        
        {/* 3. المسارات المحمية (Protected Routes) - لازم تسجيل دخول */}
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
        
        {/* Social Feed Routes - محمية */}
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
        
        {/* User Profile Route - محمية */}
        <Route path="/user-profile" element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Offers & Recommendations Routes - محمية */}
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
        
        {/* Mystery Offer Route - محمية */}
        <Route path="/mystery-offer" element={
          <ProtectedRoute>
            <MysteryOfferPage />
          </ProtectedRoute>
        } />
        
        {/* Details Page Route - محمية */}
        <Route path="/details" element={
          <ProtectedRoute>
            <DetailsPage />
          </ProtectedRoute>
        } />
        
        {/* Book Table Page Route - محمية */}
        <Route path="/book-table" element={
          <ProtectedRoute>
            <BookTablePage />
          </ProtectedRoute>
        } />
        
        {/* Profile & Settings Routes - محمية */}
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
        
        {/* Places Routes - محمية */}
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
        
        {/* Auth Routes (غير محمية - عامة) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />

        {/* Redirection for unknown paths - يروح للـ home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

// ==================== مكون الـ App الرئيسي ====================
function App() {
  return (
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
  );
}

export default App;