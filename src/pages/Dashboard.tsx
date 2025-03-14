
import React from "react";
import { Link } from "react-router-dom";
import { 
  Award, 
  BarChart3, 
  Briefcase, 
  Calendar, 
  Clock, 
  Flame, 
  Star, 
  Sparkles 
} from "lucide-react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useFirebaseCases } from "@/contexts/FirebaseCasesContext";
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { user } = useFirebaseAuth();
  const { cases } = useFirebaseCases();

  const completedCases = cases.filter(c => c.completed).length;
  const inProgressCases = cases.filter(c => !c.completed && c.progress > 0).length;
  
  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <NavBar />
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome header */}
          <div className="mb-8">
            <h1 className="text-3xl font-detective text-neon-cyan">
              Welcome, Detective {user?.name.split(' ')[0]}
            </h1>
            <p className="text-gray-400 mt-2">
              Your investigation board awaits. What mystery will you solve today?
            </p>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="noir-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-300 text-sm font-normal flex items-center">
                  <Award className="h-4 w-4 mr-1 text-neon-cyan" />
                  Current Rank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-neon-cyan mr-2" />
                  <p className="text-xl font-medium text-neon-cyan">{user?.rank}</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {350 - (user?.xp || 0)} XP until next promotion
                </p>
                <Progress 
                  value={(user?.xp || 0) / 3.5} 
                  className="h-1 mt-2 bg-noir-accent" 
                />
              </CardContent>
            </Card>
            
            <Card className="noir-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-300 text-sm font-normal flex items-center">
                  <Flame className="h-4 w-4 mr-1 text-neon-pink" />
                  Detective Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <span className="text-3xl font-medium text-neon-pink">{user?.streak || 0}</span>
                  <span className="text-xl ml-1 text-gray-300">days</span>
                </div>
                <div className="flex space-x-1 mt-2">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 flex-1 rounded-full ${
                        i < (user?.streak || 0) % 7 ? 'bg-neon-pink' : 'bg-noir-accent'
                      }`}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="noir-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-300 text-sm font-normal flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1 text-neon-purple" />
                  Cases Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-medium text-neon-purple">{completedCases}</p>
                    <p className="text-xs text-gray-400">Solved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-neon-cyan">{inProgressCases}</p>
                    <p className="text-xs text-gray-400">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-medium text-neon-pink">{cases.length - completedCases - inProgressCases}</p>
                    <p className="text-xs text-gray-400">New</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent activity & Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="noir-card">
                <CardHeader>
                  <CardTitle className="text-gray-200 flex items-center text-lg">
                    <Clock className="h-5 w-5 mr-2 text-neon-cyan" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cases.slice(0, 3).map((caseItem) => (
                      <div key={caseItem.id} className="flex items-start">
                        <div className="h-9 w-9 rounded-full bg-noir-accent flex items-center justify-center text-neon-cyan mr-3">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium">{caseItem.title}</p>
                          <p className="text-gray-400 text-sm mt-0.5">
                            {caseItem.completed 
                              ? "Case completed!" 
                              : caseItem.progress > 0 
                                ? `${caseItem.progress}% completed` 
                                : "New case available"}
                          </p>
                          <div className="mt-1.5">
                            <Progress 
                              value={caseItem.progress} 
                              className="h-1 bg-noir-accent" 
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="noir-card">
                <CardHeader>
                  <CardTitle className="text-gray-200 flex items-center text-lg">
                    <Sparkles className="h-5 w-5 mr-2 text-neon-purple" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link 
                      to="/cases" 
                      className="flex items-center p-3 rounded-md bg-noir-accent text-gray-200 hover:bg-noir hover:text-neon-cyan"
                    >
                      <Briefcase className="h-5 w-5 mr-3 text-neon-cyan" />
                      <span>View All Cases</span>
                    </Link>
                    
                    <Link 
                      to="/calculator" 
                      className="flex items-center p-3 rounded-md bg-noir-accent text-gray-200 hover:bg-noir hover:text-neon-purple"
                    >
                      <Calendar className="h-5 w-5 mr-3 text-neon-purple" />
                      <span>Open Math Tools</span>
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center p-3 rounded-md bg-noir-accent text-gray-200 hover:bg-noir hover:text-neon-pink"
                    >
                      <Award className="h-5 w-5 mr-3 text-neon-pink" />
                      <span>View Achievements</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
