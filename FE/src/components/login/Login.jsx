import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SocialButton from "../socialbutton/SocialButton";
import PasswordRules from "../passwordrules/PasswordRules";
import { useTheme } from "../../context/ThemeContext";

function Login() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    const remembered = localStorage.getItem("rememberMe") === "true";
    if (loggedIn === "true" && remembered) {
      navigate("/");
    }
  }, [navigate]);

  const validateEmail = (email) => email.includes("@") && email.endsWith(".com");

  const getStoredUsers = () => {
    try {
      const data = localStorage.getItem("users");
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const isLoginDisabled =
    !email || !password || !validateEmail(email) || password === email;

  const handleLogin = () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Email must contain '@' and end with '.com'.");
      return;
    }
    if (password === email) {
      setError("Password cannot be the same as email.");
      return;
    }

    const users = getStoredUsers();
    const user = users.find((u) => u.email === email);

    if (!user || user.password !== password) {
      setError("Email or password is incorrect.");
      return;
    }

    localStorage.setItem("loggedIn", "true");
    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }
    localStorage.setItem("currentUserEmail", email);
    
    navigate("/");
    window.location.reload();
  };

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUserEmail", "");

    if (provider === "Google") {
      window.open("https://accounts.google.com/signin", "_blank");
    } else if (provider === "Apple") {
      window.open("https://appleid.apple.com/", "_blank");
    }

    navigate("/");
    window.location.reload();
  };

  return (
    <div className={`min-h-screen py-10 px-5 flex flex-col gap-3 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-white'
    }`}>
      <div className="max-w-[375px] mx-auto w-full flex flex-col gap-3">
        {/* Logo */}
      <h1 className={`font-['Aldhabi'] text-[96px] text-center mb-5 transition-colors duration-300 ${
  isDarkMode ? 'text-[#53C1E4]' : 'text-[#2B86ED]'
}`}>
  وَدّيني
</h1>

        {/* Welcome Back */}
        <h2 className={`text-center text-2xl font-bold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#0C2C55]'
        }`}>
          Welcome Back
        </h2>

        {/* Error box */}
        {error && (
          <div className={`mt-2.5 p-2.5 rounded-lg text-sm ${
            isDarkMode 
              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
              : 'bg-[#ffe5e5] text-[#b00020]'
          }`}>
            {error}
          </div>
        )}

        {/* Label */}
        <label className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
        }`}>
          Email or Username
        </label>
        
        {/* Input */}
        <input
          type="text"
          placeholder="Enter your email or username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`h-12 rounded-[13px] px-3.5 outline-none placeholder:text-gray-400 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#2B86ED]' 
              : 'border-none bg-[#F3F9FF]'
          }`}
        />

        <label className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
        }`}>
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`h-12 rounded-[13px] px-3.5 outline-none placeholder:text-gray-400 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#2B86ED]' 
              : 'border-none bg-[#F3F9FF]'
          }`}
        />

        <PasswordRules email={email} password={password} isDarkMode={isDarkMode} />

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

        {/* Login button */}
        <button
          className="h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold border-none cursor-pointer mt-2.5 transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02]"
          onClick={handleLogin}
          disabled={isLoginDisabled}
          style={{ opacity: isLoginDisabled ? 0.6 : 1, cursor: isLoginDisabled ? "not-allowed" : "pointer" }}
        >
          Login
        </button>

        {/* Divider */}
        <div className={`text-center my-2.5 relative ${
          isDarkMode ? 'text-white/50' : 'text-[#777]'
        }`}>
          <span className={`px-2 ${
            isDarkMode ? 'bg-transparent' : 'bg-white'
          }`}>
            or continue with
          </span>
        </div>

        <SocialButton
          provider="Google"
          onLogin={handleSocialLogin}
          icon="https://cdn-icons-png.flaticon.com/512/300/300221.png"
          text="Continue with Google"
          isDarkMode={isDarkMode}
        />
        <SocialButton
          provider="Apple"
          onLogin={handleSocialLogin}
          icon="https://cdn-icons-png.flaticon.com/512/0/747.png"
          text="Continue with Apple"
          isDarkMode={isDarkMode}
        />

        {/* Bottom text */}
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