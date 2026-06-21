import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMic, FiSend } from "react-icons/fi";
import aiAvatar from "../../assets/ai.jpg";
import userAvatar from "../../assets/avatar.jpg";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useTheme } from "../../context/ThemeContext";
import { aiChatAPI } from "../../services/api";
import PlaceCard from "./PlaceCard";

// Typing animation component
const TypingIndicator = ({ isDarkMode }) => {
  return (
    <div className="flex gap-2.5 items-start">
      <img src={aiAvatar} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm" />
      <div className={`p-[14px] rounded-[18px] transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-[#1a2b3c]/80 to-[#121c29]/80 backdrop-blur-md border border-white/10 shadow-xl' 
          : 'bg-white border border-[#eef2f7] shadow-lg shadow-[#2a85ec]/5'
      }`}>
        <div className="flex gap-1.5 items-center">
          <div className={`w-2 h-2 rounded-full animate-bounce ${
            isDarkMode ? 'bg-[#2a85ec]' : 'bg-[#2a85ec]'
          }`} style={{ animationDelay: '0ms' }} />
          <div className={`w-2 h-2 rounded-full animate-bounce ${
            isDarkMode ? 'bg-[#2a85ec]/70' : 'bg-[#2a85ec]/70'
          }`} style={{ animationDelay: '150ms' }} />
          <div className={`w-2 h-2 rounded-full animate-bounce ${
            isDarkMode ? 'bg-[#2a85ec]/40' : 'bg-[#2a85ec]/40'
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

  // Helper to parse message text and render cards for [PLACE: {...}] tags
  const renderMessageContent = (text) => {
    if (!text) return null;
    
    // Split by the [PLACE: {...}] pattern
    const parts = text.split(/(\[PLACE:\s*\{.*?\}\s*\])/g);
    
    return (
      <div className="flex flex-col gap-2">
        {parts.map((part, i) => {
          if (!part.trim()) return null;
          
          if (part.startsWith('[PLACE:')) {
            try {
              // Extract the JSON portion
              const jsonStr = part.replace(/^\[PLACE:\s*/, '').replace(/\s*\]$/, '').trim();
              const placeObj = JSON.parse(jsonStr);
              return <PlaceCard key={`place-${i}`} place={placeObj} />;
            } catch (e) {
              console.error("Failed to parse place block", part, e);
              // Fallback to text if parsing fails
              return <span key={`text-${i}`} className="whitespace-pre-wrap">{part}</span>;
            }
          }
          // Normal text
          return <span key={`text-${i}`} className="whitespace-pre-wrap leading-relaxed">{part}</span>;
        })}
      </div>
    );
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
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-[20px] scroll-smooth">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 items-end ${msg.sender === "user" ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === "bot" && (
              <img src={aiAvatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm" />
            )}
            
            <div className={`max-w-[75%] ${msg.sender === "user" ? 'order-1' : 'order-2'}`}>
              <div className={`px-[18px] py-[14px] rounded-3xl text-[15px] transition-all duration-300 ${
                msg.sender === "bot" 
                  ? isDarkMode 
                    ? 'bg-gradient-to-br from-[#1a2b3c]/80 to-[#121c29]/80 backdrop-blur-md border border-white/10 text-white/90 shadow-lg rounded-bl-sm' 
                    : 'bg-white border border-[#eef2f7] text-[#1e3a5f] shadow-lg shadow-[#2a85ec]/5 rounded-bl-sm'
                  : 'bg-gradient-to-r from-[#2a85ec] to-[#1e6ac7] text-white shadow-md shadow-[#2a85ec]/30 rounded-br-sm'
              }`}>
                {renderMessageContent(msg.text)}
              </div>
            </div>

            {msg.sender === "user" && (
              <img src={userAvatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm order-3" />
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && <TypingIndicator isDarkMode={isDarkMode} />}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className={`p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-10 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0a0f1a]/80 backdrop-blur-xl border-t border-white/5' : 'bg-white/80 backdrop-blur-xl'
      }`}>
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className={`flex items-center rounded-full p-2 gap-3 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#1a2b3c]/60 border border-white/10 focus-within:border-[#2a85ec]/50' 
              : 'bg-[#f3f6fa] border border-transparent focus-within:border-[#2a85ec]/30 focus-within:bg-white focus-within:shadow-md'
          }`}>
            <div className={`p-2 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
              <FiMic className={isDarkMode ? 'text-white/60' : 'text-[#6b7280]'} size={18} />
            </div>
            <input
              type="text"
              placeholder="Ask for recommendations, traffic updates..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isTyping}
              className={`flex-1 border-none bg-transparent outline-none text-[15px] px-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white placeholder:text-white/40' : 'text-[#1e3a5f] placeholder:text-[#94a3b8]'
              }`}
            />
            <button 
              type="submit" 
              disabled={isTyping || !message.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                !message.trim() || isTyping 
                  ? isDarkMode ? 'bg-white/5 text-white/30' : 'bg-gray-200 text-gray-400' 
                  : 'bg-gradient-to-r from-[#2a85ec] to-[#1e6ac7] text-white shadow-md shadow-[#2a85ec]/30 hover:scale-105'
              }`}
            >
              <FiSend size={18} className={message.trim() ? "ml-0.5" : ""} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}