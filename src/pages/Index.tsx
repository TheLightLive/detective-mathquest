
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();

  // Start animation sequence
  useEffect(() => {
    // Show loading animation for 2 seconds
    const loadingTimer = setTimeout(() => {
      setLoading(false);
      setAnimate(true);
    }, 2000);
    
    return () => clearTimeout(loadingTimer);
  }, []);

  // Navigate to showcase page after animation
  useEffect(() => {
    if (animate) {
      const navigateTimer = setTimeout(() => {
        navigate("/showcase");
      }, 1800);
      
      return () => clearTimeout(navigateTimer);
    }
  }, [animate, navigate]);

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
          <h1 
            className={`text-6xl font-detective transition-all duration-1000 ${
              loading 
                ? 'scale-90 opacity-70 text-white' 
                : animate 
                  ? 'scale-110 opacity-100' 
                  : 'scale-100 opacity-100'
            }`}
          >
            Math
            <span 
              className={`transition-all duration-1500 ${
                loading 
                  ? 'text-white' 
                  : 'text-neon-purple'
              }`}
            >
              Detective
            </span>
          </h1>
          <div className={`absolute -top-4 -right-6 transition-all duration-700 ${loading ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
            <Sparkles className="w-8 h-8 text-neon-purple animate-pulse" />
          </div>
        </div>
        
        <div className={`mt-6 transition-all duration-1000 ${
          loading 
            ? 'opacity-0 translate-y-4' 
            : animate 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
        }`}>
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

export default Index;
