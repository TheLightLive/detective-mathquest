
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
      return `(${expr.children?.map(formatExpression).join('') || ''})`;
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
  // A real implementation would need a proper math expression parser
  try {
    return { type: 'group', value: 'group', children: [{ type: 'number', value: input }] };
  } catch (error) {
    console.error('Error parsing expression:', error);
    return { type: 'number', value: '0' };
  }
};
