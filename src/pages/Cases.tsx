
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowRight, 
  Award, 
  BookOpen, 
  Filter, 
  Search, 
  SlidersHorizontal,
  AlignLeft,
  Star,
  Lock,
  CheckCircle
} from "lucide-react";
import { useFirebaseCases } from "@/contexts/FirebaseCasesContext";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define module structure
const modules = [
  {
    id: "basics",
    title: "cases.modules.basics",
    icon: "📚",
    color: "bg-neon-cyan",
    unlocked: true
  },
  {
    id: "algebra",
    title: "cases.modules.algebra",
    icon: "➗",
    color: "bg-neon-purple",
    unlocked: true
  },
  {
    id: "geometry",
    title: "cases.modules.geometry",
    icon: "📐",
    color: "bg-neon-pink",
    unlocked: false
  },
  {
    id: "probability",
    title: "cases.modules.probability",
    icon: "🎲",
    color: "bg-green-500",
    unlocked: false
  },
  {
    id: "advanced",
    title: "cases.modules.advanced",
    icon: "🧠",
    color: "bg-orange-500",
    unlocked: false
  }
];

const Cases = () => {
  const { cases } = useFirebaseCases();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("modules");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  
  // Filter cases based on search term and filters
  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? c.category === categoryFilter : true;
    const matchesDifficulty = difficultyFilter ? c.difficulty === difficultyFilter : true;
    const matchesModule = selectedModule ? c.category === selectedModule : true;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesModule;
  });
  
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDifficultyFilter("");
    setSelectedModule(null);
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-600 hover:bg-green-700";
      case "intermediate": return "bg-yellow-600 hover:bg-yellow-700";
      case "advanced": return "bg-red-600 hover:bg-red-700";
      case "expert": return "bg-purple-600 hover:bg-purple-700";
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
  
  const getModuleProgress = (moduleId: string) => {
    const moduleCases = cases.filter(c => c.category === moduleId);
    const completedCases = moduleCases.filter(c => c.completed);
    return moduleCases.length > 0 ? (completedCases.length / moduleCases.length) * 100 : 0;
  };
  
  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <NavBar />
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-detective text-neon-cyan">
                {t("cases.modules.title")}
              </h1>
              <p className="text-gray-400 mt-1">
                {selectedModule ? t(`cases.modules.${selectedModule}`) : t("cases.modules.title")}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("cases.filters.search")}
                  className="pl-10 w-full md:w-60 bg-noir-accent border-noir-accent"
                />
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-noir-accent">
              <TabsTrigger value="modules">{t("cases.modules.title")}</TabsTrigger>
              <TabsTrigger value="list">{t("cases.filters.all")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="modules">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <Card 
                    key={module.id}
                    className={`noir-card relative overflow-hidden transition-transform hover:scale-[1.02] ${
                      !module.unlocked && "opacity-75"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-4xl mr-3">{module.icon}</span>
                          <div>
                            <h3 className="text-xl font-medium text-white">
                              {t(module.title)}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {getModuleProgress(module.id).toFixed(0)}% {t("profile.progress")}
                            </p>
                          </div>
                        </div>
                        {!module.unlocked && (
                          <Lock className="text-gray-500 h-6 w-6" />
                        )}
                      </div>
                      
                      <Progress 
                        value={getModuleProgress(module.id)} 
                        className="h-2 mb-4"
                      />
                      
                      <Button
                        onClick={() => {
                          if (module.unlocked) {
                            setSelectedModule(module.id);
                            setActiveTab("list");
                          }
                        }}
                        disabled={!module.unlocked}
                        className={`w-full ${module.color} text-black hover:opacity-90`}
                      >
                        {module.unlocked ? (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            {t("cases.details.startCase")}
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            {t("cases.status.locked")}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="flex items-center space-x-1 bg-noir-accent rounded-md p-1">
                  <Filter className="h-4 w-4 text-gray-400 ml-2" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent text-gray-300 text-sm py-1 pr-6 pl-1 rounded-md focus:outline-none"
                  >
                    <option value="">{t("cases.filters.all")}</option>
                    <option value="algebra">{t("profile.stats.algebra")}</option>
                    <option value="geometry">{t("profile.stats.geometry")}</option>
                    <option value="probability">{t("profile.stats.probability")}</option>
                    <option value="advanced">{t("profile.stats.advanced")}</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-1 bg-noir-accent rounded-md p-1">
                  <SlidersHorizontal className="h-4 w-4 text-gray-400 ml-2" />
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="bg-transparent text-gray-300 text-sm py-1 pr-6 pl-1 rounded-md focus:outline-none"
                  >
                    <option value="">{t("cases.filters.allDifficulty")}</option>
                    <option value="beginner">{t("cases.difficulty.beginner")}</option>
                    <option value="intermediate">{t("cases.difficulty.intermediate")}</option>
                    <option value="advanced">{t("cases.difficulty.advanced")}</option>
                    <option value="expert">{t("cases.difficulty.expert")}</option>
                  </select>
                </div>
                
                {(searchTerm || categoryFilter || difficultyFilter || selectedModule) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white"
                  >
                    {t("cases.filters.clearFilters")}
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
                            {t(`cases.difficulty.${caseItem.difficulty}`)}
                          </Badge>
                        </div>
                        
                        {/* Completed indicator */}
                        {caseItem.completed && (
                          <div className="absolute top-3 left-3">
                            <div className="bg-green-600 text-white rounded-full p-1">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                        
                        {/* Category */}
                        <div className="absolute bottom-3 left-3">
                          <Badge className={`border ${getCategoryColor(caseItem.category)}`}>
                            {t(`profile.stats.${caseItem.category}`)}
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
                            <span>{t("profile.progress")}</span>
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
                                    {t("cases.details.reviewCase")}
                                  </>
                                ) : caseItem.progress > 0 ? (
                                  <>
                                    <AlignLeft className="mr-2 h-4 w-4" />
                                    {t("cases.details.continueCase")}
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    {t("cases.details.startCase")}
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
                    <h3 className="text-xl font-medium text-gray-300 mb-2">{t("common.notFound")}</h3>
                    <p className="text-gray-400 mb-4">
                      {t("cases.filters.clearFilters")}
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      {t("cases.filters.clearFilters")}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Cases;
