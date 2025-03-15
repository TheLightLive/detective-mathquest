import React, { useState, useRef, useEffect } from 'react';
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
  type: 'number' | 'operator' | 'function' | 'fraction' | 'sqrt' | 'power' | 'variable' | 'placeholder' | 'parentheses' | 'superscript' | 'subscript';
  value: string;
  id: string;
  parentId?: string;
  children?: string[];
  selected?: boolean;
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
  const [currentTab, setCurrentTab] = useState<string>('main'); // 'main', 'functions', 'trig', 'calculus'
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
        if (element.children && element.children.length > 0) {
          const args = element.children.map(elementToLatex).join(',');
          return `\\${element.value}\\left(${args}\\right)`;
        }
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
      case 'parentheses':
        if (element.children && element.children.length > 0) {
          return `\\left(${element.children.map(elementToLatex).join('')}\\right)`;
        }
        return '\\left(\\right)';
      case 'superscript':
        if (element.children && element.children.length === 1) {
          return `^{${elementToLatex(element.children[0])}}`;
        }
        return '^{}';
      case 'subscript':
        if (element.children && element.children.length === 1) {
          return `_{${elementToLatex(element.children[0])}}`;
        }
        return '_{}';
      case 'placeholder':
        if (element.selected) {
          return '\\underline{\\text{' + element.value + '}}';
        }
        return '\\text{' + element.value + '}';
      default:
        return '';
    }
  };

  const getInsertionTarget = (): { parentId: string, index: number } => {
    if (activeElementId === 'root' && elements['root'].type === 'placeholder') {
      return { parentId: '', index: 0 };
    }
    
    const parent = Object.values(elements).find(el => 
      el.children?.includes(activeElementId)
    );
    
    if (parent) {
      const index = parent.children?.indexOf(activeElementId) ?? -1;
      return { parentId: parent.id, index: index + 1 };
    }
    
    return { parentId: 'root', index: elements['root'].children?.length || 0 };
  };

  const addElement = (type: MathElement['type'], value: string) => {
    const newId = generateId();
    const newElement: MathElement = { type, value, id: newId };
    
    let newElements = { ...elements };
    
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
      } else if (activeElementId === 'root') {
        newElements = {
          ...newElements,
          'root': {
            ...newElement,
            id: 'root',
            children: []
          }
        };
      }
      
      if (activeElementId !== 'root') {
        delete newElements[activeElementId];
      }
      
    } else {
      const { parentId, index } = getInsertionTarget();
      
      if (parentId) {
        const parent = newElements[parentId];
        const newChildren = [...(parent.children || [])];
        newChildren.splice(index, 0, newId);
        newElements[parentId] = {
          ...parent,
          children: newChildren
        };
      } else {
        newElements['root'] = {
          ...newElement,
          id: 'root',
          children: []
        };
      }
    }
    
    newElements[newId] = newElement;
    setElements(newElements);
    setActiveElementId(newId);
  };

  const addStructure = (type: 'fraction' | 'sqrt' | 'power' | 'parentheses') => {
    const newId = generateId();
    const placeholderId1 = generateId();
    const placeholderId2 = type !== 'sqrt' && type !== 'parentheses' ? generateId() : undefined;
    
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
    
    let newElements = { 
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
      } else if (activeElementId === 'root') {
        if (elements['root'].type === 'placeholder') {
          newElements['root'] = {
            ...newElement,
            id: 'root'
          };
          
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
          return `pow(${elementToEvaluable(element.children[0])}, ${elementToEvaluable(element.children[1])})`;
        }
        return '0';
      case 'parentheses':
        if (element.children && element.children.length > 0) {
          return `(${element.children.map(elementToEvaluable).join('')})`;
        }
        return '(0)';
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

  const selectNextInput = () => {
    const placeholders = Object.values(elements).filter(
      el => el.type === 'placeholder'
    );
    
    if (placeholders.length === 0) return;
    
    const currentIndex = placeholders.findIndex(p => p.id === activeElementId);
    
    const nextIndex = currentIndex >= 0 && currentIndex < placeholders.length - 1 
      ? currentIndex + 1 
      : 0;
      
    setActiveElementId(placeholders[nextIndex].id);
  };

  const navigateStructure = (direction: 'up' | 'down' | 'left' | 'right') => {
    const parent = Object.values(elements).find(el => 
      el.children?.includes(activeElementId)
    );
    
    if (!parent) return;
    
    const currentIndex = parent.children?.indexOf(activeElementId) ?? -1;
    if (currentIndex === -1) return;
    
    if ((direction === 'left' || direction === 'right') && parent.children) {
      const newIndex = direction === 'left' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(parent.children.length - 1, currentIndex + 1);
        
      if (newIndex !== currentIndex) {
        setActiveElementId(parent.children[newIndex]);
      }
    } else if (direction === 'up' && parent.parentId) {
      setActiveElementId(parent.id);
    } else if (direction === 'down') {
      const activeElement = elements[activeElementId];
      if (activeElement && activeElement.children && activeElement.children.length > 0) {
        setActiveElementId(activeElement.children[0]);
      }
    }
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

  const deleteActiveElement = () => {
    if (activeElementId === 'root') return;
    
    const parent = Object.values(elements).find(el => 
      el.children?.includes(activeElementId)
    );
    
    if (!parent) return;
    
    const childIndex = parent.children?.indexOf(activeElementId) ?? -1;
    if (childIndex === -1) return;
    
    const newPlaceholderId = generateId();
    const newPlaceholder: MathElement = {
      type: 'placeholder' as const,
      value: '...',
      id: newPlaceholderId,
      parentId: parent.id,
      children: []
    };
    
    const newChildren = [...(parent.children || [])];
    newChildren[childIndex] = newPlaceholderId;
    
    const newElements = {
      ...elements,
      [parent.id]: {
        ...parent,
        children: newChildren
      },
      [newPlaceholderId]: newPlaceholder
    };
    
    delete newElements[activeElementId];
    
    const activeElement = elements[activeElementId];
    if (activeElement && activeElement.children && activeElement.children.length > 0) {
      activeElement.children.forEach(childId => {
        const removeChildrenRecursively = (id: string) => {
          const element = newElements[id];
          if (!element) return;
          
          if (element.children && element.children.length > 0) {
            element.children.forEach(removeChildrenRecursively);
          }
          
          delete newElements[id];
        };
        
        removeChildrenRecursively(childId);
      });
    }
    
    setElements(newElements);
    setActiveElementId(newPlaceholderId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      selectNextInput();
    } else if (e.key === 'Backspace') {
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
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'main':
        return (
          <>
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
              
              <Button variant="outline" onClick={() => addStructure('parentheses')}>
                <Brackets className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => addElement('variable', 'e')}>e</Button>
              <Button variant="outline" onClick={() => addElement('operator', '=')}>=</Button>
              <Button variant="outline" onClick={deleteActiveElement}>Del</Button>
            </div>
          </>
        );
      case 'functions':
        return (
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" onClick={() => addElement('function', 'sin')}>sin</Button>
            <Button variant="outline" onClick={() => addElement('function', 'cos')}>cos</Button>
            <Button variant="outline" onClick={() => addElement('function', 'tan')}>tan</Button>
            <Button variant="outline" onClick={() => addElement('function', 'cot')}>cot</Button>
            
            <Button variant="outline" onClick={() => addElement('function', 'arcsin')}>arcsin</Button>
            <Button variant="outline" onClick={() => addElement('function', 'arccos')}>arccos</Button>
            <Button variant="outline" onClick={() => addElement('function', 'arctan')}>arctan</Button>
            <Button variant="outline" onClick={() => addElement('function', 'arccot')}>arccot</Button>
            
            <Button variant="outline" onClick={() => addElement('function', 'log')}>log</Button>
            <Button variant="outline" onClick={() => addElement('function', 'ln')}>ln</Button>
            <Button variant="outline" onClick={() => addElement('function', 'exp')}>exp</Button>
            <Button variant="outline" onClick={() => addElement('function', 'log10')}>log₁₀</Button>
          </div>
        );
      case 'calculus':
        return (
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" onClick={() => addElement('function', 'diff')}>
              <span className="text-sm">d/dx</span>
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'int')}>
              <span className="text-sm">∫</span>
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'sum')}>
              <Sigma className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'lim')}>lim</Button>
            
            <Button variant="outline" onClick={() => addElement('variable', 'dx')}>dx</Button>
            <Button variant="outline" onClick={() => addElement('variable', 'dy')}>dy</Button>
            <Button variant="outline" onClick={() => addElement('variable', 'dt')}>dt</Button>
            <Button variant="outline" onClick={() => addElement('function', 'prod')}>∏</Button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderEditor = () => {
    return (
      <div 
        ref={editorRef}
        className="p-4 bg-noir-accent rounded-md min-h-28 flex items-center justify-center cursor-text"
        onClick={() => editorRef.current?.focus()}
        onKeyDown={handleKeyDown}
        tabIndex={0}
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

  useEffect(() => {
    setElements(prev => {
      const newElements = { ...prev };
      
      Object.keys(newElements).forEach(id => {
        if (newElements[id].selected) {
          newElements[id] = { ...newElements[id], selected: false };
        }
      });
      
      if (newElements[activeElementId]) {
        newElements[activeElementId] = { 
          ...newElements[activeElementId], 
          selected: true 
        };
      }
      
      return newElements;
    });
  }, [activeElementId]);

  useEffect(() => {
    const editorEl = editorRef.current;
    if (!editorEl) return;
    
    const handleEditorClick = () => {
      editorEl.focus();
    };
    
    editorEl.addEventListener('click', handleEditorClick);
    
    return () => {
      editorEl.removeEventListener('click', handleEditorClick);
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
      <CardContent className="space-y-6">
        {renderEditor()}
        
        <div className="flex space-x-2 overflow-x-auto">
          <Button 
            variant={currentTab === 'main' ? "default" : "outline"} 
            onClick={() => setCurrentTab('main')}
            className="flex-shrink-0"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Basic
          </Button>
          <Button 
            variant={currentTab === 'functions' ? "default" : "outline"} 
            onClick={() => setCurrentTab('functions')}
            className="flex-shrink-0"
          >
            <BarChart className="h-4 w-4 mr-2" />
            Functions
          </Button>
          <Button 
            variant={currentTab === 'calculus' ? "default" : "outline"} 
            onClick={() => setCurrentTab('calculus')}
            className="flex-shrink-0"
          >
            <Sigma className="h-4 w-4 mr-2" />
            Calculus
          </Button>
        </div>
        
        {renderTabContent()}
        
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
      <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
        <p className="text-sm text-gray-400">Click on elements to edit them, use Tab to navigate between inputs</p>
      </CardFooter>
    </Card>
  );
};

export default VisualCalculator;
