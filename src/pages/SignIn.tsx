
import React from "react";
import SignInForm from "@/components/SignInForm";
import { Sparkles } from "lucide-react";

const SignIn = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-noir relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background elements */}
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
      
      <div className="text-center mb-10 relative">
        <h1 className="text-4xl font-detective text-neon-cyan inline-block">
          Math<span className="text-neon-purple">Detective</span>
        </h1>
        <div className="absolute -top-4 -right-6">
          <Sparkles className="w-6 h-6 text-neon-purple animate-pulse" />
        </div>
      </div>
      
      <SignInForm />
    </div>
  );
};

export default SignIn;
