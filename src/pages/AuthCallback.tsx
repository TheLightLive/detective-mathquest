
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error during auth callback:", error);
        navigate("/signin");
        return;
      }
      
      if (data.session) {
        // Successfully authenticated
        navigate("/dashboard");
      } else {
        // No session found
        navigate("/signin");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-noir">
      <div className="text-center">
        <div className="flex items-center space-x-2 justify-center mb-4">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
        <h1 className="text-neon-cyan text-xl font-detective">Finalizing your sign in...</h1>
      </div>
    </div>
  );
};

export default AuthCallback;
