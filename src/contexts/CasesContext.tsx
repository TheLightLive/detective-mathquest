
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Case, CaseStatus } from "@/types/case";

type CasesContextType = {
  cases: Case[];
  userCases: Record<string, { status: CaseStatus; progress: number }>;
  loading: boolean;
  error: string | null;
  startCase: (caseId: string) => Promise<void>;
  updateCaseProgress: (caseId: string, progress: number) => Promise<void>;
  completeCase: (caseId: string) => Promise<void>;
  refreshCases: () => Promise<void>;
};

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export const CasesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [userCases, setUserCases] = useState<Record<string, { status: CaseStatus; progress: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load all cases and user progress
  const fetchCasesAndProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all cases
      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("*")
        .order("difficulty", { ascending: true });

      if (casesError) throw casesError;

      // Fetch user progress for these cases
      const { data: userProgressData, error: progressError } = await supabase
        .from("user_cases")
        .select("*")
        .eq("user_id", user.id);

      if (progressError) throw progressError;

      // Process cases with user progress
      const processedCases = casesData.map((caseItem) => {
        const userProgress = userProgressData.find(p => p.case_id === caseItem.id);
        
        return {
          id: caseItem.id,
          title: caseItem.title,
          description: caseItem.description,
          difficulty: caseItem.difficulty,
          status: userProgress ? userProgress.status as CaseStatus : "available",
          xpReward: caseItem.xp_reward,
          prerequisites: caseItem.prerequisites || [],
          mathConcepts: caseItem.math_concepts,
          locale: caseItem.locale,
          progress: 0, // Default progress
          completed: userProgress?.status === "solved"
        } as Case;
      });

      // Create user cases object for easier access
      const userCasesObj: Record<string, { status: CaseStatus; progress: number }> = {};
      userProgressData.forEach(progress => {
        userCasesObj[progress.case_id] = {
          status: progress.status as CaseStatus,
          progress: 0 // We'll update this later if we add progress tracking
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
    fetchCasesAndProgress();
  }, [user]);

  const startCase = async (caseId: string) => {
    if (!user) return;

    try {
      // Check if the user already has a record for this case
      const { data } = await supabase
        .from("user_cases")
        .select("*")
        .eq("user_id", user.id)
        .eq("case_id", caseId)
        .single();

      if (!data) {
        // Create a new record
        const { error } = await supabase
          .from("user_cases")
          .insert({
            user_id: user.id,
            case_id: caseId,
            status: "in_progress",
          });

        if (error) throw error;

        // Update local state
        setUserCases(prev => ({
          ...prev,
          [caseId]: { status: "in_progress", progress: 0 }
        }));

        setCases(prev => 
          prev.map(c => 
            c.id === caseId 
              ? { ...c, status: "in_progress" as CaseStatus } 
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
      // Update user_cases table (if we decide to store progress)
      // For now, we're just updating the local state
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
      // Update the case status to solved
      const { error } = await supabase
        .from("user_cases")
        .update({
          status: "solved",
          completed_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("case_id", caseId);

      if (error) throw error;

      // Get the XP reward for this case
      const caseItem = cases.find(c => c.id === caseId);
      if (!caseItem) return;

      // Update user profile with XP reward
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          xp: user.xp + caseItem.xpReward,
          cases_solved: user.cases_solved + 1,
          streak: user.streak + 1,
          last_solved_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update local state
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

  return (
    <CasesContext.Provider
      value={{
        cases,
        userCases,
        loading,
        error,
        startCase,
        updateCaseProgress,
        completeCase,
        refreshCases
      }}
    >
      {children}
    </CasesContext.Provider>
  );
};

export const useCases = () => {
  const context = useContext(CasesContext);
  if (context === undefined) {
    throw new Error("useCases must be used within a CasesProvider");
  }
  return context;
};
