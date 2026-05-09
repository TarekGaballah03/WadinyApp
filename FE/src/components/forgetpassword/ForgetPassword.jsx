import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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

  const validateEmail = (value) =>
    value && value.includes("@") && value.endsWith(".com");

  const handleSendLink = () => {
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const users = getStoredUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      setError("This email is not registered. Please sign up first.");
      return;
    }

    navigate("/reset");
  };

  return (
    <div className={`min-h-screen py-10 px-5 flex flex-col gap-3 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-white'
    }`}>
      <div className="max-w-[375px] mx-auto w-full flex flex-col gap-3">
        {/* Title */}
        <h2 className={`text-center text-2xl font-bold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#0C2C55]'
        }`}>
          Reset Password
        </h2>

        {/* Description */}
        <p className={`text-center text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/60' : 'text-[#666]'
        }`}>
          No worries. Enter the email associated with your Wadiny account
        </p>

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
          Email Address
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

        {/* Button */}
        <button 
          className="h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold border-none cursor-pointer mt-2.5 transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02]" 
          onClick={handleSendLink}
        >
          Send Reset Link
        </button>

        {/* Back to Login */}
        <p className={`text-center mt-3.5 text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/60' : 'text-[#787878]'
        }`}>
          Back to{" "}
          <span
            className={`font-medium cursor-pointer hover:underline transition-colors duration-300 ${
              isDarkMode ? 'text-[#2B86ED]' : 'text-[#0C2C55]'
            }`}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;