
import React, { useState } from 'react';
import NavBar from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FunctionSquare, BookOpen } from "lucide-react";
import VisualCalculator from '@/components/VisualCalculator';
import FormulaLibrary from '@/components/FormulaLibrary';
import MathLatexUnit from '@/components/MathLatexUnit';

const MathTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('calculator');

  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <NavBar />
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-detective text-neon-cyan mb-6">Math Tools</h1>
          
          <Tabs defaultValue="calculator" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-noir-accent">
              <TabsTrigger value="calculator" className="flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Math Engine
              </TabsTrigger>
              <TabsTrigger value="formulas" className="flex items-center">
                <FunctionSquare className="h-4 w-4 mr-2" />
                Formula Library
              </TabsTrigger>
              <TabsTrigger value="lessons" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Math Academy
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-4">
              <VisualCalculator />
            </TabsContent>
            
            <TabsContent value="formulas" className="space-y-4">
              <FormulaLibrary />
            </TabsContent>
            
            <TabsContent value="lessons" className="space-y-4">
              <MathLatexUnit />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MathTools;
