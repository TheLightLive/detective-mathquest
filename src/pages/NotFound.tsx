
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { MagnifyingGlass, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-noir relative px-4 sm:px-6 lg:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-cyan/20 via-transparent to-transparent"></div>
      </div>
      
      {/* Math symbols floating in background */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(15)].map((_, i) => (
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
      
      <div className="w-full max-w-md mx-auto p-8 noir-card animate-fade-in text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-noir-accent border-2 border-neon-purple">
              <MagnifyingGlass className="h-12 w-12 text-neon-cyan" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full bg-noir border-2 border-neon-cyan text-neon-cyan font-bold text-lg">?</div>
          </div>
        </div>
        
        <h1 className="text-5xl font-detective text-neon-cyan mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Case Not Found</h2>
        <p className="text-gray-400 mb-8">
          The evidence you're looking for seems to be missing from our files. 
          Let's return to headquarters and try a different approach.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <Button asChild className="bg-neon-cyan hover:bg-neon-cyan/80 text-black">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-neon-purple text-neon-purple hover:bg-neon-purple/20">
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
