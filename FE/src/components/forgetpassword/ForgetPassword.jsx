// src/components/forgotpassword/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { forgetPasswordAPI } from "../../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) =>
    value && value.includes("@") && value.endsWith(".com");

  const handleSendLink = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const result = await forgetPasswordAPI(email);
      
      if (result.msg) {
        setSuccess("✅ OTP sent to your email. Please check your inbox.");
        setTimeout(() => {
          navigate("/reset");
        }, 2000);
      } else {
        setError(result.message || "Email not found. Please sign up first.");
      }
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
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
          Enter your email address and we'll send you an OTP to reset your password
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

        {/* Success box */}
        {success && (
          <div className={`mt-2.5 p-2.5 rounded-lg text-sm ${
            isDarkMode 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-[#e5f8e5] text-[#1b5e20]'
          }`}>
            {success}
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
          className="h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold border-none cursor-pointer mt-2.5 transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={handleSendLink}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
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