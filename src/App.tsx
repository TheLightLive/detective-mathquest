
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";
import { FirebaseCasesProvider } from "./contexts/FirebaseCasesContext";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Investigation from "./pages/Investigation";
import AuthCallback from "./pages/AuthCallback";
import Showcase from "./pages/Showcase";
import NotFound from "./pages/NotFound";
import DetectiveCases from "./pages/DetectiveCases";
import Profile from "./pages/Profile";
import { useFirebaseAuth } from "./contexts/FirebaseAuthContext";
import { useEffect } from "react";
import { useIsMobile } from "./hooks/use-mobile";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useFirebaseAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noir">
        <div className="text-center">
          <div className="flex items-center space-x-2 justify-center mb-4">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
};

// Mobile viewport adjustment for iOS/Android
const MobileViewportAdjuster = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      // Fix for iOS/Android to handle viewport height properly
      const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setVh();
      window.addEventListener('resize', setVh);
      window.addEventListener('orientationchange', setVh);

      return () => {
        window.removeEventListener('resize', setVh);
        window.removeEventListener('orientationchange', setVh);
      };
    }
  }, [isMobile]);

  return null;
};

// App routes with authentication wrapper
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/showcase" element={<Showcase />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/cases" element={
        <ProtectedRoute>
          <Cases />
        </ProtectedRoute>
      } />
      <Route path="/investigation/:id" element={
        <ProtectedRoute>
          <Investigation />
        </ProtectedRoute>
      } />
      <Route path="/detective-cases" element={
        <ProtectedRoute>
          <DetectiveCases />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <FirebaseAuthProvider>
        <FirebaseCasesProvider>
          <TooltipProvider>
            <MobileViewportAdjuster />
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </FirebaseCasesProvider>
      </FirebaseAuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
