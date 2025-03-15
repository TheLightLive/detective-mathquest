
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Award, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFirebaseCases } from '@/contexts/FirebaseCasesContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Case } from '@/types/case';

interface CaseAccessDeniedProps {
  caseId: string;
}

const CaseAccessDenied: React.FC<CaseAccessDeniedProps> = ({ caseId }) => {
  const { t } = useTranslation();
  const { cases, getMissingPrerequisites, getRequiredXp } = useFirebaseCases();
  const { user } = useFirebaseAuth();
  
  const currentCase = cases.find(c => c.id === caseId);
  const requiredXp = getRequiredXp(caseId);
  const userXp = user?.xp || 0;
  const xpNeeded = Math.max(0, requiredXp - userXp);
  
  const prerequisiteIds = getMissingPrerequisites(caseId);
  const prerequisiteCases = cases.filter(c => prerequisiteIds.includes(c.id));
  
  if (!currentCase) return null;
  
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link to="/cases" className="text-gray-400 hover:text-neon-cyan flex items-center mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back')} {t('navigation.cases')}
      </Link>
      
      <Card className="noir-card border-l-4 border-orange-600 mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-orange-400">
                {t('cases.status.locked')}
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                {currentCase.title}
              </CardDescription>
            </div>
            <Lock className="h-6 w-6 text-orange-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-300">
            {t('cases.access.locked')}
          </p>
          
          {/* XP Requirements */}
          {requiredXp > 0 && (
            <div className="bg-noir-accent p-4 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-neon-purple font-medium flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  {t('cases.details.requiredXp')}
                </h3>
                <span className="text-neon-purple">
                  {userXp} / {requiredXp} XP
                </span>
              </div>
              
              <Progress value={(userXp / requiredXp) * 100} className="h-1 mb-2" />
              
              {xpNeeded > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  {t('cases.access.needXp', { xp: xpNeeded })}
                </p>
              )}
            </div>
          )}
          
          {/* Prerequisites */}
          {prerequisiteCases.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-200 mb-3">
                {t('cases.details.requiredCases')}
              </h3>
              
              <div className="space-y-2">
                {prerequisiteCases.map(prereq => (
                  <Link to={`/investigation/${prereq.id}`} key={prereq.id}>
                    <Card className="bg-noir-light hover:bg-noir-accent transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-200">
                              {prereq.title}
                            </h4>
                            <div className="flex items-center mt-1">
                              <Badge className="mr-2 bg-gray-700">
                                {t(`cases.difficulty.${prereq.difficulty}`)}
                              </Badge>
                              <Badge className="bg-gray-700/50 text-gray-300">
                                {t(`profile.stats.${prereq.category}`)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-gray-400 flex items-center">
                            <Award className="h-4 w-4 mr-1 text-neon-cyan" />
                            <span className="text-neon-cyan">{prereq.xpReward} XP</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
        </CardContent>
        <CardFooter>
          <div className="flex flex-col sm:flex-row w-full space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              variant="default" 
              className="w-full sm:w-auto bg-neon-cyan text-black hover:bg-neon-cyan/80"
              asChild
            >
              <Link to="/cases">
                {t('common.back')} {t('navigation.cases')}
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              asChild
            >
              <Link to="/dashboard">
                {t('navigation.dashboard')}
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CaseAccessDenied;
