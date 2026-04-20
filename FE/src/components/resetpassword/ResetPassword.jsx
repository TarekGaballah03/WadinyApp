import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

function ResetPassword() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const isResetDisabled =
    !password || !confirmPassword || !hasLength || !hasNumber || !hasSpecial || !passwordsMatch;

  const handleReset = () => {
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (!hasLength || !hasNumber || !hasSpecial) {
      setError("Password does not meet all rules.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setSuccess("Password reset successfully.");
    setTimeout(() => {
      navigate("/success");
    }, 800);
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
          Your new password must be different from previous passwords
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

        {/* Labels and Inputs */}
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
            {hasSpecial ? "✔" : "○"} Includes a special character
          </p>
          <p className={passwordsMatch ? "text-green-500 line-through" : (isDarkMode ? "text-white/50" : "text-gray-500")}>
            {passwordsMatch ? "✔" : "○"} Passwords match
          </p>
        </div>

        {/* Reset button */}
        <button
          className="h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold border-none cursor-pointer mt-2.5 transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02]"
          onClick={handleReset}
          disabled={isResetDisabled}
          style={{ opacity: isResetDisabled ? 0.6 : 1, cursor: isResetDisabled ? "not-allowed" : "pointer" }}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;