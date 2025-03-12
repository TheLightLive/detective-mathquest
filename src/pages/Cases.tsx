
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Award, 
  BookOpen, 
  Filter, 
  Search, 
  SlidersHorizontal,
  AlignLeft,
  Star
} from "lucide-react";
import { useCases } from "@/contexts/CasesContext";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Cases = () => {
  const { cases } = useCases();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  
  // Filter cases based on search term and filters
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? c.category === categoryFilter : true;
    const matchesDifficulty = difficultyFilter ? c.difficulty === difficultyFilter : true;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
  
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDifficultyFilter("");
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-600 hover:bg-green-700";
      case "medium": return "bg-yellow-600 hover:bg-yellow-700";
      case "hard": return "bg-red-600 hover:bg-red-700";
      default: return "bg-gray-600 hover:bg-gray-700";
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "algebra": return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50";
      case "geometry": return "bg-neon-purple/20 text-neon-purple border-neon-purple/50";
      case "probability": return "bg-neon-pink/20 text-neon-pink border-neon-pink/50";
      case "advanced": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      default: return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };
  
  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <NavBar />
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-detective text-neon-cyan">
                Case Files
              </h1>
              <p className="text-gray-400 mt-1">
                Browse and solve mathematical mysteries
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search cases..."
                  className="pl-10 w-full md:w-60 bg-noir-accent border-noir-accent"
                />
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="flex items-center space-x-1 bg-noir-accent rounded-md p-1">
              <Filter className="h-4 w-4 text-gray-400 ml-2" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-gray-300 text-sm py-1 pr-6 pl-1 rounded-md focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="algebra">Algebra</option>
                <option value="geometry">Geometry</option>
                <option value="probability">Probability</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-1 bg-noir-accent rounded-md p-1">
              <SlidersHorizontal className="h-4 w-4 text-gray-400 ml-2" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-transparent text-gray-300 text-sm py-1 pr-6 pl-1 rounded-md focus:outline-none"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            {(searchTerm || categoryFilter || difficultyFilter) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-gray-400 hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          {/* Cases grid */}
          {filteredCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map((caseItem) => (
                <Card key={caseItem.id} className="noir-card overflow-hidden flex flex-col h-full">
                  <div className="h-40 bg-gradient-to-br from-noir-light to-noir relative">
                    {/* Decorative mathematical symbols */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      {caseItem.category === "algebra" && (
                        <div className="text-6xl font-bold">∑ x²</div>
                      )}
                      {caseItem.category === "geometry" && (
                        <div className="text-6xl font-bold">Δ Π</div>
                      )}
                      {caseItem.category === "probability" && (
                        <div className="text-6xl font-bold">P(A)</div>
                      )}
                      {caseItem.category === "advanced" && (
                        <div className="text-6xl font-bold">∫ f(x)</div>
                      )}
                    </div>
                    
                    {/* Difficulty indicator */}
                    <div className="absolute top-3 right-3">
                      <Badge className={`uppercase text-xs font-bold ${getDifficultyColor(caseItem.difficulty)}`}>
                        {caseItem.difficulty}
                      </Badge>
                    </div>
                    
                    {/* Completed indicator */}
                    {caseItem.completed && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-green-600 text-white rounded-full p-1">
                          <Star className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                    
                    {/* Category */}
                    <div className="absolute bottom-3 left-3">
                      <Badge className={`border ${getCategoryColor(caseItem.category)}`}>
                        {caseItem.category}
                      </Badge>
                    </div>
                    
                    {/* XP reward */}
                    <div className="absolute bottom-3 right-3 flex items-center bg-noir-accent rounded px-2 py-0.5 text-xs">
                      <Award className="h-3 w-3 text-neon-cyan mr-1" />
                      <span className="text-neon-cyan">{caseItem.xpReward} XP</span>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 flex flex-col pt-4">
                    <h3 className="text-lg font-medium text-gray-200 mb-2">
                      {caseItem.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 flex-1">
                      {caseItem.description}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{caseItem.progress}%</span>
                      </div>
                      <Progress value={caseItem.progress} className="h-1 mb-4 bg-noir-accent" />
                      
                      <Link to={`/investigation/${caseItem.id}`}>
                        <Button 
                          className={
                            caseItem.completed 
                              ? "w-full bg-green-600 hover:bg-green-700 text-white" 
                              : "w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black"
                          }
                        >
                          <div className="flex items-center justify-center">
                            {caseItem.completed ? (
                              <>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Review Case
                              </>
                            ) : caseItem.progress > 0 ? (
                              <>
                                <AlignLeft className="mr-2 h-4 w-4" />
                                Continue Case
                              </>
                            ) : (
                              <>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Start Investigation
                              </>
                            )}
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-noir-accent rounded-lg p-8 max-w-md mx-auto">
                <Search className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No cases found</h3>
                <p className="text-gray-400 mb-4">
                  No cases match your current search criteria. Try adjusting your filters.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cases;
