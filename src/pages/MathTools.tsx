
import React, { useState } from 'react';
import NavBar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Function, Plus, Minus, X, Divide, SquareRoot, Sigma, PiSquare } from "lucide-react";
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathTools: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [history, setHistory] = useState<Array<{input: string, output: string}>>([]);
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const { toast } = useToast();

  // Render LaTeX
  const renderLatex = (latex: string) => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      return 'LaTeX rendering error';
    }
  };

  // Evaluate mathematical expressions
  const evaluateExpression = () => {
    if (!input.trim()) {
      toast({
        title: "Empty Expression",
        description: "Please enter a mathematical expression",
        variant: "destructive",
      });
      return;
    }

    try {
      // Basic evaluation - in a real app, you'd want to use a safer evaluation method
      // like math.js or a custom parser
      
      // Prepare the input - replace common math notations
      let processedInput = input
        .replace(/\\sqrt\{([^}]+)\}/g, 'Math.sqrt($1)')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
        .replace(/\\pi/g, 'Math.PI')
        .replace(/\\sin/g, 'Math.sin')
        .replace(/\\cos/g, 'Math.cos')
        .replace(/\\tan/g, 'Math.tan')
        .replace(/\^/g, '**');
      
      // DANGER: eval is used for demonstration - in production, use a proper math library
      const result = eval(processedInput);
      
      // Format the result
      const resultStr = typeof result === 'number' 
        ? Number.isInteger(result) 
          ? result.toString() 
          : result.toFixed(4).replace(/\.?0+$/, '')
        : result.toString();
      
      // Create LaTeX version of the result
      const latexResult = input + ' = ' + resultStr;
      
      setOutput(latexResult);
      setHistory(prev => [...prev, { input, output: resultStr }]);
      
      toast({
        title: "Calculation Complete",
        description: `Result: ${resultStr}`,
      });
    } catch (error) {
      console.error('Evaluation error:', error);
      toast({
        title: "Calculation Error",
        description: "Could not evaluate the expression. Check syntax.",
        variant: "destructive",
      });
    }
  };

  // Add common symbols to input
  const addSymbol = (symbol: string) => {
    setInput(prev => prev + symbol);
  };

  // Clear the input
  const clearInput = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <NavBar />
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-detective text-neon-cyan mb-6">Math Tools</h1>
          
          <Tabs defaultValue="calculator" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-noir-accent">
              <TabsTrigger value="calculator" className="flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                LaTeX Calculator
              </TabsTrigger>
              <TabsTrigger value="formulas" className="flex items-center">
                <Function className="h-4 w-4 mr-2" />
                Formula Library
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-6">
              <Card className="noir-card">
                <CardHeader>
                  <CardTitle className="text-xl text-neon-cyan">LaTeX Calculator</CardTitle>
                  <CardDescription>
                    Perform calculations using LaTeX notation. Results are rendered in mathematical notation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="latex-input">Enter LaTeX Expression</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="latex-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="e.g., \sqrt{16} + 5"
                        className="flex-1 bg-noir-accent"
                      />
                      <Button onClick={clearInput} variant="outline">
                        Clear
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" onClick={() => addSymbol('+')}><Plus className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => addSymbol('-')}><Minus className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => addSymbol('*')}><X className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => addSymbol('/')}><Divide className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => addSymbol('\\sqrt{}')}><SquareRoot className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => addSymbol('\\pi')}><PiSquare className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={() => addSymbol('\\frac{}{}')}><span>a/b</span></Button>
                    <Button variant="outline" onClick={() => addSymbol('^')}><span>x^n</span></Button>
                  </div>
                  
                  <Button 
                    onClick={evaluateExpression} 
                    className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-black"
                  >
                    Calculate
                  </Button>
                  
                  {output && (
                    <div className="mt-6">
                      <Label>Result</Label>
                      <div 
                        className="p-4 bg-noir-accent rounded-md overflow-x-auto mt-2"
                        dangerouslySetInnerHTML={{ __html: renderLatex(output) }}
                      />
                    </div>
                  )}
                  
                  {history.length > 0 && (
                    <div className="mt-6">
                      <Label>History</Label>
                      <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                        {history.map((item, index) => (
                          <Card key={index} className="bg-noir-light">
                            <CardContent className="p-3">
                              <div className="text-sm text-gray-400">{item.input}</div>
                              <div className="font-medium text-neon-cyan">{item.output}</div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="formulas" className="space-y-6">
              <Card className="noir-card">
                <CardHeader>
                  <CardTitle className="text-xl text-neon-cyan">Formula Library</CardTitle>
                  <CardDescription>
                    Common mathematical formulas and identities for your investigations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-noir-light">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Algebra</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-neon-purple mb-1">Quadratic Formula</h4>
                          <div className="p-3 bg-noir-accent rounded-md overflow-x-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderLatex('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}') }} />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-neon-purple mb-1">Binomial Expansion</h4>
                          <div className="p-3 bg-noir-accent rounded-md overflow-x-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderLatex('(a + b)^n = \\sum_{k=0}^{n} {n \\choose k} a^{n-k} b^k') }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-noir-light">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Geometry</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-neon-purple mb-1">Circle Area</h4>
                          <div className="p-3 bg-noir-accent rounded-md overflow-x-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderLatex('A = \\pi r^2') }} />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-neon-purple mb-1">Pythagorean Theorem</h4>
                          <div className="p-3 bg-noir-accent rounded-md overflow-x-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderLatex('a^2 + b^2 = c^2') }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-noir-light">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Calculus</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-neon-purple mb-1">Derivative Rules</h4>
                          <div className="p-3 bg-noir-accent rounded-md overflow-x-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderLatex('\\frac{d}{dx}[x^n] = nx^{n-1}') }} />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-neon-purple mb-1">Integration Rules</h4>
                          <div className="p-3 bg-noir-accent rounded-md overflow-x-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderLatex('\\int x^n dx = \\frac{x^{n+1}}{n+1} + C, n \\neq -1') }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-noir-light">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Probability</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-neon-purple mb-1">Bayes' Theorem</h4>
                          <div className="p-3 bg-noir-accent rounded-md overflow-x-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderLatex('P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}') }} />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-neon-purple mb-1">Binomial Probability</h4>
                          <div className="p-3 bg-noir-accent rounded-md overflow-x-auto">
                            <div dangerouslySetInnerHTML={{ __html: renderLatex('P(X = k) = {n \\choose k} p^k (1-p)^{n-k}') }} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MathTools;
