import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMic, FiSend } from "react-icons/fi";
import aiAvatar from "../../assets/ai.jpg";
import userAvatar from "../../assets/avatar.jpg";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useTheme } from "../../context/ThemeContext";

// Typing animation component
const TypingIndicator = ({ isDarkMode }) => {
  return (
    <div className="flex gap-2.5 items-start">
      <img src={aiAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
      <div className={`p-[14px] rounded-[18px] transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-white/10 backdrop-blur-md border border-white/10' 
          : 'bg-[#eef2f7]'
      }`}>
        <div className="flex gap-1.5 items-center">
          <div className={`w-2 h-2 rounded-full animate-bounce ${
            isDarkMode ? 'bg-white/60' : 'bg-[#2a85ec]/60'
          }`} style={{ animationDelay: '0ms' }} />
          <div className={`w-2 h-2 rounded-full animate-bounce ${
            isDarkMode ? 'bg-white/60' : 'bg-[#2a85ec]/60'
          }`} style={{ animationDelay: '150ms' }} />
          <div className={`w-2 h-2 rounded-full animate-bounce ${
            isDarkMode ? 'bg-white/60' : 'bg-[#2a85ec]/60'
          }`} style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default function AIPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you navigate your world today?" }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: message }]);
    
    // Show typing indicator
    setIsTyping(true);

    // Simulate bot response after delay
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sure, here are some top-rated family-friendly cafes in Smouha:",
          cafes: [
            {
              name: "The Cozy Corner",
              rating: 4.8,
              reviews: 120,
              image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93"
            },
            {
              name: "Playground Cafe",
              rating: 4.7,
              reviews: 95,
              image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"
            }
          ]
        }
      ]);
    }, 2000);

    setMessage("");
  };

  return (
    <div className={`h-screen flex flex-col font-sans relative transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-[#f6f8fc]'
    }`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Chat Container */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-[18px]">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-2.5 items-start ${msg.sender === "user" ? 'justify-end' : ''}`}>
            {msg.sender === "bot" && (
              <img src={aiAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            )}
            
            <div className="max-w-[70%]">
              <div className={`p-[14px] rounded-[18px] text-sm leading-[1.5] transition-colors duration-300 ${
                msg.sender === "bot" 
                  ? isDarkMode 
                    ? 'bg-white/10 backdrop-blur-md border border-white/10 text-white/90' 
                    : 'bg-[#eef2f7] text-[#1e3a5f]'
                  : 'bg-[#2a85ec] text-white'
              }`}>
                {msg.text}
                
                {msg.cafes && (
                  <div className="mt-[14px] flex flex-col gap-3">
                    {msg.cafes.map((cafe, idx) => (
                      <div key={idx} className={`flex gap-3 rounded-[16px] p-2.5 items-center transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-white/5 backdrop-blur-sm border border-white/10' 
                          : 'bg-white shadow-[0_3px_10px_rgba(0,0,0,0.06)]'
                      }`}>
                        <img src={cafe.image} className="w-[85px] h-[75px] rounded-[12px] object-cover" alt="" />
                        <div className="flex flex-col">
                          <div className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-[#1e3a5f]'
                          }`}>{cafe.name}</div>
                          <div className={`text-[13px] my-1 ${
                            isDarkMode ? 'text-white/60' : 'text-[#8a94a6]'
                          }`}>
                            ⭐ {cafe.rating} ({cafe.reviews} reviews)
                          </div>
                          <button 
                            className="bg-[#2a85ec] border-none text-white py-[7px] px-4 rounded-[20px] text-[13px] cursor-pointer w-fit hover:bg-[#1e6ac7] transition-colors"
                            onClick={() => navigate("/map")}
                          >
                            View on Map
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-2.5 mt-2">
                      <button className={`border-none py-2.5 px-[15px] rounded-[25px] text-[13px] cursor-pointer transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                          : 'bg-[#e9f1ff] text-[#2a85ec] hover:bg-[#d1e0fe]'
                      }`}>
                        Find a family cafe
                      </button>
                      <button className={`border-none py-2.5 px-[15px] rounded-[25px] text-[13px] cursor-pointer transition-colors duration-300 ${
                        isDarkMode
                          ? 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                          : 'bg-[#e9f1ff] text-[#2a85ec] hover:bg-[#d1e0fe]'
                      }`}>
                        Alternative routes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {msg.sender === "user" && (
              <img src={userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && <TypingIndicator isDarkMode={isDarkMode} />}
      </div>

      {/* Input Area */}
      <div className={`p-[14px] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0a0f1a] border-t border-white/10' : 'bg-white'
      }`}>
        <form onSubmit={handleSendMessage}>
          <div className={`flex items-center rounded-[30px] p-2.5 gap-2.5 transition-colors duration-300 ${
            isDarkMode ? 'bg-white/10 backdrop-blur-md' : 'bg-[#eef2f7]'
          }`}>
            <input
              type="text"
              placeholder="Ask me anything ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`flex-1 border-none bg-transparent outline-none text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-white placeholder:text-white/50' : 'text-[#1e3a5f] placeholder:text-[#94a3b8]'
              }`}
            />
            <FiMic className={isDarkMode ? 'text-white/60 text-xl' : 'text-[#6b7280] text-xl'} />
            <button type="submit" className="bg-[#2a85ec] border-none w-[34px] h-[34px] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#1e6ac7] transition-colors">
              <FiSend />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}