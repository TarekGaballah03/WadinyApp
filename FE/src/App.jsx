import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./store/AppContext";
import { PlacesProvider } from "./components/places/PlacesContext";

// Components
import AuthModal from "./components/common/AuthModal";
import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
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

// Places Pages (جديدة)
import PlacesPage from "./components/places/PlacesPage";
import PlaceDetailsPage from "./components/places/PlaceDetailsPage";

function App() {
  const [showModal, setShowModal] = useState(false);
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  const openAuthModal = useCallback(() => {
    if (!isLoggedIn) {
      setShowModal(true);
    }
  }, [isLoggedIn]);

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
    <ThemeProvider>
      <PlacesProvider>
        <AppProvider>
          <BrowserRouter>
            <AuthModal 
              isOpen={showModal} 
              onClose={closeAuthModal}
            />
            
            <Routes>
              {/* 1. المسار الأساسي يفتح الـ Splash Screen */}
              <Route path="/" element={<SplashScreen />} />
              
              {/* 2. صفحة الـ Home الرئيسية */}
              <Route path="/home" element={<HomePage />} />
              
              {/* 3. مسارات الحماية (Protected Routes) */}
              <Route path="/map" element={!isLoggedIn ? <Navigate to="/home" /> : <MapPage />} />
              <Route path="/ai" element={!isLoggedIn ? <Navigate to="/home" /> : <AIPage />} />
              <Route path="/report" element={!isLoggedIn ? <Navigate to="/home" /> : <ReportPage />} />
              
              {/* Social Feed Routes */}
              <Route path="/social" element={!isLoggedIn ? <Navigate to="/home" /> : <SocialFeed />} />
              <Route path="/social/new-post" element={!isLoggedIn ? <Navigate to="/home" /> : <NewPostPage />} />
              
              {/* User Profile Route */}
              <Route path="/user-profile" element={!isLoggedIn ? <Navigate to="/home" /> : <UserProfilePage />} />

              
              {/* Offers & Recommendations Routes */}
              <Route path="/offers" element={!isLoggedIn ? <Navigate to="/home" /> : <RecommendationsAndOffers />} />
              <Route path="/offers/my-offers" element={!isLoggedIn ? <Navigate to="/home" /> : <MyOffers />} />
              
              {/* Mystery Offer Route */}
              <Route path="/mystery-offer" element={!isLoggedIn ? <Navigate to="/home" /> : <MysteryOfferPage />} />

              {/* Details Page Route */}
              <Route path="/details" element={!isLoggedIn ? <Navigate to="/home" /> : <DetailsPage />} />

              {/* Book Table Page Route */}
              <Route path="/book-table" element={!isLoggedIn ? <Navigate to="/home" /> : <BookTablePage />} />

              {/* Profile & Settings Routes */}
              <Route path="/profile" element={!isLoggedIn ? <Navigate to="/home" /> : <ProfilePage />} />
              <Route path="/settings" element={!isLoggedIn ? <Navigate to="/home" /> : <SettingsPage />} />

              {/* Places Routes (جديدة) */}
              <Route path="/places" element={!isLoggedIn ? <Navigate to="/home" /> : <PlacesPage />} />
              <Route path="/place/:id" element={!isLoggedIn ? <Navigate to="/home" /> : <PlaceDetailsPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route path="/reset" element={<ResetPassword />} />
              <Route path="/success" element={<Success />} />

              {/* Redirection for unknown paths */}
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </PlacesProvider>
    </ThemeProvider>
  );
}

export default App;