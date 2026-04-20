import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

function Success(){
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return(
    <div className={`min-h-screen py-10 px-5 flex flex-col gap-3 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-white'
    }`}>
      <div className="max-w-[375px] mx-auto w-full flex flex-col gap-3 text-center">
        {/* Check mark */}
        <div className={`text-6xl mb-5 ${
          isDarkMode ? 'text-green-400' : 'text-green-600'
        }`}>
          ✔
        </div>
        
        {/* Title */}
        <h2 className={`text-center text-2xl font-bold transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-[#0C2C55]'
        }`}>
          Password Reset Successful
        </h2>
        
        {/* Description */}
        <p className={`text-center text-sm transition-colors duration-300 ${
          isDarkMode ? 'text-white/60' : 'text-[#666]'
        }`}>
          You can now login with your new password
        </p>
        
        {/* Button */}
        <button 
          className="h-12 bg-[#2B86ED] rounded-[13px] text-white text-lg font-bold border-none cursor-pointer mt-2.5 transition-all duration-300 hover:bg-[#1e6bc9] hover:scale-[1.02]"
          onClick={()=>navigate("/login")}
        >
          Go To Login
        </button>
      </div>
    </div>
  )
}

export default Success;