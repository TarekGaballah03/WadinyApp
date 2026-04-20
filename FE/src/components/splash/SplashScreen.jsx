import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SplashScreen.css";
import { useTheme } from "../../context/ThemeContext";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [phase, setPhase] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // توليد جزيئات بخصائص عشوائية تعطي إيحاء بالنجوم أو الشرر
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    // تسلسل زمني احترافي (Timelines)
    const timers = [
      setTimeout(() => setPhase(1), 100),  // ظهور النقطة المركزية
      setTimeout(() => setPhase(2), 600),  // انفجار الضوء والنبض
      setTimeout(() => setPhase(3), 1100), // رسم اللوجو بلمعة
      setTimeout(() => setPhase(4), 2500), // تلاشي الـ Splash
      setTimeout(() => navigate("/home"), 3100), // الانتقال للهوم
    ];

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className={`splash ${isDarkMode ? "dark" : ""} phase-${phase}`}>
      
      {/* Background Sparkles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Dynamic Pulse Ring */}
      <div className={`ring ${phase >= 2 ? "show" : ""}`} />

      {/* Center Glow Blob */}
      <div className={`blob ${phase >= 1 ? "visible" : ""} ${phase >= 2 ? "expand" : ""}`} />

      {/* Elegant Shine Logo */}
      <h1 className={`logo ${phase >= 3 ? "draw" : ""}`}>
        وَدّيني
      </h1>

    </div>
  );
}