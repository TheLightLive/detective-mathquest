
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Brain, 
  Calculator, 
  Trophy, 
  TrendingUp, 
  PieChart,
  GraduationCap,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) => {
  return (
    <div className="noir-card p-6 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:border-neon-cyan/50">
      <div className="mb-4 text-neon-cyan">{icon}</div>
      <h3 className="text-xl font-detective mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const Showcase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-noir">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
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

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative inline-block mb-6">
              <h1 className="text-6xl font-detective mb-4">
                Math<span className="neon-text">Detective</span>
              </h1>
              <div className="absolute -top-4 -right-6">
                <Sparkles className="w-8 h-8 text-neon-purple animate-pulse" />
              </div>
            </div>
            
            <p className="text-xl text-gray-300 mb-8">
              Solve mysteries. Master mathematics. Become the ultimate detective.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold"
                onClick={() => navigate('/signin')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Start your investigation
              </Button>
              
              <Button 
                variant="outline" 
                className="border-neon-purple text-neon-purple hover:bg-neon-purple/20"
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-noir-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-detective text-neon-cyan mb-4">
              How Math<span className="text-neon-purple">Detective</span> Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Sharpen your detective skills while mastering mathematical concepts through interactive mysteries.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="h-10 w-10" />}
              title="Interactive Learning"
              description="Engage with immersive detective stories that integrate real-world math problems in a noir-themed universe."
            />
            
            <FeatureCard
              icon={<Calculator className="h-10 w-10" />}
              title="Advanced Math Tools"
              description="Use our custom LaTeX calculator to solve complex equations across algebra, geometry, and probability."
            />
            
            <FeatureCard
              icon={<Trophy className="h-10 w-10" />}
              title="Achievement System"
              description="Earn XP, advance through detective ranks, and unlock achievements as you solve more cases."
            />
            
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10" />}
              title="Progress Tracking"
              description="Monitor your improvement with detailed statistics and personalized learning recommendations."
            />
            
            <FeatureCard
              icon={<PieChart className="h-10 w-10" />}
              title="Visual Learning"
              description="Visualize mathematical concepts through interactive diagrams and detective case files."
            />
            
            <FeatureCard
              icon={<Sparkles className="h-10 w-10" />}
              title="Engaging Challenges"
              description="Face increasingly complex mysteries that adapt to your skill level and learning pace."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-noir">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-detective text-neon-cyan mb-6">
              Ready to Crack the Case?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join MathDetective today and embark on your journey to becoming a mathematical mastermind.
            </p>
            <Button 
              size="lg" 
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold"
              onClick={() => navigate('/signin')}
            >
              Begin Your Investigation <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-noir-light border-t border-noir-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="relative inline-block mb-6">
            <h2 className="text-2xl font-detective">
              Math<span className="neon-text">Detective</span>
            </h2>
            <div className="absolute -top-2 -right-3">
              <Sparkles className="w-4 h-4 text-neon-purple animate-pulse" />
            </div>
          </div>
          <p className="text-gray-500">© {new Date().getFullYear()} MathDetective. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Showcase;
