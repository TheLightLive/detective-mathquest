
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Lightbulb, 
  Calculator,
  Award,
  Send
} from "lucide-react";
import { useFirebaseCases } from "@/contexts/FirebaseCasesContext";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import NavBar from "@/components/NavBar";
import CaseAccessDenied from "@/components/CaseAccessDenied";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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

// Sample story for the first case - Algebra
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

// Sample story for the second case - Geometry
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
      { text: "Talk to the curator", next: "curator" }
    ]
  },
  "curator": {
    id: "curator",
    text: "Detective, thank you for coming so quickly. Our prized triangle exhibit has been altered. Two of the angles are now 65° and 75°, but the third angle has been completely erased. We need to restore it before the museum opens tomorrow.",
    type: "dialogue",
    character: "Curator Williams",
    options: [
      { text: "Examine security footage", next: "security" },
      { text: "Analyze the triangle", next: "analyze" }
    ]
  },
  "security": {
    id: "security",
    text: "The security footage shows a young student lingering at the exhibit after hours, making calculations and then altering the display. The curator identifies him as a mathematics prodigy who frequently visits.",
    type: "clue",
    options: [
      { text: "Analyze the triangle", next: "analyze" }
    ]
  },
  "analyze": {
    id: "analyze",
    text: "You examine the triangle closely. Two angles are marked: 65° and 75°. The third angle has been erased completely. You'll need to calculate what it should be.",
    type: "clue",
    options: [
      { text: "Calculate the missing angle", next: "puzzle" }
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
  "solution": {
    id: "solution",
    text: "You calculate that the third angle should be 40°. You make a note of this and prepare to track down the student who altered the exhibit.",
    type: "narrative",
    options: [
      { text: "Find the student", next: "student" }
    ]
  },
  "student": {
    id: "student",
    text: "You locate the student at a nearby coffee shop, surrounded by math textbooks. When you approach, he appears nervous but not surprised.",
    type: "narrative",
    options: [
      { text: "Question the student", next: "confrontation" }
    ]
  },
  "confrontation": {
    id: "confrontation",
    text: "I was testing a theory about perception of angles! I calculated that most people wouldn't notice if I altered the angles slightly, as long as they still summed to 180 degrees. It was just a psychological experiment, I swear!",
    type: "dialogue",
    character: "Student",
    options: [
      { text: "Complete the investigation", next: "conclusion" }
    ]
  },
  "conclusion": {
    id: "conclusion",
    text: "Case solved! You've determined that the third angle should be 40° and identified the culprit. The museum agrees not to press charges if the student helps create a new interactive exhibit about geometric principles.",
    type: "conclusion",
    options: []
  }
};

// Sample story for the third case - Probability
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
      { text: "Talk to the manager", next: "manager" }
    ]
  },
  "manager": {
    id: "manager",
    text: "Detective, one of our patrons has won 15 times in a row at our probability challenge table. The odds of that happening by chance are astronomically low. We suspect they're using some mathematical trick to predict outcomes.",
    type: "dialogue",
    character: "Casino Manager",
    options: [
      { text: "Observe the games", next: "observe" },
      { text: "Review the player's pattern", next: "pattern" }
    ]
  },
  "observe": {
    id: "observe",
    text: "You watch the probability tables for a while. A well-dressed professor-type consistently wins at a game involving colored marbles. He seems to be performing quick calculations before each round.",
    type: "clue",
    options: [
      { text: "Review the player's pattern", next: "pattern" }
    ]
  },
  "pattern": {
    id: "pattern",
    text: "The game involves drawing marbles from a bag and predicting specific outcomes. The professor seems to excel particularly at problems involving combinations and conditional probability.",
    type: "clue",
    options: [
      { text: "Try to solve a probability problem yourself", next: "puzzle" }
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
  "solution": {
    id: "solution",
    text: "You calculate the probability as 0.36 or about 36%. With this knowledge, you observe the professor more carefully and notice he's using a hidden calculator in his watch.",
    type: "narrative",
    options: [
      { text: "Confront the professor", next: "confrontation" }
    ]
  },
  "confrontation": {
    id: "confrontation",
    text: "When confronted, the professor admits, 'I'm just using mathematics, which isn't against the rules! I've developed a system for quickly calculating exact probabilities that most people can only estimate.'",
    type: "dialogue",
    character: "Professor",
    options: [
      { text: "Complete the investigation", next: "conclusion" }
    ]
  },
  "conclusion": {
    id: "conclusion",
    text: "Case cracked! While the professor wasn't technically cheating, the casino updates their rules to prohibit calculation devices. They also offer the professor a job designing new probability games for them, turning a potential problem into an asset.",
    type: "conclusion",
    options: []
  }
};

// Map case IDs to their story structures
const CASE_STORIES: Record<string, Record<string, StorySegment>> = {
  "algebra1": CASE_1_STORY,
  "geometry1": CASE_2_STORY,
  "probability1": CASE_3_STORY
};

const Investigation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, loadCase, currentCase, updateCaseProgress, completeCase, isCaseAccessible } = useFirebaseCases();
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [segmentTransition, setSegmentTransition] = useState(false);
  const [isAccessible, setIsAccessible] = useState<boolean | null>(null);
  
  // Load the case and initialize the story
  useEffect(() => {
    if (id) {
      loadCase(id);
      
      // Check if case is accessible
      const accessible = isCaseAccessible(id);
      setIsAccessible(accessible);
      
      // If accessible, load the story
      if (accessible) {
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
        }
      }
    }
  }, [id, loadCase, cases, updateCaseProgress, isCaseAccessible]);
  
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
            title: "Case Solved!",
            description: `You've earned ${currentCase?.xpReward || 0} XP for solving this case.`,
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
  
  // Show a loading state while we wait for the case to load
  if (isAccessible === null || (isAccessible && !currentCase)) {
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
            <p className="text-gray-400">Loading investigation...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show access denied component if case is locked
  if (isAccessible === false) {
    return (
      <div className="min-h-screen bg-noir flex flex-col">
        <NavBar />
        <CaseAccessDenied caseId={id || ""} />
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
              Back to Cases
            </Button>
            
            <div className="flex items-center">
              <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 mr-2">
                {currentCase.category}
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
              <span>Progress</span>
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
                          Submit
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
                          asChild
                          className="text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/10"
                        >
                          <Link to="/math-tools">
                            <Calculator className="h-4 w-4 mr-1" />
                            Open Math Tools
                          </Link>
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
