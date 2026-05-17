// src/components/resetpassword/ResetPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { resetPasswordAPI } from "../../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const isResetDisabled =
    !email || !code || !password || !confirmPassword || !hasLength || !hasNumber || !hasSpecial || !passwordsMatch || loading;

  const handleReset = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !code || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (!hasLength || !hasNumber || !hasSpecial) {
      setError("Password does not meet all requirements.");
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const result = await resetPasswordAPI(email, code, password, confirmPassword);
      
      if (result.msg) {
        setSuccess("✅ Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP or email. Please try again.");
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
          Set a New Password
        </h2>

        {/* Description */}
        <p className={`text-center text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/60' : 'text-[#666]'
        }`}>
          Enter the OTP sent to your email and create a new password
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

        {/* Email Input */}
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

        {/* OTP Input */}
        <label className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
        }`}>
          OTP Code
        </label>
        <input
          type="text"
          placeholder="Enter 4-digit OTP"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={4}
          className={`h-12 rounded-[13px] px-3.5 outline-none placeholder:text-gray-400 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#2B86ED]' 
              : 'border-none bg-[#F3F9FF]'
          }`}
        />

        {/* New Password */}
        <label className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
        }`}>
          New Password
        </label>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`h-12 rounded-[13px] px-3.5 outline-none placeholder:text-gray-400 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#2B86ED]' 
              : 'border-none bg-[#F3F9FF]'
          }`}
        />

        {/* Confirm Password */}
        <label className={`text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/80' : 'text-[#0C355E]'
        }`}>
          Confirm New Password
        </label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`h-12 rounded-[13px] px-3.5 outline-none placeholder:text-gray-400 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#2B86ED]' 
              : 'border-none bg-[#F3F9FF]'
          }`}
        />

        {/* Password rules */}
        <div className="mt-2.5 text-xs space-y-1">
          <p className={hasLength ? "text-green-500 line-through" : (isDarkMode ? "text-white/50" : "text-gray-500")}>
            {hasLength ? "✔" : "○"} At least 8 characters
          </p>
          <p className={hasNumber ? "text-green-500 line-through" : (isDarkMode ? "text-white/50" : "text-gray-500")}>
            {hasNumber ? "✔" : "○"} Contains a number
          </p>
          <p className={hasSpecial ? "text-green-500 line-through" : (isDarkMode ? "text-white/50" : "text-gray-500")}>
            {hasSpecial ? "✔" : "○"} Includes a special character (!@#$%^&*)
          </p>
          <p className={passwordsMatch ? "text-green-500 line-through" : (isDarkMode ? "text-white/50" : "text-gray-500")}>
            {passwordsMatch ? "✔" : "○"} Passwords match
          </p>
        </div>

        {/* Reset button */}
        <button
          className="h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold border-none cursor-pointer mt-2.5 transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleReset}
          disabled={isResetDisabled}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;