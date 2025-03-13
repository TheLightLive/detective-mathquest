
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Star, Award, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathLatexLessonProps {
  id: string;
  title: string;
  description: string;
  level: number;
  isLocked: boolean;
  isCompleted: boolean;
  xpReward: number;
  content: string;
  questions: MathLatexQuestion[];
}

interface MathLatexQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  latex?: string;
  explanation: string;
}

const MathLatexUnit: React.FC = () => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(null);
  const [showingExplanation, setShowingExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Example data for a detective math case
  const lessons: MathLatexLessonProps[] = [
    {
      id: "lesson-1",
      title: "The Case of the Missing Variable",
      description: "Investigate a system of linear equations to uncover the culprit.",
      level: 1,
      isLocked: false,
      isCompleted: false,
      xpReward: 25,
      content: "Detective, we have a situation at the local math museum. The famous equation that was on display has been tampered with. We need your mathematical expertise to solve this case. The original equation was balanced, but now it's not. Let's examine the evidence.",
      questions: [
        {
          id: "q1",
          question: "The equation on display was originally in the form:",
          latex: "3x + 4y = 18",
          options: [
            "3x + 4y = 18", 
            "2x + 5y = 20", 
            "4x - 3y = 12", 
            "5x + 2y = 15"
          ],
          correctAnswer: "3x + 4y = 18",
          explanation: "This is the correct form of the original equation. Your keen eye for detail has helped us confirm the original state."
        },
        {
          id: "q2",
          question: "We've found another clue: a second equation that works with the first to create a system. Identify which equation was part of the original system:",
          latex: "2x - y = 3",
          options: [
            "x + y = 10", 
            "2x - y = 3", 
            "x - 2y = 5", 
            "3x + y = 12"
          ],
          correctAnswer: "2x - y = 3",
          explanation: "Excellent detective work! This equation, combined with the first, creates a system that has a unique solution."
        },
        {
          id: "q3",
          question: "Now, solve the system to find the value of x and y that were hidden in the original display:",
          latex: "\\begin{cases} 3x + 4y = 18 \\\\ 2x - y = 3 \\end{cases}",
          options: [
            "x = 2, y = 3", 
            "x = 3, y = 2", 
            "x = 4, y = 1.5", 
            "x = 1, y = 3.75"
          ],
          correctAnswer: "x = 3, y = 3",
          explanation: "Brilliant! By solving this system of equations, you've uncovered the original values that were displayed: x = 3 and y = 3. This confirms our suspicions about the tampering."
        }
      ]
    },
    {
      id: "lesson-2",
      title: "Probability Puzzle at the Casino",
      description: "A mathematical heist requires your probability skills.",
      level: 2,
      isLocked: true,
      isCompleted: false,
      xpReward: 35,
      content: "The Casino Mathematica has reported unusual winning patterns at their probability table. They suspect someone is using advanced mathematics to beat the system. Your mission is to determine if there's cheating involved.",
      questions: [
        {
          id: "q1",
          question: "What is the probability of drawing 2 red cards in a row from a standard deck, without replacement?",
          latex: "P(\\text{2 red cards}) = \\frac{26}{52} \\cdot \\frac{25}{51} = \\frac{650}{2652} = \\frac{25}{102} \\approx 0.245",
          options: [
            "0.25", 
            "0.245", 
            "0.5", 
            "0.125"
          ],
          correctAnswer: "0.245",
          explanation: "Correct! There are 26 red cards in a 52-card deck. The probability of drawing a red card first is 26/52 = 1/2. After drawing a red card, there are 25 red cards left in a 51-card deck, so the probability of drawing another red card is 25/51. Multiplying these gives us (26/52) × (25/51) = 0.245."
        }
      ]
    }
  ];

  const renderLatex = (latex: string) => {
    return <div dangerouslySetInnerHTML={{ __html: katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true
    }) }} />;
  };

  const startLesson = (index: number) => {
    setCurrentLessonIndex(index);
    setUserAnswers({});
    setIsCorrect(null);
    setShowingExplanation(false);
  };

  const exitLesson = () => {
    setCurrentLessonIndex(null);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const checkAnswer = (question: MathLatexQuestion) => {
    const userAnswer = userAnswers[question.id];
    const result = userAnswer === question.correctAnswer;
    setIsCorrect(result);
    setShowingExplanation(true);
  };

  const currentLesson = currentLessonIndex !== null ? lessons[currentLessonIndex] : null;
  const currentQuestion = currentLesson?.questions[0];

  if (currentLesson && currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={exitLesson}
          className="mb-4"
        >
          ← Back to Units
        </Button>
        
        <Card className="noir-card border-l-4 border-l-neon-cyan mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-neon-cyan">{currentLesson.title}</CardTitle>
                <CardDescription className="text-gray-400 mt-1">{currentLesson.description}</CardDescription>
              </div>
              <Badge className="bg-neon-purple text-white">Level {currentLesson.level}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-200 mb-6">{currentLesson.content}</p>
            
            <div className="bg-noir-accent p-6 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-neon-pink mb-4">{currentQuestion.question}</h3>
              
              {currentQuestion.latex && (
                <div className="my-4 p-4 bg-noir-light rounded-md overflow-x-auto">
                  {renderLatex(currentQuestion.latex)}
                </div>
              )}
              
              <div className="space-y-3 mt-6">
                {currentQuestion.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant={userAnswers[currentQuestion.id] === option ? "default" : "outline"}
                    className={`w-full justify-start text-left ${
                      userAnswers[currentQuestion.id] === option 
                        ? "bg-neon-cyan text-black" 
                        : "border-gray-700 hover:border-neon-cyan"
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => checkAnswer(currentQuestion)}
                  disabled={!userAnswers[currentQuestion.id]}
                  className="bg-neon-cyan hover:bg-neon-cyan/80 text-black"
                >
                  Check Answer
                </Button>
              </div>
              
              {showingExplanation && (
                <div className={`mt-6 p-4 rounded-md ${
                  isCorrect ? "bg-green-900/20 border border-green-800" : "bg-red-900/20 border border-red-800"
                }`}>
                  <div className="flex items-start">
                    {isCorrect ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    ) : (
                      <Clock className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-medium ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                        {isCorrect ? "Correct!" : "Not quite right"}
                      </h4>
                      <p className="text-gray-300 mt-1">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
            <div className="flex items-center text-gray-400 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>5-10 minutes</span>
            </div>
            <div className="flex items-center text-neon-purple text-sm">
              <Award className="h-4 w-4 mr-1" />
              <span>{currentLesson.xpReward} XP</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-detective text-neon-cyan mb-6">Math Detective Academy</h1>
      <p className="text-gray-400 mb-8">Select a unit to begin your investigation</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map((lesson, index) => (
          <Card 
            key={lesson.id} 
            className={`noir-card border transition-transform hover:transform hover:scale-[1.02] ${
              lesson.isLocked 
                ? "border-gray-700 opacity-70" 
                : lesson.isCompleted 
                  ? "border-green-600" 
                  : "border-neon-cyan"
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl text-gray-200">
                  {lesson.title}
                </CardTitle>
                {lesson.isCompleted ? (
                  <Star className="h-5 w-5 text-green-500" />
                ) : (
                  <Badge className="bg-neon-purple text-white">Level {lesson.level}</Badge>
                )}
              </div>
              <CardDescription className="text-gray-400">{lesson.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>5-10 minutes</span>
                <div className="ml-auto flex items-center text-neon-purple">
                  <Award className="h-4 w-4 mr-1" />
                  <span>{lesson.xpReward} XP</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black"
                disabled={lesson.isLocked}
                onClick={() => startLesson(index)}
              >
                {lesson.isLocked ? (
                  <>
                    <span className="mr-2">Locked</span>
                  </>
                ) : lesson.isCompleted ? (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Review Case
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Start Case
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MathLatexUnit;
