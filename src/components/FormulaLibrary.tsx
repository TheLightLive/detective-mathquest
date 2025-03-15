
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import katex from 'katex';
import 'katex/dist/katex.min.css';

const FormulaLibrary: React.FC = () => {
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

  return (
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
  );
};

export default FormulaLibrary;
