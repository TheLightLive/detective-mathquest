
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateRank } from "@/utils/rankSystem";

type User = {
  id: string;
  email: string;
  name: string;
  rank: string;
  xp: number;
  streak: number;
  cases_solved: number;
  avatar_url?: string;
};

type FirebaseAuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to fetch user profile from Firestore
  const fetchUserProfile = async (userId: string) => {
    const docRef = doc(db, "profiles", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  };

  // Transform Firebase user and profile into our app's User type
  const transformUserData = (firebaseUser: FirebaseUser, profile: any): User => {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: profile?.name || 'Detective',
      rank: calculateRank(profile?.xp || 0),
      xp: profile?.xp || 0,
      streak: profile?.streak || 0,
      cases_solved: profile?.cases_solved || 0,
      avatar_url: profile?.avatar_url,
    };
  };

  // Check for existing session on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      try {
        if (firebaseUser) {
          const profile = await fetchUserProfile(firebaseUser.uid);
          const userData = transformUserData(firebaseUser, profile);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking auth state:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(userCredential.user.uid);
      const userData = transformUserData(userCredential.user, profile);
      setUser(userData);
      
      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      toast({
        title: "Sign in failed",
        description: err.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, "profiles", userCredential.user.uid), {
        name,
        xp: 0,
        streak: 0,
        cases_solved: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      const userData = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        name,
        rank: calculateRank(0),
        xp: 0,
        streak: 0,
        cases_solved: 0,
      };
      
      setUser(userData);
      
      toast({
        title: "Account created",
        description: "Welcome to Math Detective! Your detective profile has been created.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
      toast({
        title: "Sign up failed",
        description: err.message || "Failed to sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user profile exists
      const profile = await fetchUserProfile(userCredential.user.uid);
      
      if (!profile) {
        // Create new profile if it doesn't exist
        await setDoc(doc(db, "profiles", userCredential.user.uid), {
          name: userCredential.user.displayName || 'Detective',
          xp: 0,
          streak: 0,
          cases_solved: 0,
          created_at: new Date(),
          updated_at: new Date(),
          avatar_url: userCredential.user.photoURL,
        });
      }
      
      const userData = transformUserData(userCredential.user, profile || {
        name: userCredential.user.displayName || 'Detective',
        xp: 0,
        streak: 0,
        cases_solved: 0,
        avatar_url: userCredential.user.photoURL,
      });
      
      setUser(userData);
      
      toast({
        title: "Signed in with Google",
        description: `Welcome, ${userData.name}!`,
      });
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      toast({
        title: "Sign in failed",
        description: err.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      await firebaseSignOut(auth);
      setUser(null);
      navigate("/signin");
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (err: any) {
      toast({
        title: "Sign out failed",
        description: err.message || "Failed to sign out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FirebaseAuthContext.Provider
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
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
};
