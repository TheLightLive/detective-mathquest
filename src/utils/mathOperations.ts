
import { evaluate, parse, simplify, derivative } from 'mathjs';

export type MathExpression = {
  type: 'number' | 'operator' | 'function' | 'group' | 'fraction' | 'sqrt' | 'power';
  value: string;
  children?: MathExpression[];
};

export type MathOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'sqrt' | 'power' | 'fraction';

export const formatExpression = (expr: MathExpression): string => {
  switch (expr.type) {
    case 'number':
      return expr.value;
    case 'operator':
      return expr.value;
    case 'function':
      return `${expr.value}(${expr.children?.map(formatExpression).join('') || ''})`;
    case 'group':
      return `${expr.children?.map(formatExpression).join('') || ''}`;
    case 'fraction':
      if (expr.children && expr.children.length === 2) {
        return `(${formatExpression(expr.children[0])})/(${formatExpression(expr.children[1])})`;
      }
      return '';
    case 'sqrt':
      if (expr.children && expr.children.length === 1) {
        return `sqrt(${formatExpression(expr.children[0])})`;
      }
      return '';
    case 'power':
      if (expr.children && expr.children.length === 2) {
        return `(${formatExpression(expr.children[0])})^(${formatExpression(expr.children[1])})`;
      }
      return '';
    default:
      return '';
  }
};

export const evaluateExpression = (expr: MathExpression): number => {
  try {
    const formattedExpr = formatExpression(expr);
    return evaluate(formattedExpr);
  } catch (error) {
    console.error('Error evaluating expression:', error);
    return NaN;
  }
};

export const parseStringToExpression = (input: string): MathExpression => {
  // This is a simplified parser for demonstration
  try {
    return { type: 'group', value: 'group', children: [{ type: 'number', value: input }] };
  } catch (error) {
    console.error('Error parsing expression:', error);
    return { type: 'number', value: '0' };
  }
};

// LaTeX specific utilities
export const latexToMathJs = (latex: string): string => {
  // This is a very simplified converter
  return latex
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^}]*)\}/g, "sqrt($1)")
    .replace(/\^{([^}]*)}/g, "^($1)")
    .replace(/\\sin/g, "sin")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\\ln/g, "ln")
    .replace(/\\log/g, "log")
    .replace(/\\pi/g, "pi")
    .replace(/\\times/g, "*")
    .replace(/\\div/g, "/");
};

export const evaluateLatex = (latex: string): number | string => {
  try {
    const mathJsExpr = latexToMathJs(latex);
    // Handle equations with variables
    if (mathJsExpr.includes('x') || mathJsExpr.includes('y')) {
      return mathJsExpr; // Return the expression as is
    }
    return evaluate(mathJsExpr);
  } catch (error) {
    console.error('Error evaluating LaTeX:', error);
    return "Error";
  }
};

// Improved solve equations with one variable
export const solveEquation = (equation: string): string => {
  try {
    // Check if it's an equation (contains =)
    if (!equation.includes('=')) {
      return "Not an equation";
    }
    
    const [leftSide, rightSide] = equation.split('=').map(s => s.trim());
    
    if (leftSide.includes('x') || rightSide.includes('x')) {
      // Move all terms to the left side
      const rearrangedEquation = `(${leftSide})-(${rightSide})`;
      
      try {
        // Simplify the expression
        const simplified = simplify(rearrangedEquation).toString();
        
        // For linear equations: ax + b = 0
        if (!simplified.includes('x^2') && !simplified.includes('x*x')) {
          // Extract coefficient of x and constant term
          let expr = parse(simplified);
          
          // Check if it's just x = constant
          if (simplified === 'x') {
            return 'x = 0';
          }
          
          // Handle ax + b form
          const terms = simplified.split('+').flatMap(t => t.split('-').map((st, i) => 
            i > 0 ? `-${st.trim()}` : st.trim()
          )).filter(t => t);
          
          let coefficientOfX = 0;
          let constantTerm = 0;
          
          terms.forEach(term => {
            if (term.includes('x')) {
              const coef = term.replace('x', '');
              coefficientOfX += coef === '' ? 1 : 
                                coef === '-' ? -1 : 
                                parseFloat(coef);
            } else {
              constantTerm += parseFloat(term) || 0;
            }
          });
          
          if (coefficientOfX === 0) {
            return constantTerm === 0 ? "All values of x are solutions" : "No solution";
          }
          
          const solution = -constantTerm / coefficientOfX;
          return `x = ${solution}`;
        } 
        // For quadratic equations: ax^2 + bx + c = 0
        else if (simplified.includes('x^2') || simplified.includes('x*x')) {
          // Extract coefficients
          let a = 0, b = 0, c = 0;
          
          // Simple parsing for quadratic equation
          const terms = simplified.replace(/\s/g, '')
            .replace(/-/g, '+-')
            .split('+')
            .filter(t => t);
          
          terms.forEach(term => {
            if (term.includes('x^2')) {
              const coef = term.replace('x^2', '');
              a += coef === '' ? 1 : 
                   coef === '-' ? -1 : 
                   parseFloat(coef);
            } else if (term.includes('x*x')) {
              const coef = term.replace('x*x', '');
              a += coef === '' ? 1 : 
                   coef === '-' ? -1 : 
                   parseFloat(coef);
            } else if (term.includes('x')) {
              const coef = term.replace('x', '');
              b += coef === '' ? 1 : 
                   coef === '-' ? -1 : 
                   parseFloat(coef);
            } else {
              c += parseFloat(term) || 0;
            }
          });
          
          // Quadratic formula
          const discriminant = b*b - 4*a*c;
          
          if (discriminant < 0) {
            return "No real solutions";
          } else if (discriminant === 0) {
            const solution = -b / (2*a);
            return `x = ${solution}`;
          } else {
            const solution1 = (-b + Math.sqrt(discriminant)) / (2*a);
            const solution2 = (-b - Math.sqrt(discriminant)) / (2*a);
            return `x = ${solution1}, x = ${solution2}`;
          }
        }
        
        return `Equation: ${simplified} = 0`;
      } catch (error) {
        console.error('Error solving equation:', error);
        return "Error simplifying equation";
      }
    }
    
    return "Cannot solve equation";
  } catch (error) {
    console.error('Error solving equation:', error);
    return "Error solving equation";
  }
};
