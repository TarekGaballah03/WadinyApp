// src/components/signup/Signup.jsx
import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useTheme } from "../../context/ThemeContext";
import { signupAPI, googleSignupAPI } from "../../services/api";
import { FiUser, FiMail, FiPhone, FiLock, FiCheckCircle, FiXCircle } from "react-icons/fi";

function Signup() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [attachment, setAttachment] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const validate = useCallback(() => {
    const newErrors = {};
    if (name && (name.length < 3 || name.length > 30)) newErrors.name = "Name must be 3-30 chars";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) newErrors.email = "Invalid email format";
    const egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
    if (phone && !egyptianPhoneRegex.test(phone.replace(/[\s-]/g, ''))) newErrors.phone = "Invalid Egyptian number";
    if (password && (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*]/.test(password))) newErrors.password = "Password must be 8+ chars with number and symbol";
    if (confirmPassword && confirmPassword !== password) newErrors.confirmPassword = "Passwords don't match";
    setErrors(newErrors);
  }, [name, email, phone, password, confirmPassword]);

  useEffect(() => {
    validate();
  }, [name, email, phone, password, confirmPassword, validate]);

  const getInputClass = (fieldName) => {
    const isInvalid = touched[fieldName] && errors[fieldName];
    const isValid = touched[fieldName] && !errors[fieldName] && (
      fieldName === 'name' ? name : 
      fieldName === 'email' ? email : 
      fieldName === 'phone' ? phone : 
      fieldName === 'password' ? password : 
      confirmPassword
    );
    
    const baseClass = "h-12 w-full rounded-[13px] px-11 outline-none transition-all duration-300 border-2 text-[15px]";
    
    if (isInvalid) {
      return `${baseClass} ${isDarkMode 
        ? 'border-red-400/30 bg-red-400/5 text-red-200' 
        : 'border-red-200 bg-red-50 text-red-800'}`;
    }
    if (isValid) {
      return `${baseClass} ${isDarkMode 
        ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-200' 
        : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`;
    }
    return `${baseClass} ${isDarkMode 
      ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-[#2B86ED]' 
      : 'bg-[#F3F9FF] border-transparent focus:border-[#2B86ED] text-[#0C355E]'}`;
  };

 const handleSignup = async () => {
  setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });
  if (Object.keys(errors).length > 0 || !name || !email || !password) {
    toast.error("Please fix all errors before submitting");
    return;
  }
  setLoading(true);
  setGeneralError("");
  
  toast.loading("Creating your account...", { id: "signup" });
  
  try {
    const result = await signupAPI({ name, email, password, confirmPassword, phone, gender, attachment });
    if (result.msg) {
      toast.success("Account created successfully! Please verify your email", { id: "signup", duration: 4000 });
      // ⭐ روح لصفحة تأكيد الإيميل من غير setTimeout
      navigate("/confirm-email", { state: { email: email } });
    } else {
      toast.error(result.message || "Signup failed", { id: "signup" });
    }
  } catch (err) {
    toast.error(err.message || "Signup failed. Please try again", { id: "signup" });
  } finally {
    setLoading(false);
  }
};
  // Google Signup
  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setGeneralError("");
      toast.loading("Connecting to Google...", { id: "google-signup" });
      
      try {
        const result = await googleSignupAPI(tokenResponse.code);
        if (result.access_token) {
          localStorage.setItem("access_token", result.access_token);
          localStorage.setItem("refresh_token", result.refresh_token);
          localStorage.setItem("token_prefix", result.prefix);
          localStorage.setItem("user_role", result.role);
          localStorage.setItem("loggedIn", "true");
          
          toast.success("Google account created successfully! 🚀", { 
            id: "google-signup",
            duration: 3000,
          });
          
          setTimeout(() => {
            window.location.href = "/home";
          }, 1000);
        } else {
          toast.error(result.msg || "Google signup failed", { id: "google-signup" });
          setLoading(false);
        }
      } catch (err) {
        console.error("Google signup error:", err);
        if (err.message?.includes("already registered") || err.message?.includes("Email already")) {
          toast.error("Email already registered. Please login instead", { id: "google-signup" });
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        } else {
          toast.error(err.message || "Google signup failed", { id: "google-signup" });
        }
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google signup cancelled or failed", { id: "google-signup" });
      setLoading(false);
    },
    flow: 'auth-code',
  });

  return (
    <div className={`min-h-screen py-10 px-5 flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-white'}`}>
      <div className="max-w-[375px] mx-auto w-full flex flex-col gap-3">
        
        <header className="text-center">
          <h1 className={`font-['Aldhabi'] text-[96px] mb-5 ${isDarkMode ? 'text-[#53C1E4]' : 'text-[#2B86ED]'}`}>وَدّيني</h1>
        </header>

        <div className="space-y-3">
          {[
            { id: 'name', label: 'Full Name', icon: <FiUser />, type: 'text', val: name, set: setName, ph: 'Your name' },
            { id: 'email', label: 'Email Address', icon: <FiMail />, type: 'email', val: email, set: setEmail, ph: 'mail@example.com' },
            { id: 'phone', label: 'Phone Number', icon: <FiPhone />, type: 'tel', val: phone, set: setPhone, ph: '01xxxxxxxxx' },
            { id: 'password', label: 'Password', icon: <FiLock />, type: 'password', val: password, set: setPassword, ph: '••••••••' },
            { id: 'confirmPassword', label: 'Confirm Password', icon: <FiLock />, type: 'password', val: confirmPassword, set: setConfirmPassword, ph: '••••••••' },
          ].map((field) => (
            <div key={field.id}>
              <label className={`text-sm mb-1 block ml-1 ${isDarkMode ? 'text-white/80' : 'text-[#0C355E]'}`}>
                {field.label}
              </label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors duration-300 ${touched[field.id] && errors[field.id] ? 'text-red-400' : isDarkMode ? 'text-white/20' : 'text-slate-300'}`}>
                  {field.icon}
                </span>
                <input
                  type={field.type}
                  placeholder={field.ph}
                  value={field.val}
                  onBlur={() => setTouched(p => ({...p, [field.id]: true}))}
                  onChange={(e) => field.set(e.target.value)}
                  className={getInputClass(field.id)}
                />
                {touched[field.id] && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {errors[field.id] ? <FiXCircle className="text-red-400" /> : field.val && <FiCheckCircle className="text-emerald-400" />}
                  </span>
                )}
              </div>
              <div className="h-4 mt-1 ml-1">
                {touched[field.id] && errors[field.id] && (
                  <p className="text-red-400 text-[11px] font-medium">{errors[field.id]}</p>
                )}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className={`text-sm mb-1 block ${isDarkMode ? 'text-white/80' : 'text-[#0C355E]'}`}>Gender</label>
              <select 
                value={gender} 
                onChange={e => setGender(e.target.value)}
                className={`h-12 w-full rounded-[13px] px-3 outline-none border-2 text-sm transition-all appearance-none cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#161d2b] border-white/20 text-white focus:border-[#2B86ED]' 
                    : 'bg-[#F3F9FF] border-transparent focus:border-[#2B86ED] text-[#0C355E]'
                }`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className={`text-sm mb-1 block ${isDarkMode ? 'text-white/80' : 'text-[#0C355E]'}`}>Profile Pic</label>
              <label className={`h-12 w-full rounded-[13px] border-2 border-dashed flex items-center justify-center cursor-pointer text-xs transition-colors ${isDarkMode ? 'border-white/20 hover:border-[#2B86ED] text-white/40' : 'border-slate-200 hover:border-[#2B86ED] text-slate-400'}`}>
                {attachment ? "✓ File Ready" : "📷 Upload Image"}
                <input type="file" className="hidden" onChange={e => setAttachment(e.target.files[0])} accept="image/*" />
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold border-none cursor-pointer mt-4 transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>
          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>OR</span>
          <div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>
        </div>

        <button
          onClick={() => googleSignup()}
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
          {loading ? "Processing..." : "Sign up with Google"}
        </button>

        <p className={`text-center mt-4 text-sm ${isDarkMode ? 'text-white/60' : 'text-[#787878]'}`}>
          Already have an account? <Link to="/login" className={`font-medium no-underline hover:underline ${isDarkMode ? 'text-[#2B86ED]' : 'text-[#0C2C55]'}`}>Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;