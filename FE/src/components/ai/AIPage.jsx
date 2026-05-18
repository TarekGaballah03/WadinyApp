import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMic, FiSend } from "react-icons/fi";
import aiAvatar from "../../assets/ai.jpg";
import userAvatar from "../../assets/avatar.jpg";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useTheme } from "../../context/ThemeContext";
import { aiChatAPI } from "../../services/api";

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
    { sender: "bot", text: "Hi! I'm the Wadiny Assistant. I can help you with traffic updates, restaurant recommendations, and more. How can I help you today?" }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMessage = message.trim();
    setMessage("");
    setError(null);

    // Add user message to chat
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setIsTyping(true);

    try {
      const data = await aiChatAPI(userMessage);
      setMessages(prev => [...prev, { sender: "bot", text: data.message }]);
    } catch (err) {
      setError("Sorry, the AI assistant is currently unavailable. Make sure the backend is running and your GEMINI_API_KEY is set.");
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`h-screen flex flex-col font-sans relative transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0f1a]' : 'bg-[#f6f8fc]'
    }`}>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-[18px]">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-2.5 items-start ${msg.sender === "user" ? 'justify-end' : ''}`}>
            {msg.sender === "bot" && (
              <img src={aiAvatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
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
              </div>
            </div>

            {msg.sender === "user" && (
              <img src={userAvatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && <TypingIndicator isDarkMode={isDarkMode} />}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
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
              placeholder="Ask about traffic, restaurants, or anything Wadiny..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isTyping}
              className={`flex-1 border-none bg-transparent outline-none text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-white placeholder:text-white/50' : 'text-[#1e3a5f] placeholder:text-[#94a3b8]'
              }`}
            />
            <FiMic className={isDarkMode ? 'text-white/60 text-xl' : 'text-[#6b7280] text-xl'} />
            <button 
              type="submit" 
              disabled={isTyping || !message.trim()}
              className="bg-[#2a85ec] border-none w-[34px] h-[34px] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#1e6ac7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}