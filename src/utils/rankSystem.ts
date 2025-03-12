
export const ranks = [
  { name: 'Rookie Detective', minXP: 0 },
  { name: 'Junior Detective', minXP: 100 },
  { name: 'Detective', minXP: 500 },
  { name: 'Senior Detective', minXP: 1000 },
  { name: 'Master Detective', minXP: 2500 },
  { name: 'Elite Detective', minXP: 5000 },
  { name: 'Legendary Detective', minXP: 10000 },
] as const;

export const calculateRank = (xp: number): string => {
  const rank = ranks.reduce((acc, curr) => {
    if (xp >= curr.minXP) {
      return curr;
    }
    return acc;
  });
  return rank.name;
};

export const calculateNextRankProgress = (xp: number): { 
  currentRank: string;
  nextRank: string | null;
  progress: number;
} => {
  const currentRankObj = ranks.find((r, i) => 
    xp >= r.minXP && (!ranks[i + 1] || xp < ranks[i + 1].minXP)
  );
  
  if (!currentRankObj) {
    return {
      currentRank: ranks[0].name,
      nextRank: ranks[1].name,
      progress: 0
    };
  }

  const nextRankObj = ranks[ranks.indexOf(currentRankObj) + 1];
  
  if (!nextRankObj) {
    return {
      currentRank: currentRankObj.name,
      nextRank: null,
      progress: 100
    };
  }

  const progress = ((xp - currentRankObj.minXP) / 
    (nextRankObj.minXP - currentRankObj.minXP)) * 100;

  return {
    currentRank: currentRankObj.name,
    nextRank: nextRankObj.name,
    progress: Math.min(Math.max(progress, 0), 100)
  };
};
