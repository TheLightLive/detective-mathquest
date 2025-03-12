
import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  email: string;
  name: string;
  rank: string;
  xp: number;
  streak: number;
  cases_solved: number;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const MOCK_USER: User = {
  id: "user1",
  email: "detective@example.com",
  name: "Detective Smith",
  rank: "Junior Detective",
  xp: 150,
  streak: 3,
  cases_solved: 5,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading user on mount
  useEffect(() => {
    // In a real app, check local storage or a token
    const timer = setTimeout(() => {
      // For demo purposes, we'll start logged out
      setUser(null);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock login - in real app this would validate with a backend
      if (email === "demo@example.com" && password === "password") {
        setUser(MOCK_USER);
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock signup - in real app this would register with a backend
      setUser({
        ...MOCK_USER,
        email,
        name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock Google login
      setUser(MOCK_USER);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
