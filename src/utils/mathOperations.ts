
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
    
    if (leftSide.includes('x') || rightSide.includes('x') || 
        leftSide.includes('y') || rightSide.includes('y') ||
        leftSide.includes('z') || rightSide.includes('z')) {
      // Move all terms to the left side
      const rearrangedEquation = `(${leftSide})-(${rightSide})`;
      
      try {
        // Simplify the expression
        const simplified = simplify(rearrangedEquation).toString();
        
        // For linear equations: ax + b = 0
        if (!simplified.includes('x^2') && !simplified.includes('x*x') &&
            !simplified.includes('y^2') && !simplified.includes('y*y') &&
            !simplified.includes('z^2') && !simplified.includes('z*z')) {
          
          // Extract coefficient of x and constant term
          let expr = parse(simplified);
          
          // Check if it's just x = constant
          if (simplified === 'x') {
            return 'x = 0';
          } else if (simplified === 'y') {
            return 'y = 0';
          } else if (simplified === 'z') {
            return 'z = 0';
          }
          
          // Handle ax + b form for a single variable
          const variablesUsed = ['x', 'y', 'z'].filter(v => simplified.includes(v));
          
          if (variablesUsed.length === 1) {
            const variable = variablesUsed[0];
            const terms = simplified.split('+').flatMap(t => t.split('-').map((st, i) => 
              i > 0 ? `-${st.trim()}` : st.trim()
            )).filter(t => t);
            
            let coefficientOfVar = 0;
            let constantTerm = 0;
            
            terms.forEach(term => {
              if (term.includes(variable)) {
                const coef = term.replace(variable, '');
                coefficientOfVar += coef === '' ? 1 : 
                                  coef === '-' ? -1 : 
                                  parseFloat(coef);
              } else {
                constantTerm += parseFloat(term) || 0;
              }
            });
            
            if (coefficientOfVar === 0) {
              return constantTerm === 0 ? `All values of ${variable} are solutions` : "No solution";
            }
            
            const solution = -constantTerm / coefficientOfVar;
            return `${variable} = ${solution}`;
          } else {
            // For multiple variables, return the simplified form
            return `${simplified} = 0`;
          }
        } 
        // For quadratic equations: ax^2 + bx + c = 0
        else if ((simplified.includes('x^2') || simplified.includes('x*x')) &&
                !simplified.includes('y') && !simplified.includes('z')) {
          // Extract coefficients
          let a = 0, b = 0, c = 0;
          
          // Simple parsing for quadratic equation
          const terms = simplified.replace(/\s/g, '')
            .replace(/-/g, '+-')
            .split('+')
            .filter(t => t);
          
          terms.forEach(term => {
            if (term.includes('x^2') || term.includes('x*x')) {
              const coef = term.replace(/x\^2|x\*x/g, '');
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

// Function to solve systems of equations
export const solveSystem = (system: string): string => {
  try {
    // Parse the system of equations
    const equations = system.split('\n').map(eq => eq.trim()).filter(eq => eq);
    
    if (equations.length < 2) {
      return solveEquation(equations[0]);
    }
    
    // Check if it's a simple 2x2 linear system
    if (equations.length === 2) {
      const vars = new Set<string>();
      equations.forEach(eq => {
        ['x', 'y', 'z'].forEach(v => {
          if (eq.includes(v)) vars.add(v);
        });
      });
      
      // Handle 2x2 system with x and y
      if (vars.size === 2 && vars.has('x') && vars.has('y')) {
        let a1 = 0, b1 = 0, c1 = 0;
        let a2 = 0, b2 = 0, c2 = 0;
        
        // Parse first equation: a1x + b1y = c1
        const eq1 = equations[0];
        const [left1, right1] = eq1.split('=').map(s => s.trim());
        // Move everything to left side
        const simplified1 = simplify(`(${left1})-(${right1})`).toString();
        
        // Parse second equation: a2x + b2y = c2
        const eq2 = equations[1];
        const [left2, right2] = eq2.split('=').map(s => s.trim());
        // Move everything to left side
        const simplified2 = simplify(`(${left2})-(${right2})`).toString();
        
        // Extract coefficients from first equation
        simplified1.replace(/\s/g, '')
          .replace(/-/g, '+-')
          .split('+')
          .filter(t => t)
          .forEach(term => {
            if (term.includes('x')) {
              const coef = term.replace('x', '');
              a1 += coef === '' ? 1 : 
                   coef === '-' ? -1 : 
                   parseFloat(coef);
            } else if (term.includes('y')) {
              const coef = term.replace('y', '');
              b1 += coef === '' ? 1 : 
                   coef === '-' ? -1 : 
                   parseFloat(coef);
            } else {
              c1 -= parseFloat(term) || 0; // Note: we negate the constant term
            }
          });
        
        // Extract coefficients from second equation
        simplified2.replace(/\s/g, '')
          .replace(/-/g, '+-')
          .split('+')
          .filter(t => t)
          .forEach(term => {
            if (term.includes('x')) {
              const coef = term.replace('x', '');
              a2 += coef === '' ? 1 : 
                   coef === '-' ? -1 : 
                   parseFloat(coef);
            } else if (term.includes('y')) {
              const coef = term.replace('y', '');
              b2 += coef === '' ? 1 : 
                   coef === '-' ? -1 : 
                   parseFloat(coef);
            } else {
              c2 -= parseFloat(term) || 0; // Note: we negate the constant term
            }
          });
        
        // Solve using elimination method
        const determinant = a1 * b2 - a2 * b1;
        
        if (determinant === 0) {
          // Check if the system is consistent
          if (a1/a2 === b1/b2 && b1/b2 === c1/c2) {
            return "Infinite solutions (dependent equations)";
          } else {
            return "No solution (inconsistent system)";
          }
        }
        
        const x = (c1 * b2 - c2 * b1) / determinant;
        const y = (a1 * c2 - a2 * c1) / determinant;
        
        return `x = ${x.toFixed(4).replace(/\.?0+$/, '')}, y = ${y.toFixed(4).replace(/\.?0+$/, '')}`;
      }
    }
    
    // For more complex systems, return a simplified form
    return "System of equations: " + equations.join(', ');
  } catch (error) {
    console.error('Error solving system:', error);
    return "Error solving system of equations";
  }
};
