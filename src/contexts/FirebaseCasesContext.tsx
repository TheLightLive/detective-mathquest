
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
  getCaseAccessStatus: (caseId: string) => { canAccess: boolean; message: string };
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
  const { t, i18n } = useTranslation();

  // Define module unlocking thresholds
  const MODULE_UNLOCK_THRESHOLDS = {
    basics: 0, // Available from start
    algebra: 0, // Available from start
    geometry: 50, // Requires 50 XP
    probability: 150, // Requires 150 XP
    advanced: 300, // Requires 300 XP
  };

  const fetchCasesAndProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Define example cases if the database is empty
      const exampleCases = [
        {
          id: "algebra-case-1",
          title: t("cases.algebra.title"),
          description: t("cases.algebra.description"),
          difficulty: "beginner" as Difficulty,
          status: "available" as CaseStatus,
          xpReward: 25,
          prerequisites: [],
          mathConcepts: ["algebra", "equations", "variables"],
          category: "algebra",
          locale: i18n.language,
          unlockXP: 0
        },
        {
          id: "algebra-case-2",
          title: "Systems of Equations Mystery",
          description: "Solve a system of equations to crack the code to a locked vault.",
          difficulty: "intermediate" as Difficulty,
          status: "locked" as CaseStatus,
          xpReward: 35,
          prerequisites: ["algebra-case-1"],
          mathConcepts: ["algebra", "systems of equations"],
          category: "algebra",
          locale: i18n.language,
          unlockXP: 20
        },
        {
          id: "geometry-case-1",
          title: t("cases.geometry.title"),
          description: t("cases.geometry.description"),
          difficulty: "beginner" as Difficulty,
          status: "locked" as CaseStatus,
          xpReward: 30,
          prerequisites: ["algebra-case-1"],
          mathConcepts: ["geometry", "triangles", "angles"],
          category: "geometry",
          locale: i18n.language,
          unlockXP: 50
        },
        {
          id: "probability-case-1",
          title: t("cases.probability.title"),
          description: t("cases.probability.description"),
          difficulty: "intermediate" as Difficulty,
          status: "locked" as CaseStatus,
          xpReward: 40,
          prerequisites: ["geometry-case-1"],
          mathConcepts: ["probability", "chance", "combinations"],
          category: "probability",
          locale: i18n.language,
          unlockXP: 150
        }
      ];

      // Check if cases collection exists in Firebase
      const casesRef = collection(db, "cases");
      const casesSnapshot = await getDocs(casesRef);
      
      // If cases collection is empty, create example cases
      if (casesSnapshot.empty) {
        for (const caseData of exampleCases) {
          await setDoc(doc(db, "cases", caseData.id), {
            title: caseData.title,
            description: caseData.description,
            difficulty: caseData.difficulty,
            xp_reward: caseData.xpReward,
            prerequisites: caseData.prerequisites || [],
            math_concepts: caseData.mathConcepts,
            locale: caseData.locale,
            category: caseData.category,
            unlock_xp: caseData.unlockXP,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
        
        // Fetch cases again after creating them
        const newCasesSnapshot = await getDocs(casesRef);
        const casesData = newCasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch user progress
        const userProgressRef = collection(db, "user_cases");
        const q = query(userProgressRef, where("user_id", "==", user.id));
        const userProgressSnapshot = await getDocs(q);
        const userProgressData = userProgressSnapshot.docs.map(doc => doc.data());
        
        const processedCases = processCasesData(casesData, userProgressData);
        setCases(processedCases);
        
        const userCasesObj = createUserCasesObject(userProgressData);
        setUserCases(userCasesObj);
      } else {
        // Fetch existing cases from Firebase
        const casesData = casesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch user progress
        const userProgressRef = collection(db, "user_cases");
        const q = query(userProgressRef, where("user_id", "==", user.id));
        const userProgressSnapshot = await getDocs(q);
        const userProgressData = userProgressSnapshot.docs.map(doc => doc.data());
        
        const processedCases = processCasesData(casesData, userProgressData);
        setCases(processedCases);
        
        const userCasesObj = createUserCasesObject(userProgressData);
        setUserCases(userCasesObj);
      }
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

  const processCasesData = (casesData: any[], userProgressData: any[]) => {
    return casesData.map((caseItem: any) => {
      const userProgress = userProgressData.find((p: any) => p.case_id === caseItem.id);
      
      let category = caseItem.category || "general";
      if (!category && caseItem.math_concepts && caseItem.math_concepts.length > 0) {
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
      
      // Determine if case is locked based on prerequisites and XP requirements
      let locked = false;
      let lockedReason = "";
      
      // Check if module is locked by XP threshold
      const unlockXP = caseItem.unlock_xp || 0;
      if (user && user.xp < unlockXP) {
        locked = true;
        lockedReason = t("cases.access.needXP", { xp: unlockXP - user.xp });
      }
      
      // Check if prerequisites are completed
      const prerequisites = caseItem.prerequisites || [];
      if (!locked && prerequisites.length > 0) {
        const unsolvedPrerequisites = prerequisites.filter((prereqId: string) => {
          const prereqProgress = userProgressData.find((p: any) => p.case_id === prereqId);
          return !prereqProgress || prereqProgress.status !== "solved";
        });
        
        if (unsolvedPrerequisites.length > 0) {
          locked = true;
          lockedReason = t("cases.access.locked");
        }
      }
      
      // Set status based on lock status and user progress
      let status: CaseStatus = "available";
      if (locked) {
        status = "locked";
      } else if (userProgress) {
        status = userProgress.status as CaseStatus;
      }
      
      return {
        id: caseItem.id,
        title: caseItem.title,
        description: caseItem.description,
        difficulty: caseItem.difficulty as Difficulty,
        status: status,
        xpReward: caseItem.xp_reward,
        prerequisites: caseItem.prerequisites || [],
        mathConcepts: caseItem.math_concepts,
        locale: caseItem.locale || i18n.language,
        category,
        progress,
        completed: userProgress?.status === "solved",
        unlockXP: caseItem.unlock_xp || 0,
        locked,
        lockedReason
      } as Case;
    });
  };

  const createUserCasesObject = (userProgressData: any[]) => {
    const userCasesObj: Record<string, { status: CaseStatus; progress: number }> = {};
    userProgressData.forEach((progress: any) => {
      userCasesObj[progress.case_id] = {
        status: progress.status as CaseStatus,
        progress: progress.status === "solved" ? 100 : (progress.status === "in_progress" ? progress.progress || 50 : 0)
      };
    });
    return userCasesObj;
  };

  useEffect(() => {
    if (user) {
      fetchCasesAndProgress();
    } else {
      setCases([]);
      setUserCases({});
    }
  }, [user, i18n.language]);

  const getCaseAccessStatus = (caseId: string) => {
    const caseItem = cases.find(c => c.id === caseId);
    
    if (!caseItem) {
      return { canAccess: false, message: t("common.notFound") };
    }
    
    if (caseItem.locked) {
      return { canAccess: false, message: caseItem.lockedReason };
    }
    
    if (caseItem.completed) {
      return { canAccess: true, message: t("cases.access.completed") };
    }
    
    if (caseItem.status === "in_progress") {
      return { canAccess: true, message: t("cases.access.continue") };
    }
    
    return { canAccess: true, message: t("cases.access.available") };
  };

  const startCase = async (caseId: string) => {
    if (!user) return;

    // Check if user can access this case
    const accessStatus = getCaseAccessStatus(caseId);
    if (!accessStatus.canAccess) {
      toast({
        title: "Cannot start case",
        description: accessStatus.message,
        variant: "destructive",
      });
      return;
    }

    try {
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

      toast({
        title: "Case solved!",
        description: `Great work, Detective! You earned ${caseItem.xpReward} XP.`,
      });
      
      // Refresh cases to update locks based on new XP and completed prerequisites
      setTimeout(() => {
        fetchCasesAndProgress();
      }, 1000);
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
        getCaseAccessStatus
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
