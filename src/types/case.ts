
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type CaseStatus = 'locked' | 'available' | 'in_progress' | 'solved';

export interface Case {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  status: CaseStatus;
  xpReward: number;
  prerequisites: string[]; // IDs of cases that need to be solved first
  mathConcepts: string[];
  locale: string;
  
  // Add missing properties
  category?: string; // e.g., 'algebra', 'geometry', 'probability', 'advanced'
  progress?: number; // Progress percentage (0-100)
  completed?: boolean; // Whether the case is completed
  unlockXP?: number; // XP required to unlock this case
  locked?: boolean; // Whether the case is locked
  lockedReason?: string; // Reason why the case is locked
}

export interface UserProgress {
  userId: string;
  casesInProgress: string[]; // Case IDs
  casesSolved: string[]; // Case IDs
  currentStreak: number;
  lastSolvedDate: string;
  xp: number;
  rank: string;
}
