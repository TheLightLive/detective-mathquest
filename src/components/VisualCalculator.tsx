
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { evaluate } from 'mathjs';
import { 
  Calculator, Plus, Minus, X, Divide, PiSquare, 
  BarChart, Brackets, Equal, Sigma, Delete
} from "lucide-react";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { evaluateLatex, solveEquation } from '@/utils/mathOperations';

interface MathElement {
  type: 'number' | 'operator' | 'function' | 'fraction' | 'sqrt' | 'power' | 'variable' | 'placeholder' | 'parentheses' | 'superscript' | 'subscript';
  value: string;
  id: string;
  parentId?: string;
  children: string[];
  selected?: boolean;
  cursorPosition?: number;
}

type MathElementMap = Record<string, MathElement>;

const VisualCalculator: React.FC = () => {
  const [elements, setElements] = useState<MathElementMap>({
    'root': {
      type: 'parentheses',
      value: 'parentheses',
      id: 'root',
      children: [],
      cursorPosition: 0
    }
  });
  const [activeElementId, setActiveElementId] = useState<string>('root');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<Array<{input: string, output: string}>>([]);
  const [currentTab, setCurrentTab] = useState<string>('main');
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const renderLatex = (latex: string) => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
        output: 'html'
      });
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      return 'LaTeX rendering error';
    }
  };

  const elementToLatex = (elementId: string): string => {
    const element = elements[elementId];
    if (!element) return '';

    const addCursor = (latex: string): string => {
      if (element.id === selectedElement && element.cursorPosition !== undefined) {
        const pos = Math.min(element.cursorPosition, latex.length);
        return `${latex.slice(0, pos)}\\textcolor{cyan}{|}${latex.slice(pos)}`;
      }
      
      if (element.id === hoveredElementId) {
        return `\\textcolor{green}{${latex}}`;
      }
      
      return latex;
    };

    switch (element.type) {
      case 'number':
      case 'variable':
        return addCursor(element.value);
        
      case 'operator':
        const opMap: Record<string, string> = {
          '*': '\\times',
          '/': '\\div',
          '+': '+',
          '-': '-',
          '=': '='
        };
        return addCursor(opMap[element.value] || element.value);
        
      case 'function':
        let funcName = element.value;
        const isTrigFunc = ['sin', 'cos', 'tan', 'cot', 'asin', 'acos', 'atan'].includes(funcName);
        
        if (isTrigFunc) {
          funcName = `\\${funcName}`;
        } else {
          funcName = `\\operatorname{${funcName}}`;
        }
        
        if (element.children && element.children.length > 0) {
          const args = element.children.map(elementToLatex).join(',');
          const result = `${funcName}\\left(${args}\\right)`;
          // For function, add cursor inside by default
          if (element.id === selectedElement && element.cursorPosition === undefined) {
            return result.replace(args, `${args}\\textcolor{cyan}{|}`);
          }
          return result;
        }
        
        // Empty function with cursor inside parentheses
        if (element.id === selectedElement) {
          return `${funcName}\\left(\\textcolor{cyan}{|}\\right)`;
        }
        return `${funcName}\\left(\\right)`;
        
      case 'fraction':
        if (element.children && element.children.length === 2) {
          const numerator = elementToLatex(element.children[0]);
          const denominator = elementToLatex(element.children[1]);
          
          // If selected but cursor position not specified, show cursor in numerator
          if (element.id === selectedElement && element.cursorPosition === undefined) {
            return `\\frac{${numerator}\\textcolor{cyan}{|}}{${denominator}}`;
          }
          
          return addCursor(`\\frac{${numerator}}{${denominator}}`);
        }
        
        // Empty fraction with cursor in numerator
        if (element.id === selectedElement) {
          return `\\frac{\\textcolor{cyan}{|}}{}`; 
        }
        return addCursor('\\frac{}{}');
        
      case 'sqrt':
        if (element.children && element.children.length === 1) {
          const content = elementToLatex(element.children[0]);
          
          // If selected but cursor position not specified, show cursor inside
          if (element.id === selectedElement && element.cursorPosition === undefined) {
            return `\\sqrt{${content}\\textcolor{cyan}{|}}`;
          }
          
          return addCursor(`\\sqrt{${content}}`);
        }
        
        // Empty sqrt with cursor inside
        if (element.id === selectedElement) {
          return `\\sqrt{\\textcolor{cyan}{|}}`; 
        }
        return addCursor('\\sqrt{}');
        
      case 'power':
        if (element.children && element.children.length === 2) {
          const base = elementToLatex(element.children[0]);
          const exponent = elementToLatex(element.children[1]);
          
          // If selected but cursor position not specified, show cursor in base
          if (element.id === selectedElement && element.cursorPosition === undefined) {
            return `{${base}\\textcolor{cyan}{|}}^{${exponent}}`;
          }
          
          return addCursor(`{${base}}^{${exponent}}`);
        }
        
        // Empty power with cursor in base
        if (element.id === selectedElement) {
          return `{\\textcolor{cyan}{|}}^{}`; 
        }
        return addCursor('{}^{}');
        
      case 'parentheses':
        if (element.children && element.children.length > 0) {
          const content = element.children.map(elementToLatex).join('');
          
          if (element.id === 'root') {
            // For root element, add cursor at end if selected
            if (element.id === selectedElement) {
              return `${content}\\textcolor{cyan}{|}`;
            }
            return content;
          }
          
          // If selected but cursor position not specified, show cursor inside
          if (element.id === selectedElement && element.cursorPosition === undefined) {
            return `\\left(${content}\\textcolor{cyan}{|}\\right)`;
          }
          
          return addCursor(`\\left(${content}\\right)`);
        }
        
        // Empty parentheses with cursor inside
        if (element.id === selectedElement && element.id !== 'root') {
          return `\\left(\\textcolor{cyan}{|}\\right)`;
        } else if (element.id === 'root' && element.id === selectedElement) {
          return `\\textcolor{cyan}{|}`;
        } else if (element.id === 'root') {
          return '';
        }
        
        return addCursor('\\left(\\right)');
        
      case 'superscript':
        if (element.children && element.children.length === 1) {
          const content = elementToLatex(element.children[0]);
          
          // If selected but cursor position not specified, show cursor inside
          if (element.id === selectedElement && element.cursorPosition === undefined) {
            return `^{${content}\\textcolor{cyan}{|}}`;
          }
          
          return addCursor(`^{${content}}`);
        }
        
        // Empty superscript with cursor inside
        if (element.id === selectedElement) {
          return `^{\\textcolor{cyan}{|}}`; 
        }
        return addCursor('^{}');
        
      case 'subscript':
        if (element.children && element.children.length === 1) {
          const content = elementToLatex(element.children[0]);
          
          // If selected but cursor position not specified, show cursor inside
          if (element.id === selectedElement && element.cursorPosition === undefined) {
            return `_{${content}\\textcolor{cyan}{|}}`;
          }
          
          return addCursor(`_{${content}}`);
        }
        
        // Empty subscript with cursor inside
        if (element.id === selectedElement) {
          return `_{\\textcolor{cyan}{|}}`; 
        }
        return addCursor('_{}');
        
      case 'placeholder':
        if (element.id === selectedElement) {
          return '\\textcolor{cyan}{\\square|}';
        }
        return '\\square';
        
      default:
        return '';
    }
  };

  const getParentInfo = (elementId: string): {parentId: string, index: number} => {
    const parent = Object.values(elements).find(el => 
      el.children && el.children.includes(elementId)
    );
    
    if (parent) {
      const index = parent.children.indexOf(elementId);
      return { parentId: parent.id, index };
    }
    
    return { parentId: 'root', index: -1 };
  };

  const addElement = (type: MathElement['type'], value: string) => {
    const newId = generateId();
    const newElement: MathElement = { 
      type,
      value,
      id: newId,
      children: [],
      cursorPosition: value.length
    };
    
    let newElements = { ...elements };
    const active = activeElementId ? newElements[activeElementId] : null;
    
    if (!active) {
      newElements.root.children.push(newId);
      newElements[newId] = newElement;
    } else if (active.type === 'placeholder') {
      const { parentId, index } = getParentInfo(activeElementId);
      if (parentId && index !== -1) {
        const parent = newElements[parentId];
        parent.children[index] = newId;
        newElements[newId] = newElement;
        delete newElements[activeElementId];
      }
    } else if (active.type === 'function' && active.children.length === 0) {
      active.children.push(newId);
      newElements[newId] = newElement;
    } else if (active.type === 'parentheses' || active.type === 'sqrt' || 
               active.type === 'fraction' || active.type === 'power') {
      if (active.children.length === 0 || 
          (active.type === 'fraction' && active.children.length < 2) ||
          (active.type === 'power' && active.children.length < 2)) {
        active.children.push(newId);
        newElements[newId] = newElement;
      } else {
        const { parentId, index } = getParentInfo(activeElementId);
        if (parentId && index !== -1) {
          const parent = newElements[parentId];
          parent.children.splice(index + 1, 0, newId);
          newElements[newId] = newElement;
        }
      }
    } else {
      const { parentId, index } = getParentInfo(activeElementId);
      if (parentId && index !== -1) {
        const parent = newElements[parentId];
        parent.children.splice(index + 1, 0, newId);
        newElements[newId] = newElement;
      } else {
        newElements.root.children.push(newId);
        newElements[newId] = newElement;
      }
    }
    
    setElements(newElements);
    setActiveElementId(newId);
    setSelectedElement(newId);
  };

  const addStructure = (type: 'fraction' | 'sqrt' | 'power' | 'parentheses' | 'function', funcName?: string) => {
    const newId = generateId();
    const placeholderId1 = generateId();
    const placeholderId2 = type === 'fraction' || type === 'power' ? generateId() : undefined;
    
    const placeholder1: MathElement = {
      type: 'placeholder',
      value: '',
      id: placeholderId1,
      parentId: newId,
      children: []
    };
    
    let placeholder2: MathElement | undefined;
    if (placeholderId2) {
      placeholder2 = {
        type: 'placeholder',
        value: '',
        id: placeholderId2,
        parentId: newId,
        children: []
      };
    }
    
    const childrenIds = placeholderId2 
      ? [placeholderId1, placeholderId2] 
      : type === 'function' ? [] : [placeholderId1];
      
    const newElement: MathElement = {
      type,
      value: type === 'function' ? funcName || 'sin' : type,
      id: newId,
      children: childrenIds
    };
    
    let newElements = { 
      ...elements,
      [newId]: newElement,
      [placeholderId1]: placeholder1
    };
    
    if (placeholder2) {
      newElements[placeholderId2!] = placeholder2;
    }
    
    const active = activeElementId ? newElements[activeElementId] : null;
    
    if (!active) {
      newElements.root.children.push(newId);
    } else if (active.type === 'placeholder') {
      const { parentId, index } = getParentInfo(activeElementId);
      if (parentId && index !== -1) {
        const parent = newElements[parentId];
        parent.children[index] = newId;
        delete newElements[activeElementId];
      }
    } else {
      const { parentId, index } = getParentInfo(activeElementId);
      if (parentId && index !== -1) {
        const parent = newElements[parentId];
        parent.children.splice(index + 1, 0, newId);
      } else {
        newElements.root.children.push(newId);
      }
    }
    
    setElements(newElements);
    
    if (type === 'function') {
      setActiveElementId(newId);
      setSelectedElement(newId);
    } else {
      setActiveElementId(placeholderId1);
      setSelectedElement(placeholderId1);
    }
  };

  const elementToEvaluable = (elementId: string): string => {
    const element = elements[elementId];
    if (!element) return '';

    switch (element.type) {
      case 'number':
        return element.value;
        
      case 'variable':
        if (element.value === 'pi') return 'pi';
        if (element.value === 'e') return 'e';
        return element.value;
        
      case 'operator':
        return element.value;
        
      case 'function':
        if (element.children && element.children.length > 0) {
          return `${element.value}(${element.children.map(elementToEvaluable).join(',')})`;
        }
        return `${element.value}()`;
        
      case 'fraction':
        if (element.children && element.children.length === 2) {
          return `(${elementToEvaluable(element.children[0])})/(${elementToEvaluable(element.children[1])})`;
        }
        return '0';
        
      case 'sqrt':
        if (element.children && element.children.length === 1) {
          return `sqrt(${elementToEvaluable(element.children[0])})`;
        }
        return 'sqrt(0)';
        
      case 'power':
        if (element.children && element.children.length === 2) {
          return `(${elementToEvaluable(element.children[0])})^(${elementToEvaluable(element.children[1])})`;
        }
        return '0';
        
      case 'parentheses':
        if (element.children && element.children.length > 0) {
          if (element.id === 'root') {
            return element.children.map(elementToEvaluable).join('');
          }
          return `(${element.children.map(elementToEvaluable).join('')})`;
        }
        return element.id === 'root' ? '0' : '()';
        
      case 'superscript':
        if (element.children && element.children.length === 1) {
          return `^(${elementToEvaluable(element.children[0])})`;
        }
        return '';
        
      case 'subscript':
        if (element.children && element.children.length === 1) {
          return `_(${elementToEvaluable(element.children[0])})`;
        }
        return '';
        
      case 'placeholder':
        return '0';
        
      default:
        return '';
    }
  };

  const findNextElement = (direction: 'prev' | 'next'): string | null => {
    const flattenElements = (root: string = 'root'): string[] => {
      const result: string[] = [root];
      const element = elements[root];
      
      if (element && element.children) {
        for (const childId of element.children) {
          result.push(...flattenElements(childId));
        }
      }
      
      return result;
    };
    
    const flatten = flattenElements();
    const currentIndex = flatten.indexOf(activeElementId);
    
    if (currentIndex === -1) return 'root';
    
    if (direction === 'next') {
      return currentIndex < flatten.length - 1 ? flatten[currentIndex + 1] : flatten[0];
    } else {
      return currentIndex > 0 ? flatten[currentIndex - 1] : flatten[flatten.length - 1];
    }
  };

  const navigateStructure = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!activeElementId) {
      setActiveElementId('root');
      setSelectedElement('root');
      return;
    }
    
    const activeElement = elements[activeElementId];
    if (!activeElement) return;
    
    if (direction === 'left' || direction === 'right') {
      const { parentId, index } = getParentInfo(activeElementId);
      if (!parentId) return;
      
      const parent = elements[parentId];
      if (!parent || !parent.children) return;
      
      const newIndex = direction === 'left' 
        ? Math.max(0, index - 1)
        : Math.min(parent.children.length - 1, index + 1);
        
      if (newIndex !== index) {
        const newActiveId = parent.children[newIndex];
        setActiveElementId(newActiveId);
        setSelectedElement(newActiveId);
      }
    } else if (direction === 'up') {
      const { parentId } = getParentInfo(activeElementId);
      if (parentId && elements[parentId]) {
        setActiveElementId(parentId);
        setSelectedElement(parentId);
      }
    } else if (direction === 'down') {
      if (activeElement.children && activeElement.children.length > 0) {
        const firstChildId = activeElement.children[0];
        setActiveElementId(firstChildId);
        setSelectedElement(firstChildId);
      }
    }
  };

  const calculateResult = () => {
    try {
      const inputLatex = elementToLatex('root');
      
      const mathJsExpression = elementToEvaluable('root');
      const isEquation = mathJsExpression.includes('=');
      
      let resultStr;
      
      if (isEquation) {
        resultStr = solveEquation(mathJsExpression);
      } else {
        const hasVariables = mathJsExpression.includes('x') || 
                            mathJsExpression.includes('y') ||
                            mathJsExpression.includes('z');
        
        if (hasVariables) {
          resultStr = mathJsExpression;
        } else {
          try {
            const calculatedResult = evaluate(mathJsExpression);
            resultStr = typeof calculatedResult === 'number' 
              ? Number.isInteger(calculatedResult) 
                ? calculatedResult.toString() 
                : calculatedResult.toFixed(4).replace(/\.?0+$/, '')
              : calculatedResult.toString();
          } catch (error) {
            console.error('Evaluation error:', error);
            resultStr = "Error: Invalid expression";
          }
        }
      }
      
      setResult(`${inputLatex} = ${resultStr}`);
      setHistory(prev => [...prev, { input: inputLatex, output: resultStr }]);
      
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

  const clearCalculator = () => {
    setElements({
      'root': {
        type: 'parentheses',
        value: 'parentheses',
        id: 'root',
        children: [],
        cursorPosition: 0
      }
    });
    setActiveElementId('root');
    setSelectedElement('root');
    setCursorPosition(0);
    setResult('');
  };

  const deleteActiveElement = () => {
    if (activeElementId === 'root') return;
    
    const { parentId, index } = getParentInfo(activeElementId);
    if (!parentId || index === -1) return;
    
    const newElements = {...elements};
    const parent = newElements[parentId];
    
    // Remove the element from its parent's children array
    parent.children.splice(index, 1);
    
    // Recursive function to delete an element and all its children
    const deleteRecursive = (elementId: string) => {
      const element = newElements[elementId];
      if (!element) return;
      
      // Delete all children recursively
      if (element.children && element.children.length > 0) {
        [...element.children].forEach(deleteRecursive);
      }
      
      // Delete the element itself
      delete newElements[elementId];
    };
    
    // Delete the active element and all its children
    deleteRecursive(activeElementId);
    
    // Select the previous element, the next element, or the parent
    const newActiveId = index > 0 
      ? parent.children[index - 1] 
      : parent.children[0] || parentId;
    
    setElements(newElements);
    setActiveElementId(newActiveId || 'root');
    setSelectedElement(newActiveId || 'root');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextElement = findNextElement(e.shiftKey ? 'prev' : 'next');
      if (nextElement) {
        setActiveElementId(nextElement);
        setSelectedElement(nextElement);
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      deleteActiveElement();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateStructure('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateStructure('right');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateStructure('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateStructure('down');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      calculateResult();
    } else if (/^[0-9.]$/.test(e.key)) {
      e.preventDefault();
      addElement('number', e.key);
    } else if (/^[+\-*/=]$/.test(e.key)) {
      e.preventDefault();
      addElement('operator', e.key);
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      addElement('variable', e.key);
    } else if (e.key === '(') {
      e.preventDefault();
      addStructure('parentheses');
    } else if (e.key === ')') {
      e.preventDefault();
      navigateStructure('up');
      navigateStructure('right');
    } else if (e.key === '^') {
      e.preventDefault();
      addStructure('power');
    } else if (e.key === '/') {
      e.preventDefault();
      addStructure('fraction');
    }
  };

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveElementId(elementId);
    setSelectedElement(elementId);
    
    editorRef.current?.focus();
  };

  const renderTabContent = () => {
    const buttonClass = "font-serif text-[11px] leading-none h-7 w-full";
    
    switch (currentTab) {
      case 'main':
        return (
          <>
            <div className="grid grid-cols-5 gap-1">
              <Button variant="outline" onClick={() => addElement('number', '7')} className={buttonClass} size="sm">
                <span className="katex-font">7</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('number', '8')} className={buttonClass} size="sm">
                <span className="katex-font">8</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('number', '9')} className={buttonClass} size="sm">
                <span className="katex-font">9</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('operator', '/')} className={buttonClass} size="sm">
                <span className="katex-font">÷</span>
              </Button>
              <Button variant="outline" onClick={deleteActiveElement} className={buttonClass} size="sm">
                <Delete className="h-3 w-3" />
              </Button>
              
              <Button variant="outline" onClick={() => addElement('number', '4')} className={buttonClass} size="sm">
                <span className="katex-font">4</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('number', '5')} className={buttonClass} size="sm">
                <span className="katex-font">5</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('number', '6')} className={buttonClass} size="sm">
                <span className="katex-font">6</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('operator', '*')} className={buttonClass} size="sm">
                <span className="katex-font">×</span>
              </Button>
              <Button variant="outline" onClick={() => addStructure('parentheses')} className={buttonClass} size="sm">
                <span className="katex-font">()</span>
              </Button>
              
              <Button variant="outline" onClick={() => addElement('number', '1')} className={buttonClass} size="sm">
                <span className="katex-font">1</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('number', '2')} className={buttonClass} size="sm">
                <span className="katex-font">2</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('number', '3')} className={buttonClass} size="sm">
                <span className="katex-font">3</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('operator', '-')} className={buttonClass} size="sm">
                <span className="katex-font">−</span>
              </Button>
              <Button variant="outline" onClick={() => addStructure('power')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("x^n") }} />
              </Button>
              
              <Button variant="outline" onClick={() => addElement('number', '0')} className={buttonClass} size="sm">
                <span className="katex-font">0</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('number', '.')} className={buttonClass} size="sm">
                <span className="katex-font">.</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('variable', 'x')} className={buttonClass} size="sm">
                <span className="katex-font">x</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('operator', '+')} className={buttonClass} size="sm">
                <span className="katex-font">+</span>
              </Button>
              <Button variant="outline" onClick={() => addStructure('sqrt')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("\\sqrt{x}") }} />
              </Button>
              
              <Button variant="outline" onClick={() => addElement('variable', 'pi')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("\\pi") }} />
              </Button>
              <Button variant="outline" onClick={() => addElement('variable', 'e')} className={buttonClass} size="sm">
                <span className="katex-font">e</span>
              </Button>
              <Button variant="outline" onClick={() => addElement('operator', '=')} className={buttonClass} size="sm">
                <span className="katex-font">=</span>
              </Button>
              <Button variant="outline" onClick={() => addStructure('fraction')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("\\frac{a}{b}") }} />
              </Button>
              <Button variant="outline" onClick={calculateResult} className={buttonClass} size="sm">
                <Equal className="h-3 w-3" />
              </Button>
            </div>
          </>
        );
      case 'functions':
        return (
          <div className="grid grid-cols-4 gap-1">
            <Button variant="outline" onClick={() => addStructure('function', 'sin')} className={buttonClass} size="sm">
              <span className="katex-font">sin</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'cos')} className={buttonClass} size="sm">
              <span className="katex-font">cos</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'tan')} className={buttonClass} size="sm">
              <span className="katex-font">tan</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'cot')} className={buttonClass} size="sm">
              <span className="katex-font">cot</span>
            </Button>
            
            <Button variant="outline" onClick={() => addStructure('function', 'asin')} className={buttonClass} size="sm">
              <span className="katex-font">arcsin</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'acos')} className={buttonClass} size="sm">
              <span className="katex-font">arccos</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'atan')} className={buttonClass} size="sm">
              <span className="katex-font">arctan</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'atan2')} className={buttonClass} size="sm">
              <span className="katex-font">arctan₂</span>
            </Button>
            
            <Button variant="outline" onClick={() => addStructure('function', 'log')} className={buttonClass} size="sm">
              <span className="katex-font">log</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'log10')} className={buttonClass} size="sm">
              <span className="katex-font">log₁₀</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'log2')} className={buttonClass} size="sm">
              <span className="katex-font">log₂</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'ln')} className={buttonClass} size="sm">
              <span className="katex-font">ln</span>
            </Button>
          </div>
        );
      case 'calculus':
        return (
          <div className="grid grid-cols-4 gap-1">
            <Button variant="outline" onClick={() => addStructure('function', 'diff')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\frac{d}{dx}") }} />
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'int')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\int") }} />
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'sum')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\sum") }} />
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'prod')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\prod") }} />
            </Button>
            
            <Button variant="outline" onClick={() => addElement('variable', 'dx')} className={buttonClass} size="sm">
              <span className="katex-font">dx</span>
            </Button>
            <Button variant="outline" onClick={() => addElement('variable', 'dy')} className={buttonClass} size="sm">
              <span className="katex-font">dy</span>
            </Button>
            <Button variant="outline" onClick={() => addElement('variable', 'dt')} className={buttonClass} size="sm">
              <span className="katex-font">dt</span>
            </Button>
            <Button variant="outline" onClick={() => addStructure('function', 'lim')} className={buttonClass} size="sm">
              <span className="katex-font">lim</span>
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderEditor = () => {
    useEffect(() => {
      const addClickHandlers = () => {
        document.querySelectorAll('[data-element-id]').forEach((elem) => {
          const id = elem.getAttribute('data-element-id');
          if (id) {
            elem.addEventListener('click', (e: any) => {
              e.stopPropagation();
              handleElementClick(id, e);
            });
            
            elem.addEventListener('mouseenter', () => setHoveredElementId(id));
            elem.addEventListener('mouseleave', () => setHoveredElementId(null));
          }
        });
      };
      
      // Add a small delay to ensure DOM is ready
      setTimeout(addClickHandlers, 10);
      
      return () => {
        // Clean up event listeners
        document.querySelectorAll('[data-element-id]').forEach((elem) => {
          const id = elem.getAttribute('data-element-id');
          if (id) {
            elem.removeEventListener('click', (e: any) => handleElementClick(id, e));
            elem.removeEventListener('mouseenter', () => setHoveredElementId(id));
            elem.removeEventListener('mouseleave', () => setHoveredElementId(null));
          }
        });
      };
    }, [elements, activeElementId]);
    
    const generateHtmlWithIds = () => {
      const latex = elementToLatex('root');
      const html = renderLatex(latex);
      
      // Add data-element-id attributes to all elements
      let enhancedHtml = html;
      Object.keys(elements).forEach(id => {
        const element = elements[id];
        const elementType = element.type;
        
        // Create specific selectors for different element types
        let selector;
        switch (elementType) {
          case 'function':
            selector = element.value.includes('sin') || element.value.includes('cos') || 
                       element.value.includes('tan') ?
                       `.katex .mop-${element.value}` : `.katex .mop`;
            break;
          case 'fraction':
            selector = '.katex .mfrac';
            break;
          case 'sqrt':
            selector = '.katex .sqrt';
            break;
          case 'number':
          case 'variable':
            selector = '.katex .mord';
            break;
          case 'operator':
            selector = '.katex .mbin, .katex .mrel';
            break;
          default:
            selector = '.katex .katex-html';
        }
        
        // Replace the appropriate parts of the HTML with data-element-id attributes
        enhancedHtml = enhancedHtml.replace(
          new RegExp(`<span class="katex-html"([^>]*)>`, 'g'),
          `<span class="katex-html"$1 data-element-id="${id}">`
        );
      });
      
      return enhancedHtml;
    };
    
    return (
      <div 
        ref={editorRef}
        className="p-4 bg-noir-accent rounded-md min-h-32 flex items-center justify-center cursor-text"
        onClick={() => {
          editorRef.current?.focus();
          setActiveElementId('root');
          setSelectedElement('root');
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div
          className="math-editor text-xl katex-font"
          dangerouslySetInnerHTML={{ 
            __html: generateHtmlWithIds()
          }}
        />
      </div>
    );
  };

  useEffect(() => {
    document.body.classList.add('katex-fonts-enabled');
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .katex-font {
        font-family: KaTeX_Main, 'Times New Roman', serif;
      }
      .katex-fonts-enabled button {
        font-family: KaTeX_Main, 'Times New Roman', serif;
      }
      .math-editor .katex {
        cursor: pointer;
      }
      .math-editor .katex:hover {
        background-color: rgba(32, 226, 215, 0.1);
      }
      
      .math-editor [data-element-id]:hover {
        background-color: rgba(32, 226, 215, 0.2);
        border-radius: 2px;
      }
      
      button .katex {
        font-size: 0.9em;
      }
      
      /* Better cursor visibility */
      .math-editor .katex .textcolor.textstyle.uncustomized {
        cursor: text !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.body.classList.remove('katex-fonts-enabled');
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Card className="noir-card">
      <CardHeader>
        <CardTitle className="text-xl text-neon-cyan">Visual Math Calculator</CardTitle>
        <CardDescription>
          Create beautiful, interactive mathematical expressions and calculate results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderEditor()}
        
        <div className="flex space-x-2 overflow-x-auto">
          <Button 
            variant={currentTab === 'main' ? "default" : "outline"} 
            onClick={() => setCurrentTab('main')}
            className="flex-shrink-0 font-serif katex-font text-xs"
            size="sm"
          >
            <Calculator className="h-3 w-3 mr-1" />
            Basic
          </Button>
          <Button 
            variant={currentTab === 'functions' ? "default" : "outline"} 
            onClick={() => setCurrentTab('functions')}
            className="flex-shrink-0 font-serif katex-font text-xs"
            size="sm"
          >
            <BarChart className="h-3 w-3 mr-1" />
            Functions
          </Button>
          <Button 
            variant={currentTab === 'calculus' ? "default" : "outline"} 
            onClick={() => setCurrentTab('calculus')}
            className="flex-shrink-0 font-serif katex-font text-xs"
            size="sm"
          >
            <Sigma className="h-3 w-3 mr-1" />
            Calculus
          </Button>
        </div>
        
        {renderTabContent()}
        
        <div className="flex space-x-2 mt-2">
          <Button 
            onClick={clearCalculator} 
            variant="outline"
            className="flex-1 font-serif katex-font text-xs"
            size="sm"
          >
            Clear
          </Button>
          <Button 
            onClick={calculateResult} 
            className="flex-1 bg-neon-cyan hover:bg-neon-cyan/80 text-black font-serif katex-font text-xs"
            size="sm"
          >
            Calculate
          </Button>
        </div>
        
        {result && (
          <div className="mt-4">
            <Label>Result</Label>
            <div 
              className="p-4 bg-noir-accent rounded-md overflow-x-auto mt-2"
              dangerouslySetInnerHTML={{ __html: renderLatex(result) }}
            />
          </div>
        )}
        
        {history.length > 0 && (
          <div className="mt-4">
            <Label>History</Label>
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
              {history.map((item, index) => (
                <Card key={index} className="bg-noir-light">
                  <CardContent className="p-3">
                    <div 
                      className="text-sm text-gray-400"
                      dangerouslySetInnerHTML={{ __html: renderLatex(item.input) }}
                    />
                    <div className="font-medium text-neon-cyan">{item.output}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-gray-800 pt-4 text-xs">
        <p className="text-gray-400">Use arrow keys to navigate, Tab to cycle elements, Del to delete, Enter to calculate</p>
      </CardFooter>
    </Card>
  );
};

export default VisualCalculator;
