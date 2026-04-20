function SocialButton({ provider, onLogin, icon, text, isDarkMode }) {
  const handleClick = () => {
    onLogin(provider);
  };

  return (
    <button 
      className={`h-12 border-none rounded-[13px] cursor-pointer flex items-center justify-center gap-2 text-sm transition-all duration-300 hover:scale-[1.02] ${
        isDarkMode 
          ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' 
          : 'bg-[#E5F2FF] text-[#0C355E] hover:bg-[#d4e8ff]'
      }`}
      onClick={handleClick}
    >
      <img 
        src={icon} 
        alt={provider} 
        className={`w-5 mr-2.5 ${isDarkMode ? 'brightness-0 invert' : ''}`} 
      />
      {text}
    </button>
  );
}

export default SocialButton;