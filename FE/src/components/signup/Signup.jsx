import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SocialButton from "../socialbutton/SocialButton";
import PasswordRules from "../passwordrules/PasswordRules";
import { useTheme } from "../../context/ThemeContext";

function Signup() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const isSignupDisabled =
    !email ||
    !password ||
    !confirmPassword ||
    !validateEmail(email) ||
    password === email ||
    password !== confirmPassword;

  const handleSignup = () => {
    if (!email || !password || !confirmPassword) {
      alert("❌ Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      alert("❌ Email must contain '@' and end with '.com'");
      return;
    }

    if (password === email) {
      alert("❌ Password cannot be the same as email");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Passwords do not match");
      return;
    }

    const users = getStoredUsers();
    const existing = users.find((u) => u.email === email);
    if (existing) {
      alert("❌ An account with this email already exists. Please log in.");
      navigate("/login");
      return;
    }

    const updatedUsers = [...users, { email, password }];
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUserEmail", email);

    alert("✅ Account created successfully. Welcome!");
    
    navigate("/");
    window.location.reload();
  };

  const handleSocialLogin = (provider) => {
    console.log(`Signing up with ${provider}`);
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

        {/* Title */}
        <h2 className={`text-center text-2xl font-bold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#0C2C55]'
        }`}>
          Create Your Account
        </h2>

        {/* Labels and Inputs */}
        <label className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
        }`}>
          Email
        </label>
        <input
          type="email"
          placeholder="Enter your email"
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

        <label className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
        }`}>
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`h-12 rounded-[13px] px-3.5 outline-none placeholder:text-gray-400 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#2B86ED]' 
              : 'border-none bg-[#F3F9FF]'
          }`}
        />

        <PasswordRules email={email} password={password} isDarkMode={isDarkMode} />

        {/* Sign Up button */}
        <button
          className="h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold border-none cursor-pointer mt-2.5 transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02]"
          onClick={handleSignup}
          disabled={isSignupDisabled}
          style={{ opacity: isSignupDisabled ? 0.6 : 1, cursor: isSignupDisabled ? "not-allowed" : "pointer" }}
        >
          Sign Up
        </button>

        {/* Divider */}
        <div className={`text-center my-2.5 ${
          isDarkMode ? 'text-white/50' : 'text-[#777]'
        }`}>
          or continue with
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
          Already have an account?{" "}
          <Link to="/login" className={`font-medium no-underline hover:underline transition-colors duration-300 ${
            isDarkMode ? 'text-[#2B86ED]' : 'text-[#0C2C55]'
          }`}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;