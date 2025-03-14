
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { CasesProvider } from './contexts/CasesContext';
import { FirebaseCasesProvider } from './contexts/FirebaseCasesContext';
import { useFirebaseAuth } from './contexts/FirebaseAuthContext';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Cases from './pages/Cases';
import Investigation from './pages/Investigation';
import Showcase from './pages/Showcase';
import SignIn from './pages/SignIn';
import NotFound from './pages/NotFound';
import MathTools from './pages/MathTools';
import './App.css';

// Type for protected route props
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protected Route component to redirect unauthenticated users
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    // Show a loading state while auth is being determined
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 rounded-full bg-neon-pink animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

// Public Route component to redirect authenticated users to dashboard
const PublicRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 rounded-full bg-neon-pink animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <FirebaseCasesProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicRoute><Showcase /></PublicRoute>} />
            <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/cases" element={<ProtectedRoute><Cases /></ProtectedRoute>} />
            <Route path="/investigation/:id" element={<ProtectedRoute><Investigation /></ProtectedRoute>} />
            <Route path="/math-tools" element={<ProtectedRoute><MathTools /></ProtectedRoute>} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </FirebaseCasesProvider>
    </ThemeProvider>
  );
};

export default App;
