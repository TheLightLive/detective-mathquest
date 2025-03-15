
import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useFirebaseAuth } from "./FirebaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Case, CaseStatus, Difficulty } from "@/types/case";
import { useTranslation } from "react-i18next";

type FirebaseCasesContextType = {
  cases: Case[];
  userCases: Record<string, { status: CaseStatus; progress: number }>;
  loading: boolean;
  error: string | null;
  startCase: (caseId: string) => Promise<void>;
  updateCaseProgress: (caseId: string, progress: number) => Promise<void>;
  completeCase: (caseId: string) => Promise<void>;
  refreshCases: () => Promise<void>;
  currentCase?: Case;
  loadCase: (caseId: string) => void;
  isCaseAccessible: (caseId: string) => boolean;
  getRequiredXp: (caseId: string) => number;
  getMissingPrerequisites: (caseId: string) => string[];
};

const FirebaseCasesContext = createContext<FirebaseCasesContextType | undefined>(undefined);

export const FirebaseCasesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [userCases, setUserCases] = useState<Record<string, { status: CaseStatus; progress: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCase, setCurrentCase] = useState<Case | undefined>(undefined);
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();

  const fetchCasesAndProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch cases from Firestore
      const casesRef = collection(db, "cases");
      const casesSnapshot = await getDocs(casesRef);
      const casesData = casesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch user progress
      const userProgressRef = collection(db, "user_cases");
      const q = query(userProgressRef, where("user_id", "==", user.id));
      const userProgressSnapshot = await getDocs(q);
      const userProgressData = userProgressSnapshot.docs.map(doc => doc.data());
      
      // Get user profile for XP
      const userProfileRef = doc(db, "profiles", user.id);
      const userProfileSnap = await getDoc(userProfileRef);
      const userXp = userProfileSnap.exists() ? userProfileSnap.data().xp || 0 : 0;
      
      const processedCases = casesData.map((caseItem: any) => {
        const userProgress = userProgressData.find((p: any) => p.case_id === caseItem.id);
        
        let category = "general";
        if (caseItem.math_concepts && caseItem.math_concepts.length > 0) {
          if (caseItem.math_concepts.includes("algebra")) {
            category = "algebra";
          } else if (caseItem.math_concepts.includes("geometry")) {
            category = "geometry";
          } else if (caseItem.math_concepts.includes("probability")) {
            category = "probability";
          } else if (caseItem.math_concepts.includes("calculus")) {
            category = "advanced";
          }
        }
        
        const progress = userProgress ? 
          (userProgress.status === "solved" ? 100 : (userProgress.status === "in_progress" ? userProgress.progress || 50 : 0)) : 0;
        
        // Determine case status based on prerequisites and XP requirements
        let status: CaseStatus = "available";
        
        if (userProgress) {
          status = userProgress.status as CaseStatus;
        } else {
          // Check if case should be locked due to prerequisites
          const prerequisites = caseItem.prerequisites || [];
          const requiredXp = caseItem.required_xp || 0;
          
          const hasPrerequisites = prerequisites.length === 0 || 
            prerequisites.every(prereqId => 
              userProgressData.some(p => p.case_id === prereqId && p.status === "solved")
            );
          
          const hasEnoughXp = userXp >= requiredXp;
          
          if (!hasPrerequisites || !hasEnoughXp) {
            status = "locked";
          }
        }
        
        return {
          id: caseItem.id,
          title: caseItem.title,
          description: caseItem.description,
          difficulty: caseItem.difficulty as Difficulty,
          status,
          xpReward: caseItem.xp_reward,
          prerequisites: caseItem.prerequisites || [],
          mathConcepts: caseItem.math_concepts,
          locale: caseItem.locale || i18n.language,
          category,
          progress,
          completed: userProgress?.status === "solved",
          requiredXp: caseItem.required_xp
        } as Case;
      });

      const userCasesObj: Record<string, { status: CaseStatus; progress: number }> = {};
      userProgressData.forEach((progress: any) => {
        userCasesObj[progress.case_id] = {
          status: progress.status as CaseStatus,
          progress: progress.status === "solved" ? 100 : (progress.status === "in_progress" ? progress.progress || 50 : 0)
        };
      });

      setCases(processedCases);
      setUserCases(userCasesObj);
    } catch (err: any) {
      console.error("Error fetching cases:", err);
      setError(err.message);
      toast({
        title: "Error loading cases",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCasesAndProgress();
    } else {
      setCases([]);
      setUserCases({});
    }
  }, [user, i18n.language]);

  // Check if a case is accessible to the user
  const isCaseAccessible = (caseId: string): boolean => {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return false;
    
    return caseItem.status !== "locked";
  };
  
  // Get XP required for a case
  const getRequiredXp = (caseId: string): number => {
    const caseItem = cases.find(c => c.id === caseId);
    return caseItem?.requiredXp || 0;
  };
  
  // Get missing prerequisites for a case
  const getMissingPrerequisites = (caseId: string): string[] => {
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem || !caseItem.prerequisites.length) return [];
    
    return caseItem.prerequisites.filter(prereqId => {
      const prereqCase = cases.find(c => c.id === prereqId);
      return prereqCase && !prereqCase.completed;
    });
  };

  const startCase = async (caseId: string) => {
    if (!user) return;

    try {
      // Check if the case is accessible
      if (!isCaseAccessible(caseId)) {
        toast({
          title: "Case Locked",
          description: "You need to meet the prerequisites to start this case.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if user case already exists
      const userCasesRef = collection(db, "user_cases");
      const q = query(userCasesRef, 
        where("user_id", "==", user.id),
        where("case_id", "==", caseId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new user case
        await addDoc(collection(db, "user_cases"), {
          user_id: user.id,
          case_id: caseId,
          status: "in_progress",
          progress: 0,
          started_at: new Date(),
        });

        setUserCases(prev => ({
          ...prev,
          [caseId]: { status: "in_progress", progress: 0 }
        }));

        setCases(prev => 
          prev.map(c => 
            c.id === caseId 
              ? { ...c, status: "in_progress" as CaseStatus, progress: 0 } 
              : c
          )
        );

        toast({
          title: "Case started",
          description: "Good luck with your investigation!",
        });
      }
    } catch (err: any) {
      console.error("Error starting case:", err);
      toast({
        title: "Error starting case",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const updateCaseProgress = async (caseId: string, progress: number) => {
    if (!user) return;

    try {
      // Find the user case doc
      const userCasesRef = collection(db, "user_cases");
      const q = query(userCasesRef, 
        where("user_id", "==", user.id),
        where("case_id", "==", caseId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userCaseDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "user_cases", userCaseDoc.id), {
          progress,
          updated_at: new Date()
        });
      }

      setUserCases(prev => ({
        ...prev,
        [caseId]: { ...prev[caseId], progress }
      }));

      setCases(prev => 
        prev.map(c => 
          c.id === caseId 
            ? { ...c, progress } 
            : c
        )
      );
    } catch (err: any) {
      console.error("Error updating case progress:", err);
    }
  };

  const completeCase = async (caseId: string) => {
    if (!user) return;

    try {
      // Find the user case doc
      const userCasesRef = collection(db, "user_cases");
      const q = query(userCasesRef, 
        where("user_id", "==", user.id),
        where("case_id", "==", caseId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userCaseDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "user_cases", userCaseDoc.id), {
          status: "solved",
          progress: 100,
          completed_at: new Date()
        });
      }

      const caseItem = cases.find(c => c.id === caseId);
      if (!caseItem) return;

      // Update user profile
      const userProfileRef = doc(db, "profiles", user.id);
      const userProfileSnap = await getDoc(userProfileRef);
      
      if (userProfileSnap.exists()) {
        const profileData = userProfileSnap.data();
        await updateDoc(userProfileRef, {
          xp: (profileData.xp || 0) + caseItem.xpReward,
          cases_solved: (profileData.cases_solved || 0) + 1,
          streak: (profileData.streak || 0) + 1,
          last_solved_at: new Date(),
          updated_at: new Date()
        });
      }

      setUserCases(prev => ({
        ...prev,
        [caseId]: { status: "solved", progress: 100 }
      }));

      setCases(prev => 
        prev.map(c => 
          c.id === caseId 
            ? { ...c, status: "solved" as CaseStatus, completed: true, progress: 100 } 
            : c
        )
      );
      
      // Check for newly unlocked cases
      const potentiallyUnlockedCases = cases.filter(c => 
        c.status === "locked" && 
        c.prerequisites.includes(caseId)
      );
      
      if (potentiallyUnlockedCases.length > 0) {
        // Refresh cases to update their lock status
        await fetchCasesAndProgress();
        
        // Notify user of newly unlocked cases
        const newlyUnlocked = potentiallyUnlockedCases.filter(c => 
          cases.find(updatedCase => updatedCase.id === c.id && updatedCase.status === "available")
        );
        
        if (newlyUnlocked.length > 0) {
          toast({
            title: "New Cases Unlocked!",
            description: `You've unlocked ${newlyUnlocked.length} new case(s)!`,
          });
        }
      }

      toast({
        title: "Case solved!",
        description: `Great work, Detective! You earned ${caseItem.xpReward} XP.`,
      });
    } catch (err: any) {
      console.error("Error completing case:", err);
      toast({
        title: "Error completing case",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const refreshCases = async () => {
    await fetchCasesAndProgress();
  };

  const loadCase = (caseId: string) => {
    const foundCase = cases.find(c => c.id === caseId);
    if (foundCase) {
      setCurrentCase(foundCase);
    }
  };

  return (
    <FirebaseCasesContext.Provider
      value={{
        cases,
        userCases,
        loading,
        error,
        startCase,
        updateCaseProgress,
        completeCase,
        refreshCases,
        currentCase,
        loadCase,
        isCaseAccessible,
        getRequiredXp,
        getMissingPrerequisites
      }}
    >
      {children}
    </FirebaseCasesContext.Provider>
  );
};

export const useFirebaseCases = () => {
  const context = useContext(FirebaseCasesContext);
  if (context === undefined) {
    throw new Error("useFirebaseCases must be used within a FirebaseCasesProvider");
  }
  return context;
};
