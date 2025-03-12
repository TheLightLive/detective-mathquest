
import React, { createContext, useContext, useState } from "react";

// Types for our case structure
export type MathCase = {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "algebra" | "geometry" | "probability" | "advanced";
  xpReward: number;
  completed: boolean;
  progress: number;
  imageUrl?: string;
};

type CasesContextType = {
  cases: MathCase[];
  currentCase: MathCase | null;
  loadCase: (id: string) => void;
  updateCaseProgress: (id: string, progress: number) => void;
  completeCase: (id: string) => void;
};

// Sample cases data
const MOCK_CASES: MathCase[] = [
  {
    id: "case1",
    title: "The Missing Variable",
    description: "A crucial variable has disappeared from an important equation. Can you track it down and solve the mystery?",
    difficulty: "easy",
    category: "algebra",
    xpReward: 50,
    completed: false,
    progress: 0,
    imageUrl: "/case1.jpg",
  },
  {
    id: "case2",
    title: "Geometry of the Crime Scene",
    description: "A crime scene contains geometric clues. Analyze the angles and shapes to identify the culprit.",
    difficulty: "medium",
    category: "geometry",
    xpReward: 75,
    completed: false,
    progress: 0,
    imageUrl: "/case2.jpg",
  },
  {
    id: "case3",
    title: "Probability of Deception",
    description: "Multiple suspects, one criminal. Use probability to determine who's most likely to have committed the crime.",
    difficulty: "hard",
    category: "probability",
    xpReward: 100,
    completed: false,
    progress: 0,
    imageUrl: "/case3.jpg",
  },
];

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export const CasesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<MathCase[]>(MOCK_CASES);
  const [currentCase, setCurrentCase] = useState<MathCase | null>(null);

  const loadCase = (id: string) => {
    const foundCase = cases.find(c => c.id === id) || null;
    setCurrentCase(foundCase);
  };

  const updateCaseProgress = (id: string, progress: number) => {
    setCases(prev => 
      prev.map(c => 
        c.id === id ? { ...c, progress: Math.min(progress, 100) } : c
      )
    );
    
    if (currentCase?.id === id) {
      setCurrentCase(prev => prev ? { ...prev, progress } : null);
    }
  };

  const completeCase = (id: string) => {
    setCases(prev => 
      prev.map(c => 
        c.id === id ? { ...c, completed: true, progress: 100 } : c
      )
    );
    
    if (currentCase?.id === id) {
      setCurrentCase(prev => prev ? { ...prev, completed: true, progress: 100 } : null);
    }
  };

  return (
    <CasesContext.Provider
      value={{
        cases,
        currentCase,
        loadCase,
        updateCaseProgress,
        completeCase,
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
