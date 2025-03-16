
import { evaluate } from 'mathjs';

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

// Solve equations with one variable
export const solveEquation = (latex: string): string => {
  try {
    // Check if it's an equation (contains =)
    if (!latex.includes('=')) {
      return "Not an equation";
    }
    
    const mathJsExpr = latexToMathJs(latex);
    const [leftSide, rightSide] = mathJsExpr.split('=').map(s => s.trim());
    
    // Only support simple equations for now
    if (leftSide.includes('x')) {
      const result = evaluate(`solve(${leftSide} = ${rightSide}, x)`);
      if (Array.isArray(result)) {
        return result.map(r => `x = ${r}`).join(', ');
      }
      return `x = ${result}`;
    } else if (rightSide.includes('x')) {
      const result = evaluate(`solve(${rightSide} = ${leftSide}, x)`);
      if (Array.isArray(result)) {
        return result.map(r => `x = ${r}`).join(', ');
      }
      return `x = ${result}`;
    }
    
    return "Cannot solve equation";
  } catch (error) {
    console.error('Error solving equation:', error);
    return "Error solving equation";
  }
};
