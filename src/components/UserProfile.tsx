
import React, { useState } from 'react';
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useFirebaseCases } from "@/contexts/FirebaseCasesContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, BookOpen, CheckCircle, Clock, Star, Trophy, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const UserProfile = () => {
  const { user } = useFirebaseAuth();
  const { cases } = useFirebaseCases();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user) {
    return null;
  }

  const completedCases = cases.filter(c => c.completed);
  const inProgressCases = cases.filter(c => c.status === "in_progress" && !c.completed);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="noir-card overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-neon-cyan/30 via-neon-purple/30 to-neon-pink/30"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-noir bg-noir">
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.name} />
              ) : (
                <AvatarFallback className="bg-neon-cyan text-black text-xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-detective text-white">{user.name}</h1>
                <Badge className="bg-neon-purple w-fit">{user.rank}</Badge>
              </div>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-noir-light">
          <TabsTrigger value="overview">{t("profile.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="stats">{t("profile.tabs.stats")}</TabsTrigger>
          <TabsTrigger value="cases">{t("profile.tabs.cases")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="noir-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-neon-purple" />
                  {t("profile.xp")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neon-purple">{user.xp}</p>
              </CardContent>
            </Card>
            
            <Card className="noir-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-neon-cyan" />
                  {t("profile.casesSolved")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neon-cyan">{user.cases_solved}</p>
              </CardContent>
            </Card>
            
            <Card className="noir-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-neon-pink" />
                  {t("profile.streak")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl text-neon-pink">{user.streak}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="noir-card">
            <CardHeader>
              <CardTitle>{t("profile.nextLevel")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-noir-light text-neon-cyan">
                      {t("profile.progress")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-neon-cyan">
                      {user.xp}/1000
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-noir-light">
                  <div
                    style={{ width: `${Math.min(user.xp / 10, 100)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-neon-cyan"
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="noir-card">
              <CardHeader>
                <CardTitle className="text-neon-cyan">{t("profile.stats.casesCompleted")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t("cases.difficulty.beginner")}</span>
                    <span className="font-mono">
                      {completedCases.filter(c => c.difficulty === "beginner").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t("cases.difficulty.intermediate")}</span>
                    <span className="font-mono">
                      {completedCases.filter(c => c.difficulty === "intermediate").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t("cases.difficulty.advanced")}</span>
                    <span className="font-mono">
                      {completedCases.filter(c => c.difficulty === "advanced").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t("cases.difficulty.expert")}</span>
                    <span className="font-mono">
                      {completedCases.filter(c => c.difficulty === "expert").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="noir-card">
              <CardHeader>
                <CardTitle className="text-neon-purple">{t("profile.stats.concept")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t("profile.stats.algebra")}</span>
                    <span className="font-mono">
                      {completedCases.filter(c => c.category === "algebra").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t("profile.stats.geometry")}</span>
                    <span className="font-mono">
                      {completedCases.filter(c => c.category === "geometry").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t("profile.stats.probability")}</span>
                    <span className="font-mono">
                      {completedCases.filter(c => c.category === "probability").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t("profile.stats.advanced")}</span>
                    <span className="font-mono">
                      {completedCases.filter(c => c.category === "advanced").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases">
          <Card className="noir-card">
            <CardHeader>
              <CardTitle className="text-neon-cyan">{t("profile.cases.inProgress")}</CardTitle>
            </CardHeader>
            <CardContent>
              {inProgressCases.length > 0 ? (
                <div className="space-y-4">
                  {inProgressCases.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 bg-noir-accent rounded-md">
                      <div>
                        <p className="text-white">{c.title}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{t("profile.cases.progress")}: {c.progress}%</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-neon-cyan text-neon-cyan">
                        {t("profile.cases.continue")}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">{t("profile.cases.noInProgress")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
