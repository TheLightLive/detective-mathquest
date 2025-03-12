
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const WelcomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  // Navigate to sign in after animation
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        navigate("/signin");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-noir relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-cyan/20 via-transparent to-transparent"></div>
      </div>
      
      {/* Math symbols floating in background */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white text-2xl animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 5}s`,
            }}
          >
            {["∫", "∑", "√", "π", "÷", "×", "α", "β", "θ", "Ω"][Math.floor(Math.random() * 10)]}
          </div>
        ))}
      </div>
      
      <div className="text-center z-10">
        <div className="relative mb-4">
          <h1 className={`text-6xl font-detective ${loading ? 'scale-100 opacity-100' : 'scale-110 opacity-0'} transition-all duration-1000`}>
            Math<span className="neon-text">Detective</span>
          </h1>
          <div className="absolute -top-4 -right-6">
            <Sparkles className="w-8 h-8 text-neon-purple animate-pulse" />
          </div>
        </div>
        
        <div className={`mt-6 transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-xl text-gray-300 mb-8">Solve mysteries. Master mathematics.</p>
        </div>
        
        {loading && (
          <div className="mt-10 flex justify-center items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 rounded-full bg-neon-pink animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
