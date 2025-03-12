
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
