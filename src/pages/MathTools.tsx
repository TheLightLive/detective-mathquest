
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, SquareEqual, Sigma, Calculator, Divide } from 'lucide-react';
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MathLatexUnit from "@/components/MathLatexUnit";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathTools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [latexOutput, setLatexOutput] = useState("");
  const [calculatorTab, setCalculatorTab] = useState("basic");

  const evaluateExpression = () => {
    try {
      if (!expression.trim()) {
        setResult("");
        setLatexOutput("");
        return;
      }
      
      // Simple math expression evaluator
      // In a real app, you might want to use a math library like math.js
      // This is a simplified version for demo purposes
      // eslint-disable-next-line no-eval
      const calculatedResult = eval(expression.replace(/×/g, '*').replace(/÷/g, '/'));
      setResult(calculatedResult.toString());
      
      // Generate LaTeX output
      let latexExpression = expression
        .replace(/\*/g, '\\times ')
        .replace(/\//g, '\\div ')
        .replace(/\+/g, '+')
        .replace(/-/g, '-');
      
      const latexResult = `${latexExpression} = ${calculatedResult}`;
      setLatexOutput(latexResult);
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Error",
        description: "Please check your expression and try again.",
        variant: "destructive",
      });
    }
  };

  const insertSymbol = (symbol: string) => {
    setExpression(prev => prev + symbol);
  };

  const clearCalculator = () => {
    setExpression("");
    setResult("");
    setLatexOutput("");
  };

  const renderLatex = (latex: string) => {
    return <div dangerouslySetInnerHTML={{ __html: katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true
    }) }} />;
  };

  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <NavBar />
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-neon-cyan mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </Button>
          
          <h1 className="text-3xl font-detective text-neon-cyan mb-2">
            {t("navigation.mathTools")}
          </h1>
          <p className="text-gray-400 mb-6">
            Advanced mathematical tools to help with your investigations
          </p>
          
          <Tabs defaultValue="calculator" className="space-y-6">
            <TabsList>
              <TabsTrigger value="calculator">
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </TabsTrigger>
              <TabsTrigger value="lessons">
                <Sigma className="h-4 w-4 mr-2" />
                Math Lessons
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="noir-card">
                  <CardHeader>
                    <CardTitle className="text-neon-cyan">
                      Math Calculator
                    </CardTitle>
                    <CardDescription>
                      Perform calculations with beautiful LaTeX output
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={calculatorTab} onValueChange={setCalculatorTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic">
                        <div className="mb-4">
                          <Input
                            value={expression}
                            onChange={(e) => setExpression(e.target.value)}
                            placeholder="Enter expression (e.g., 2 + 2)"
                            className="mb-2"
                          />
                          
                          <div className="grid grid-cols-4 gap-2 mb-4">
                            {['7', '8', '9', '+'].map(symbol => (
                              <Button
                                key={symbol}
                                variant="outline"
                                onClick={() => insertSymbol(symbol)}
                                className="border-gray-700 hover:bg-noir-accent"
                              >
                                {symbol}
                              </Button>
                            ))}
                            {['4', '5', '6', '-'].map(symbol => (
                              <Button
                                key={symbol}
                                variant="outline"
                                onClick={() => insertSymbol(symbol)}
                                className="border-gray-700 hover:bg-noir-accent"
                              >
                                {symbol}
                              </Button>
                            ))}
                            {['1', '2', '3', '*'].map(symbol => (
                              <Button
                                key={symbol}
                                variant="outline"
                                onClick={() => insertSymbol(symbol)}
                                className="border-gray-700 hover:bg-noir-accent"
                              >
                                {symbol === '*' ? '×' : symbol}
                              </Button>
                            ))}
                            {['0', '.', '=', '/'].map(symbol => (
                              <Button
                                key={symbol}
                                variant="outline"
                                onClick={() => symbol === '=' ? evaluateExpression() : insertSymbol(symbol)}
                                className={`border-gray-700 hover:bg-noir-accent ${symbol === '=' ? 'bg-neon-cyan text-black hover:bg-neon-cyan/80' : ''}`}
                              >
                                {symbol === '/' ? '÷' : symbol}
                              </Button>
                            ))}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={clearCalculator}
                              className="border-gray-700 hover:bg-noir-accent"
                            >
                              Clear
                            </Button>
                            <Button 
                              onClick={evaluateExpression}
                              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black ml-auto"
                            >
                              <SquareEqual className="h-4 w-4 mr-1" />
                              Calculate
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="advanced">
                        <div className="mb-4">
                          <Input
                            value={expression}
                            onChange={(e) => setExpression(e.target.value)}
                            placeholder="Enter expression (e.g., Math.sqrt(16))"
                            className="mb-2"
                          />
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <Button
                              variant="outline"
                              onClick={() => insertSymbol("Math.sqrt(")}
                              className="border-gray-700 hover:bg-noir-accent"
                            >
                              √(x)
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => insertSymbol("Math.pow(")}
                              className="border-gray-700 hover:bg-noir-accent"
                            >
                              x^y
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => insertSymbol("Math.sin(")}
                              className="border-gray-700 hover:bg-noir-accent"
                            >
                              sin(x)
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => insertSymbol("Math.cos(")}
                              className="border-gray-700 hover:bg-noir-accent"
                            >
                              cos(x)
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => insertSymbol("Math.log(")}
                              className="border-gray-700 hover:bg-noir-accent"
                            >
                              log(x)
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => insertSymbol("Math.PI")}
                              className="border-gray-700 hover:bg-noir-accent"
                            >
                              π
                            </Button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              onClick={clearCalculator}
                              className="border-gray-700 hover:bg-noir-accent"
                            >
                              Clear
                            </Button>
                            <Button 
                              onClick={evaluateExpression}
                              className="bg-neon-purple hover:bg-neon-purple/80 text-white ml-auto"
                            >
                              <SquareEqual className="h-4 w-4 mr-1" />
                              Calculate
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    {result && (
                      <div className="mt-6 p-4 bg-noir-accent rounded-md">
                        <div className="text-sm text-gray-400 mb-2">Result:</div>
                        <div className="text-2xl text-neon-cyan mb-4">{result}</div>
                        
                        {latexOutput && (
                          <div className="p-4 bg-noir-light rounded-md overflow-x-auto">
                            {renderLatex(latexOutput)}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="noir-card">
                  <CardHeader>
                    <CardTitle className="text-neon-pink">
                      LaTeX Reference
                    </CardTitle>
                    <CardDescription>
                      Common LaTeX symbols used in mathematical investigations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-noir-accent rounded-md">
                        <div className="text-sm text-gray-400 mb-1">Algebra:</div>
                        {renderLatex("x^2 + 3x - 4 = 0")}
                      </div>
                      <div className="p-3 bg-noir-accent rounded-md">
                        <div className="text-sm text-gray-400 mb-1">Fractions:</div>
                        {renderLatex("\\frac{a+b}{c+d}")}
                      </div>
                      <div className="p-3 bg-noir-accent rounded-md">
                        <div className="text-sm text-gray-400 mb-1">Square Root:</div>
                        {renderLatex("\\sqrt{x^2 + y^2}")}
                      </div>
                      <div className="p-3 bg-noir-accent rounded-md">
                        <div className="text-sm text-gray-400 mb-1">Summation:</div>
                        {renderLatex("\\sum_{i=1}^{n} i^2")}
                      </div>
                      <div className="p-3 bg-noir-accent rounded-md">
                        <div className="text-sm text-gray-400 mb-1">Integration:</div>
                        {renderLatex("\\int_{a}^{b} f(x) dx")}
                      </div>
                      <div className="p-3 bg-noir-accent rounded-md">
                        <div className="text-sm text-gray-400 mb-1">Matrices:</div>
                        {renderLatex("\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="lessons">
              <MathLatexUnit />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MathTools;
