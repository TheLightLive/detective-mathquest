import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { evaluate } from 'mathjs';
import { 
  Calculator, Square, Plus, Minus, X, Divide, PiSquare, 
  BarChart, ChevronRight, ChevronLeft, Brackets, Equal, Sigma, Braces
} from "lucide-react";
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathElement {
  type: 'number' | 'operator' | 'function' | 'fraction' | 'sqrt' | 'power' | 'variable' | 'placeholder';
  value: string;
  id: string;
  parentId?: string;
  children?: string[];
}

type MathElementMap = Record<string, MathElement>;

const VisualCalculator: React.FC = () => {
  const [elements, setElements] = useState<MathElementMap>({
    'root': {
      type: 'placeholder',
      value: 'Click to enter expression',
      id: 'root',
      children: []
    }
  });
  const [activeElementId, setActiveElementId] = useState<string>('root');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<Array<{input: string, output: string}>>([]);
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);

  const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

  const elementToLatex = (elementId: string): string => {
    const element = elements[elementId];
    if (!element) return '';

    switch (element.type) {
      case 'number':
      case 'variable':
        return element.value;
      case 'operator':
        return element.value === '*' ? '\\times' : 
               element.value === '/' ? '\\div' : element.value;
      case 'function':
        return `\\${element.value}`;
      case 'fraction':
        if (element.children && element.children.length === 2) {
          return `\\frac{${elementToLatex(element.children[0])}}{${elementToLatex(element.children[1])}}`;
        }
        return '\\frac{}{}';
      case 'sqrt':
        if (element.children && element.children.length === 1) {
          return `\\sqrt{${elementToLatex(element.children[0])}}`;
        }
        return '\\sqrt{}';
      case 'power':
        if (element.children && element.children.length === 2) {
          return `{${elementToLatex(element.children[0])}}^{${elementToLatex(element.children[1])}}`;
        }
        return '{}^{}';
      case 'placeholder':
        return '\\text{' + element.value + '}';
      default:
        return '';
    }
  };

  const addElement = (type: MathElement['type'], value: string) => {
    const newId = generateId();
    const newElement: MathElement = { type, value, id: newId };
    
    const newElements = { ...elements, [newId]: newElement };
    
    if (activeElementId && elements[activeElementId].type === 'placeholder') {
      const parent = Object.values(elements).find(el => 
        el.children?.includes(activeElementId)
      );
      
      if (parent) {
        const parentId = parent.id;
        const childIndex = parent.children?.indexOf(activeElementId) ?? -1;
        if (childIndex !== -1) {
          const newChildren = [...(parent.children || [])];
          newChildren[childIndex] = newId;
          newElements[parentId] = {
            ...parent,
            children: newChildren
          };
        }
      } else {
        delete newElements['root'];
        newElements['root'] = {
          ...newElement,
          id: 'root'
        };
      }
      
      if (activeElementId !== 'root') {
        delete newElements[activeElementId];
      }
      
      setActiveElementId(parent ? newId : 'root');
    } else {
      newElements['root'] = {
        ...elements['root'],
        children: [...(elements['root'].children || []), newId]
      };
      setActiveElementId(newId);
    }
    
    setElements(newElements);
  };

  const addStructure = (type: 'fraction' | 'sqrt' | 'power') => {
    const newId = generateId();
    const placeholderId1 = generateId();
    const placeholderId2 = type !== 'sqrt' ? generateId() : undefined;
    
    const placeholder1: MathElement = {
      type: 'placeholder',
      value: '...',
      id: placeholderId1,
      parentId: newId
    };
    
    let placeholder2: MathElement | undefined;
    if (placeholderId2) {
      placeholder2 = {
        type: 'placeholder',
        value: '...',
        id: placeholderId2,
        parentId: newId
      };
    }
    
    const childrenIds = placeholderId2 
      ? [placeholderId1, placeholderId2] 
      : [placeholderId1];
      
    const newElement: MathElement = {
      type,
      value: type,
      id: newId,
      children: childrenIds
    };
    
    const newElements = { 
      ...elements,
      [newId]: newElement,
      [placeholderId1]: placeholder1
    };
    
    if (placeholder2) {
      newElements[placeholderId2!] = placeholder2;
    }
    
    if (activeElementId && elements[activeElementId].type === 'placeholder') {
      const parent = Object.values(elements).find(el => 
        el.children?.includes(activeElementId)
      );
      
      if (parent) {
        const parentId = parent.id;
        const childIndex = parent.children?.indexOf(activeElementId) ?? -1;
        if (childIndex !== -1) {
          const newChildren = [...(parent.children || [])];
          newChildren[childIndex] = newId;
          newElements[parentId] = {
            ...parent,
            children: newChildren
          };
        }
      } else {
        if (elements['root'].type === 'placeholder') {
          delete newElements['root'];
          newElements['root'] = newElement;
          newElements['root'].id = 'root';
          
          childrenIds.forEach(childId => {
            if (newElements[childId]) {
              newElements[childId] = {
                ...newElements[childId],
                parentId: 'root'
              };
            }
          });
        } else {
          newElements['root'] = {
            ...elements['root'],
            children: [...(elements['root'].children || []), newId]
          };
        }
      }
      
      if (activeElementId !== 'root') {
        delete newElements[activeElementId];
      }
    } else {
      newElements['root'] = {
        ...elements['root'],
        children: [...(elements['root'].children || []), newId]
      };
    }
    
    setElements(newElements);
    setActiveElementId(placeholderId1);
  };

  const calculateResult = () => {
    try {
      const expression = elementToEvaluable('root');
      if (!expression.trim()) {
        toast({
          title: "Empty Expression",
          description: "Please enter a mathematical expression",
          variant: "destructive",
        });
        return;
      }
      
      const calculatedResult = evaluate(expression);
      const resultStr = typeof calculatedResult === 'number' 
        ? Number.isInteger(calculatedResult) 
          ? calculatedResult.toString() 
          : calculatedResult.toFixed(4).replace(/\.?0+$/, '')
        : calculatedResult.toString();
      
      const inputLatex = elementToLatex('root');
      
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

  const elementToEvaluable = (elementId: string): string => {
    const element = elements[elementId];
    if (!element) return '';

    switch (element.type) {
      case 'number':
      case 'variable':
        return element.value;
      case 'operator':
        return element.value;
      case 'function':
        if (element.children && element.children.length > 0) {
          return `${element.value}(${element.children.map(elementToEvaluable).join('')})`;
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
          return `pow(${elementToEvaluable(element.children[0])}, ${elementToEvaluable(element.children[1])})`;
        }
        return '0';
      case 'placeholder':
        return '0';
      default:
        return '';
    }
  };

  const clearCalculator = () => {
    setElements({
      'root': {
        type: 'placeholder',
        value: 'Click to enter expression',
        id: 'root',
        children: []
      }
    });
    setActiveElementId('root');
    setResult('');
  };

  const renderEditor = () => {
    return (
      <div 
        ref={editorRef}
        className="p-4 bg-noir-accent rounded-md min-h-20 flex items-center justify-center cursor-text"
        onClick={() => setActiveElementId('root')}
      >
        <div
          className="math-editor text-2xl"
          dangerouslySetInnerHTML={{ 
            __html: renderLatex(elementToLatex('root')) 
          }}
        />
      </div>
    );
  };

  return (
    <Card className="noir-card">
      <CardHeader>
        <CardTitle className="text-xl text-neon-cyan">Visual Math Calculator</CardTitle>
        <CardDescription>
          Create beautiful, interactive mathematical expressions and calculate results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderEditor()}
        
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={() => addElement('number', '7')}>7</Button>
          <Button variant="outline" onClick={() => addElement('number', '8')}>8</Button>
          <Button variant="outline" onClick={() => addElement('number', '9')}>9</Button>
          <Button variant="outline" onClick={() => addElement('operator', '/')}><Divide className="h-4 w-4" /></Button>
          
          <Button variant="outline" onClick={() => addElement('number', '4')}>4</Button>
          <Button variant="outline" onClick={() => addElement('number', '5')}>5</Button>
          <Button variant="outline" onClick={() => addElement('number', '6')}>6</Button>
          <Button variant="outline" onClick={() => addElement('operator', '*')}><X className="h-4 w-4" /></Button>
          
          <Button variant="outline" onClick={() => addElement('number', '1')}>1</Button>
          <Button variant="outline" onClick={() => addElement('number', '2')}>2</Button>
          <Button variant="outline" onClick={() => addElement('number', '3')}>3</Button>
          <Button variant="outline" onClick={() => addElement('operator', '-')}><Minus className="h-4 w-4" /></Button>
          
          <Button variant="outline" onClick={() => addElement('number', '0')}>0</Button>
          <Button variant="outline" onClick={() => addElement('number', '.')}>.</Button>
          <Button variant="outline" onClick={() => addElement('variable', 'x')}>x</Button>
          <Button variant="outline" onClick={() => addElement('operator', '+')}><Plus className="h-4 w-4" /></Button>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={() => addStructure('fraction')}>
            <span className="text-sm">a/b</span>
          </Button>
          <Button variant="outline" onClick={() => addStructure('sqrt')}>
            <Square className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => addStructure('power')}>
            <span className="text-sm">x^n</span>
          </Button>
          <Button variant="outline" onClick={() => addElement('variable', 'pi')}>
            <PiSquare className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" onClick={() => addElement('function', 'sin')}>sin</Button>
          <Button variant="outline" onClick={() => addElement('function', 'cos')}>cos</Button>
          <Button variant="outline" onClick={() => addElement('function', 'tan')}>tan</Button>
          <Button variant="outline" onClick={() => addElement('function', 'log')}>log</Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={clearCalculator} 
            variant="outline"
            className="flex-1"
          >
            Clear
          </Button>
          <Button 
            onClick={calculateResult} 
            className="flex-1 bg-neon-cyan hover:bg-neon-cyan/80 text-black"
          >
            Calculate
          </Button>
        </div>
        
        {result && (
          <div className="mt-6">
            <Label>Result</Label>
            <div 
              className="p-4 bg-noir-accent rounded-md overflow-x-auto mt-2"
              dangerouslySetInnerHTML={{ __html: renderLatex(result) }}
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
      <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
        <p className="text-sm text-gray-400">Click on the editor to place cursor</p>
      </CardFooter>
    </Card>
  );
};

export default VisualCalculator;
