
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Lightbulb, 
  Calculator,
  Award,
  Send,
  Lock
} from "lucide-react";
import { useFirebaseCases } from "@/contexts/FirebaseCasesContext";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Simplified case story structure
interface StorySegment {
  id: string;
  text: string;
  type: "narrative" | "dialogue" | "clue" | "puzzle" | "conclusion";
  options?: { text: string; next: string }[];
  character?: string;
  puzzle?: {
    question: string;
    answer: string;
    hint?: string;
  };
}

// Sample story for the first case
const CASE_1_STORY: Record<string, StorySegment> = {
  "intro": {
    id: "intro",
    text: "The Academy of Mathematical Sciences has reported a strange occurrence. Their prized equation, which holds the key to a breakthrough discovery, has a missing variable. You've been called in to investigate.",
    type: "narrative",
    options: [
      { text: "Head to the Academy", next: "academy" }
    ]
  },
  "academy": {
    id: "academy",
    text: "You arrive at the Academy, a grand building with equations etched into its marble facade. The director meets you at the entrance, looking worried.",
    type: "narrative",
    options: [
      { text: "Speak with the director", next: "director" }
    ]
  },
  "director": {
    id: "director",
    text: "Thank goodness you're here, Detective. Our most important equation has been tampered with. The variable 'x' has been removed, and without it, our research is at a standstill!",
    type: "dialogue",
    character: "Director Chen",
    options: [
      { text: "Ask to see the equation", next: "equation" },
      { text: "Ask who had access", next: "access" }
    ]
  },
  "access": {
    id: "access",
    text: "Only three researchers had access to the equation: Dr. Abrams, Dr. Lopez, and Dr. Khatri. All of them are brilliant, but they've been competing for a grant.",
    type: "dialogue",
    character: "Director Chen",
    options: [
      { text: "Ask to see the equation", next: "equation" }
    ]
  },
  "equation": {
    id: "equation",
    text: "The director shows you the equation on a secure terminal. It reads: '3 * ___ + 7 = 22'. The missing variable should be obvious to any mathematician, but it's been erased from the system.",
    type: "clue",
    options: [
      { text: "Examine the system logs", next: "logs" }
    ]
  },
  "logs": {
    id: "logs",
    text: "The system logs show that the equation was last modified at 11:45 PM yesterday. According to the access records, all three researchers were in the building at that time.",
    type: "clue",
    options: [
      { text: "Solve the equation to identify the missing variable", next: "puzzle" }
    ]
  },
  "puzzle": {
    id: "puzzle",
    type: "puzzle",
    text: "To proceed with your investigation, you need to determine the missing variable in the equation: 3 * ___ + 7 = 22",
    puzzle: {
      question: "What is the value of the missing variable 'x' in the equation: 3x + 7 = 22?",
      answer: "5",
      hint: "Subtract 7 from both sides, then divide by 3."
    },
    options: []
  },
  "solution": {
    id: "solution",
    text: "You solve the equation and find that x = 5. Armed with this knowledge, you check the surveillance footage from 11:45 PM.",
    type: "narrative",
    options: [
      { text: "View the footage", next: "footage" }
    ]
  },
  "footage": {
    id: "footage",
    text: "The footage shows Dr. Lopez accessing the terminal at exactly 11:45 PM. She appears to be deleting something from the equation.",
    type: "clue",
    options: [
      { text: "Confront Dr. Lopez", next: "confrontation" }
    ]
  },
  "confrontation": {
    id: "confrontation",
    text: "When confronted, Dr. Lopez confesses immediately. 'I just wanted to delay the project until my own research caught up. I never meant to cause such a disruption.'",
    type: "dialogue",
    character: "Dr. Lopez",
    options: [
      { text: "Complete the investigation", next: "conclusion" }
    ]
  },
  "conclusion": {
    id: "conclusion",
    text: "Case closed! You've identified the missing variable as 5 and discovered that Dr. Lopez was responsible for removing it from the equation. The Academy can now continue their important work, and Dr. Lopez will face academic disciplinary action.",
    type: "conclusion",
    options: []
  }
};

// Sample story for the second case (just the structure for now)
const CASE_2_STORY: Record<string, StorySegment> = {
  "intro": {
    id: "intro",
    text: "The Museum of Mathematical Wonders reports that their exhibit on geometric shapes has been tampered with. Several key angles in their perfect triangle display have been altered.",
    type: "narrative",
    options: [
      { text: "Go to the museum", next: "museum" }
    ]
  },
  "museum": {
    id: "museum",
    text: "You arrive at the museum during closed hours. The curator meets you by the altered triangle exhibit.",
    type: "narrative",
    options: [
      { text: "Talk to the curator", next: "puzzle" }
    ]
  },
  "puzzle": {
    id: "puzzle",
    type: "puzzle",
    text: "The triangle's angles have been changed. Two angles are now 65° and 75°. To solve this case, you need to determine what the third angle should be.",
    puzzle: {
      question: "In a triangle, if two angles are 65° and 75°, what is the measure of the third angle?",
      answer: "40",
      hint: "The sum of all angles in a triangle is 180 degrees."
    },
    options: []
  },
  "conclusion": {
    id: "conclusion",
    text: "Case solved! You've determined that the third angle should be 40°. The security footage reveals that it was an overzealous student trying to test a theory who altered the display.",
    type: "conclusion",
    options: []
  }
};

// Sample story for the third case (just the structure for now)
const CASE_3_STORY: Record<string, StorySegment> = {
  "intro": {
    id: "intro",
    text: "The Casino Mathematica has reported unusual winning patterns at their probability table. They suspect someone is using advanced mathematics to beat the system.",
    type: "narrative",
    options: [
      { text: "Visit the casino", next: "casino" }
    ]
  },
  "casino": {
    id: "casino",
    text: "You arrive at the glitzy Casino Mathematica. The manager shows you to the probability table, where players must predict certain outcomes based on probability problems.",
    type: "narrative",
    options: [
      { text: "Observe the games", next: "puzzle" }
    ]
  },
  "puzzle": {
    id: "puzzle",
    type: "puzzle",
    text: "To catch the cheater, you need to understand the exact probabilities they're exploiting. Solve this problem: A bag contains 5 red marbles and 3 blue marbles. If two marbles are drawn without replacement, what is the probability (as a decimal rounded to 2 places) of drawing 2 red marbles?",
    puzzle: {
      question: "A bag contains 5 red marbles and 3 blue marbles. If two marbles are drawn without replacement, what is the probability of drawing 2 red marbles? (Answer as a decimal rounded to 2 places)",
      answer: "0.36",
      hint: "Calculate (5/8) × (4/7)."
    },
    options: []
  },
  "conclusion": {
    id: "conclusion",
    text: "Case cracked! You determined the exact probability of 0.36 and identified the mathematics professor who was using a hidden calculator to compute complex probabilities on the fly.",
    type: "conclusion",
    options: []
  }
};

// Map case IDs to their story structures
const CASE_STORIES: Record<string, Record<string, StorySegment>> = {
  "algebra-case-1": CASE_1_STORY,
  "geometry-case-1": CASE_2_STORY,
  "probability-case-1": CASE_3_STORY
};

const Investigation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, loadCase, currentCase, updateCaseProgress, completeCase, getCaseAccessStatus } = useFirebaseCases();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [segmentTransition, setSegmentTransition] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  
  // Check case access and load the story
  useEffect(() => {
    if (id) {
      // Check if user can access this case
      const accessStatus = getCaseAccessStatus(id);
      if (!accessStatus.canAccess) {
        setAccessError(accessStatus.message);
        return;
      }
      
      loadCase(id);
      
      // Get the story for this case
      const caseStory = CASE_STORIES[id];
      if (caseStory) {
        // Start from intro
        const introSegment = caseStory["intro"];
        setCurrentSegment(introSegment);
        setStoryHistory([introSegment]);
        
        // Update progress
        const thisCase = cases.find(c => c.id === id);
        if (thisCase && thisCase.progress === 0) {
          updateCaseProgress(id, 10); // Started the case
        }
      } else {
        // If no story is defined for this case ID, show a placeholder
        const placeholderIntro: StorySegment = {
          id: "placeholder-intro",
          text: "This case is still being prepared by the detective agency. Check back soon for updates.",
          type: "narrative",
          options: []
        };
        setCurrentSegment(placeholderIntro);
        setStoryHistory([placeholderIntro]);
      }
    }
  }, [id, loadCase, cases, updateCaseProgress, getCaseAccessStatus]);
  
  // Function to navigate to the next story segment
  const goToNextSegment = (nextId: string) => {
    setSegmentTransition(true);
    
    setTimeout(() => {
      const caseStory = CASE_STORIES[id || ""];
      if (caseStory && caseStory[nextId]) {
        const nextSegment = caseStory[nextId];
        setCurrentSegment(nextSegment);
        setStoryHistory(prev => [...prev, nextSegment]);
        
        // Update progress based on story progression
        const progressIncrement = 100 / Object.keys(caseStory).length;
        if (currentCase) {
          const newProgress = Math.min(
            Math.round(storyHistory.length * progressIncrement),
            100
          );
          updateCaseProgress(id || "", newProgress);
        }
        
        // Reset puzzle state if we're moving to a non-puzzle segment
        if (nextSegment.type !== "puzzle") {
          setUserAnswer("");
          setShowHint(false);
          setIsAnswerCorrect(null);
        }
        
        // If we've reached the conclusion, mark the case as complete
        if (nextSegment.type === "conclusion" && id) {
          completeCase(id);
          toast({
            title: t("cases.status.solved"),
            description: `${t("profile.xp")}: +${currentCase?.xpReward || 0}`,
          });
        }
      }
      
      setSegmentTransition(false);
    }, 300);
  };
  
  // Function to handle user input for puzzles
  const checkAnswer = () => {
    if (currentSegment?.type === "puzzle" && currentSegment.puzzle) {
      const isCorrect = userAnswer.trim().toLowerCase() === currentSegment.puzzle.answer.toLowerCase();
      setIsAnswerCorrect(isCorrect);
      
      if (isCorrect) {
        // Wait a moment to show the success message before proceeding
        setTimeout(() => {
          goToNextSegment("solution" in CASE_STORIES[id || ""] ? "solution" : "conclusion");
        }, 1000);
      }
    }
  };
  
  // Show access error if the case is locked
  if (accessError) {
    return (
      <div className="min-h-screen bg-noir flex flex-col">
        <NavBar />
        <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cases")}
              className="text-gray-400 hover:text-neon-cyan mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("common.back")}
            </Button>
            
            <Card className="noir-card border-red-700">
              <CardContent className="p-10 flex flex-col items-center text-center">
                <Lock className="text-red-500 h-16 w-16 mb-4" />
                <h2 className="text-2xl font-detective text-neon-pink mb-4">
                  {t("cases.status.locked")}
                </h2>
                <p className="text-gray-300 mb-6">
                  {accessError}
                </p>
                <Button
                  onClick={() => navigate("/cases")}
                  className="bg-neon-cyan hover:bg-neon-cyan/80 text-black"
                >
                  {t("common.back")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  // Show a loading state while we wait for the case to load
  if (!currentCase || !currentSegment) {
    return (
      <div className="min-h-screen bg-noir flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 rounded-full bg-neon-pink animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
            <p className="text-gray-400">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <NavBar />
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Case header */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/cases")}
              className="text-gray-400 hover:text-neon-cyan"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("common.back")}
            </Button>
            
            <div className="flex items-center">
              <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 mr-2">
                {t(`profile.stats.${currentCase.category}`)}
              </Badge>
              <Award className="h-4 w-4 text-neon-purple mr-1" />
              <span className="text-neon-purple text-sm">{currentCase.xpReward} XP</span>
            </div>
          </div>
          
          {/* Case title and progress */}
          <div className="mb-6">
            <h1 className="text-2xl font-detective text-neon-cyan mb-2">
              {currentCase.title}
            </h1>
            
            <div className="flex items-center text-xs text-gray-400 mb-2">
              <Clock className="h-3 w-3 mr-1" />
              <span>{t("profile.progress")}</span>
              <span className="ml-auto">{currentCase.progress}%</span>
            </div>
            <Progress value={currentCase.progress} className="h-1 bg-noir-accent" />
          </div>
          
          {/* Story segment */}
          <div 
            className={`transition-opacity duration-300 ${segmentTransition ? 'opacity-0' : 'opacity-100'}`}
          >
            <Card 
              className={`noir-card mb-6 border-l-4 ${
                currentSegment.type === "dialogue" ? "border-l-neon-purple" :
                currentSegment.type === "clue" ? "border-l-neon-cyan" :
                currentSegment.type === "puzzle" ? "border-l-neon-pink" :
                currentSegment.type === "conclusion" ? "border-l-green-600" :
                "border-l-gray-700"
              }`}
            >
              <CardContent className="pt-6">
                {currentSegment.type === "dialogue" && currentSegment.character && (
                  <div className="mb-2">
                    <span className="text-neon-purple font-medium">{currentSegment.character}:</span>
                  </div>
                )}
                
                <p className="text-gray-200 mb-6 leading-relaxed">
                  {currentSegment.text}
                </p>
                
                {/* Puzzle input */}
                {currentSegment.type === "puzzle" && currentSegment.puzzle && (
                  <div className="mt-6 mb-2">
                    <div className="bg-noir-accent p-4 rounded-md mb-4">
                      <h3 className="text-neon-pink font-medium mb-3">
                        {currentSegment.puzzle.question}
                      </h3>
                      
                      <div className="flex space-x-2">
                        <Input
                          value={userAnswer}
                          onChange={(e) => {
                            setUserAnswer(e.target.value);
                            setIsAnswerCorrect(null);
                          }}
                          placeholder="Your answer..."
                          className="bg-noir border-noir-accent focus:border-neon-cyan"
                        />
                        <Button 
                          onClick={checkAnswer}
                          className="bg-neon-cyan hover:bg-neon-cyan/80 text-black"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {t("mathTools.calculate")}
                        </Button>
                      </div>
                      
                      {isAnswerCorrect === false && (
                        <p className="text-red-400 mt-2 text-sm">
                          That's not quite right. Try again.
                        </p>
                      )}
                      
                      {isAnswerCorrect === true && (
                        <p className="text-green-400 mt-2 text-sm flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Correct! Well done, detective.
                        </p>
                      )}
                      
                      <div className="mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowHint(!showHint)}
                          className="text-gray-400 hover:text-neon-purple text-xs"
                        >
                          <Lightbulb className="h-3 w-3 mr-1" />
                          {showHint ? "Hide Hint" : "Need a Hint?"}
                        </Button>
                        
                        {showHint && currentSegment.puzzle.hint && (
                          <p className="text-gray-400 mt-2 text-sm italic">
                            {currentSegment.puzzle.hint}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-4 border-t border-noir-light pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/math-tools")}
                          className="text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/10"
                        >
                          <Calculator className="h-4 w-4 mr-1" />
                          {t("dashboard.openMathTools")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Options for next steps */}
                {currentSegment.options && currentSegment.options.length > 0 && (
                  <div className="space-y-2 mt-6">
                    {currentSegment.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => goToNextSegment(option.next)}
                        className="w-full justify-start text-left border-gray-700 hover:bg-noir-accent hover:text-neon-cyan"
                      >
                        {option.text}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Conclusion actions */}
                {currentSegment.type === "conclusion" && (
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        onClick={() => navigate("/cases")}
                        className="bg-neon-cyan hover:bg-neon-cyan/80 text-black"
                      >
                        Find Another Case
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/dashboard")}
                        className="border-gray-700 hover:bg-noir-accent"
                      >
                        Return to Dashboard
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Investigation;
