// src/components/login/Login.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useTheme } from "../../context/ThemeContext";
import { loginAPI, googleLoginAPI } from "../../services/api";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

function Login() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [emailError, setEmailError] = useState("");

  const validateEmail = useCallback((value) => {
    if (!value) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Invalid email format";
    return "";
  }, []);

  useEffect(() => {
    if (touched.email) {
      setEmailError(validateEmail(email));
    }
  }, [email, touched.email, validateEmail]);

  const isLoginDisabled = !email || !password || emailError || loading;

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    setError("");

    if (!email || !password) {
      toast.error("Please fill in both email and password");
      return;
    }
    if (emailError) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await loginAPI(email, password);
      
      if (result.token) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
        
        localStorage.setItem("access_token", result.token.access_token);
        localStorage.setItem("refresh_token", result.token.refresh_token);
        localStorage.setItem("token_prefix", result.token.prefix);
        localStorage.setItem("user_role", result.role);
        localStorage.setItem("loggedIn", "true");
        
        toast.success(`Welcome back! 🎉`, {
          duration: 3000,
          icon: '👋',
        });
        
        setTimeout(() => {
          navigate("/home");
          window.location.href = "/home";
        }, 1000);
      } else {
        toast.error(result.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed. Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      toast.loading("Connecting to Google...", { id: "google-login" });
      
      try {
        const result = await googleLoginAPI(tokenResponse.code);
        if (result.access_token) {
          localStorage.setItem("access_token", result.access_token);
          localStorage.setItem("refresh_token", result.refresh_token);
          localStorage.setItem("token_prefix", result.prefix);
          localStorage.setItem("user_role", result.role);
          localStorage.setItem("loggedIn", "true");
          
          toast.success("Google login successful! 🚀", { 
            id: "google-login",
            duration: 3000,
          });
          
          setTimeout(() => {
            window.location.href = "/home";
          }, 1000);
        } else {
          toast.error(result.message || "Google login failed", { id: "google-login" });
          setLoading(false);
        }
      } catch (err) {
        console.error("Google login error:", err);
        if (err.message?.includes("No account found") || err.message?.includes("sign up first")) {
          toast.error("No account found! Please sign up first", { id: "google-login" });
          setTimeout(() => {
            navigate("/signup");
          }, 1500);
        } else {
          toast.error(err.message || "Google login failed", { id: "google-login" });
        }
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login cancelled or failed", { id: "google-login" });
      setLoading(false);
    },
    flow: 'auth-code',
  });

  const getFieldStatus = (field) => {
    const isTouched = touched[field];
    const value = field === "email" ? email : password;
    const error = field === "email" ? emailError : null;
    
    if (!isTouched) return { border: "", message: null };
    if (error) return { border: "error", message: error };
    if (value && !error) return { border: "success", message: null };
    return { border: "", message: null };
  };

  const getInputClass = (field) => {
    const status = getFieldStatus(field);
    const baseClass = "h-12 rounded-[13px] px-3.5 outline-none placeholder:text-gray-400 transition-all duration-300 w-full";
    
    if (status.border === "error") {
      return `${baseClass} ${isDarkMode 
        ? 'border-2 border-red-400/30 bg-red-400/5 text-red-200' 
        : 'border-2 border-red-200 bg-red-50 text-red-800'}`;
    }
    if (status.border === "success") {
      return `${baseClass} ${isDarkMode 
        ? 'border-2 border-emerald-400/30 bg-emerald-400/5 text-emerald-200' 
        : 'border-2 border-emerald-200 bg-emerald-50 text-emerald-800'}`;
    }
    return `${baseClass} ${isDarkMode 
      ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#2B86ED]' 
      : 'border-none bg-[#F3F9FF]'}`;
  };

  return (
    <div className={`min-h-screen py-10 px-5 flex flex-col gap-3 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-white'
    }`}>
      <div className="max-w-[375px] mx-auto w-full flex flex-col gap-3">
        <h1 className={`font-['Aldhabi'] text-[96px] text-center mb-5 transition-colors duration-300 ${
          isDarkMode ? 'text-[#53C1E4]' : 'text-[#2B86ED]'
        }`}>
          وَدّيني
        </h1>

        <h2 className={`text-center text-2xl font-bold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#0C2C55]'
        }`}>
          Welcome Back
        </h2>

        {/* Email Field */}
        <div>
          <label className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
          }`}>
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
              onChange={(e) => setEmail(e.target.value)}
              className={getInputClass("email")}
            />
            {touched.email && email && !emailError && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <FiCheckCircle className="text-emerald-400 text-sm" />
              </span>
            )}
            {touched.email && emailError && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <FiXCircle className="text-red-400 text-sm" />
              </span>
            )}
          </div>
          {touched.email && emailError && (
            <p className="text-red-400 text-xs mt-1">{emailError}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
          }`}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            onChange={(e) => setPassword(e.target.value)}
            className={getInputClass("password")}
          />
        </div>

        <div className="flex justify-between items-center mt-2.5">
          <label className={`flex items-center text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
          }`}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-1.5 accent-[#2B86ED]"
            />
            Remember me
          </label>

          <Link to="/forgot" className={`text-xs no-underline hover:underline transition-colors duration-300 ${
            isDarkMode ? 'text-white/60 hover:text-white' : 'text-[#787878] hover:text-[#0C2C55]'
          }`}>
            Forgot Password?
          </Link>
        </div>

        <button
          className="h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold border-none cursor-pointer mt-2.5 transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={isLoginDisabled}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className={`text-center my-2.5 relative ${
          isDarkMode ? 'text-white/50' : 'text-[#777]'
        }`}>
          <span className={`px-2 ${
            isDarkMode ? 'bg-transparent' : 'bg-white'
          }`}>
            or continue with
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className={`h-12 rounded-[13px] flex items-center justify-center gap-3 font-medium transition-all duration-300 w-full ${
              isDarkMode 
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                : 'bg-gray-100 text-[#0C2C55] hover:bg-gray-200'
            }`}
          >
            <img 
              src="https://cdn-icons-png.flaticon.com/512/300/300221.png" 
              alt="Google" 
              className="w-5 h-5"
            />
            {loading ? "Processing..." : "Continue with Google"}
          </button>
        </div>

        <p className={`text-center mt-5 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/60' : 'text-[#787878]'
        }`}>
          Don't have an account?{" "}
          <Link to="/signup" className={`font-medium no-underline hover:underline transition-colors duration-300 ${
            isDarkMode ? 'text-[#2B86ED]' : 'text-[#0C2C55]'
          }`}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;