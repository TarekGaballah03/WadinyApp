// src/components/confirmemail/ConfirmEmail.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';
import { useTheme } from "../../context/ThemeContext";
import { confirmEmailAPI, resendOtpAPI } from "../../services/api";

function ConfirmEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  
  const email = location.state?.email || "";

  const handleConfirm = async () => {
    if (!otp || otp.length !== 4) {
      toast.error("Please enter the 4-digit verification code");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const result = await confirmEmailAPI(email, otp);
      if (result.msg) {
        toast.success("Email verified successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setError(result.message || "Invalid verification code");
        toast.error(result.message || "Invalid verification code");
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("No email found. Please sign up again.");
      return;
    }
    
    setResending(true);
    
    try {
      const result = await resendOtpAPI(email);
      if (result.msg) {
        toast.success("New verification code sent to your email!");
      } else {
        toast.error(result.message || "Failed to resend code");
      }
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(err.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className={`min-h-screen py-10 px-5 flex flex-col gap-3 transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-white'}`}>
        <div className="max-w-[375px] mx-auto w-full text-center">
          <p className={isDarkMode ? 'text-white/60' : 'text-gray-500'}>No email provided. Please sign up first.</p>
          <Link to="/signup" className="text-[#2B86ED] font-medium mt-4 inline-block">Go to Sign Up</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-10 px-5 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-white'}`}>
      <div className="max-w-[375px] mx-auto w-full">
        
        <h1 className={`font-['Aldhabi'] text-[96px] text-center mb-5 transition-colors duration-300 ${isDarkMode ? 'text-[#53C1E4]' : 'text-[#2B86ED]'}`}>
          وَدّيني
        </h1>

        <h2 className={`text-center text-2xl font-bold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-[#0C2C55]'}`}>
          Verify Your Email
        </h2>

        <p className={`text-center text-sm mb-6 transition-colors duration-300 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
          We sent a 4-digit verification code to<br />
          <span className="font-medium">{email}</span>
        </p>

        {error && (
          <div className={`mb-4 p-3 rounded-xl text-sm text-center ${
            isDarkMode 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
              : 'bg-red-50 text-red-500 border border-red-200'
          }`}>
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className={`text-sm font-medium mb-2 block transition-colors duration-300 ${isDarkMode ? 'text-white/70' : 'text-[#0C355E]'}`}>
            Verification Code
          </label>
          <input
            type="text"
            placeholder="Enter 4-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            maxLength={4}
            className={`h-12 w-full rounded-[13px] px-4 outline-none text-center text-2xl font-bold tracking-wider transition-all duration-300 ${
              isDarkMode 
                ? 'bg-white/10 border border-white/20 text-white focus:border-[#2B86ED]' 
                : 'border border-gray-200 bg-[#F3F9FF] focus:border-[#2B86ED] text-[#0C355E]'
            }`}
            autoFocus
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading || otp.length !== 4}
          className="w-full h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold cursor-pointer transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <div className="text-center mt-6">
          <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
            Didn't receive the code?{" "}
            <button 
              onClick={handleResendCode}
              disabled={resending}
              className="text-[#2B86ED] font-medium hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>
          </p>
        </div>

        <p className={`text-center mt-6 text-sm transition-colors duration-300 ${isDarkMode ? 'text-white/60' : 'text-[#787878]'}`}>
          Back to{" "}
          <Link to="/login" className={`font-medium hover:underline ${isDarkMode ? 'text-[#2B86ED]' : 'text-[#0C2C55]'}`}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ConfirmEmail;