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
  const [cursorPosition, setCursorPosition] = useState<{elementId: string, position: number}>({elementId: 'root', position: 0});

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
          return '\\boxed{\\color{cyan}{\\text{' + element.value + '}}}';
        }
        return '\\text{' + element.value + '}';
      default:
        return '';
    }
  };

  const getInsertionTarget = (): { parentId: string, index: number } => {
    if (activeElementId && elements[activeElementId]?.type === 'placeholder') {
      const activeElement = elements[activeElementId];
      const parent = Object.values(elements).find(el => 
        el.children?.includes(activeElementId)
      );
      
      if (parent) {
        const index = parent.children?.indexOf(activeElementId) ?? 0;
        return { parentId: parent.id, index };
      } else if (activeElementId === 'root') {
        return { parentId: '', index: 0 };
      }
    }
    
    if (activeElementId === 'root') {
      return { parentId: 'root', index: elements['root'].children?.length || 0 };
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
    const newElement: MathElement = { 
      type, 
      value, 
      id: newId,
      children: type === 'placeholder' ? [] : undefined
    };
    
    let newElements = { ...elements };
    
    if (activeElementId && elements[activeElementId]?.type === 'placeholder') {
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
          
          newElements[newId] = newElement;
          
          if (activeElementId !== 'root') {
            delete newElements[activeElementId];
          }
        }
      } else if (activeElementId === 'root') {
        if (type === 'placeholder') {
          newElements['root'] = {
            ...newElements['root'],
            value
          };
        } else {
          newElements['root'] = {
            type: 'parentheses',
            value: 'parentheses',
            id: 'root',
            children: [newId]
          };
          
          newElements[newId] = newElement;
        }
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
        
        newElements[newId] = newElement;
      } else {
        newElements['root'] = {
          ...elements['root'],
          children: [...(elements['root'].children || []), newId]
        };
      }
    }
    
    setElements(newElements);
    setActiveElementId(newId);
    setCursorPosition({elementId: newId, position: 0});
  };

  const addStructure = (type: 'fraction' | 'sqrt' | 'power' | 'parentheses') => {
    const newId = generateId();
    const placeholderId1 = generateId();
    const placeholderId2 = type !== 'sqrt' && type !== 'parentheses' ? generateId() : undefined;
    
    const placeholder1: MathElement = {
      type: 'placeholder',
      value: '...',
      id: placeholderId1,
      parentId: newId,
      children: []
    };
    
    let placeholder2: MathElement | undefined;
    if (placeholderId2) {
      placeholder2 = {
        type: 'placeholder',
        value: '...',
        id: placeholderId2,
        parentId: newId,
        children: []
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
    
    if (activeElementId && elements[activeElementId]?.type === 'placeholder') {
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
          
          if (activeElementId !== 'root') {
            delete newElements[activeElementId];
          }
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
    } else {
      newElements['root'] = {
        ...elements['root'],
        children: [...(elements['root'].children || []), newId]
      };
    }
    
    setElements(newElements);
    setActiveElementId(placeholderId1);
    setCursorPosition({elementId: placeholderId1, position: 0});
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
    setCursorPosition({elementId: placeholders[nextIndex].id, position: 0});
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
        setCursorPosition({elementId: parent.children[newIndex], position: 0});
      }
    } else if (direction === 'up' && parent.parentId) {
      setActiveElementId(parent.id);
      setCursorPosition({elementId: parent.id, position: 0});
    } else if (direction === 'down') {
      const activeElement = elements[activeElementId];
      if (activeElement && activeElement.children && activeElement.children.length > 0) {
        setActiveElementId(activeElement.children[0]);
        setCursorPosition({elementId: activeElement.children[0], position: 0});
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
    setCursorPosition({elementId: 'root', position: 0});
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
    setCursorPosition({elementId: newPlaceholderId, position: 0});
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
    } else if (/^[0-9+\-*/=.()a-zA-Z,]$/.test(e.key)) {
      if (/^[0-9.]$/.test(e.key)) {
        addElement('number', e.key);
      } else if (/^[+\-*/=]$/.test(e.key)) {
        addElement('operator', e.key);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        addElement('variable', e.key);
      } else if (e.key === '(') {
        addStructure('parentheses');
      }
    }
  };

  const renderTabContent = () => {
    const buttonClass = "font-serif text-[15px] leading-tight katex-font";
    
    switch (currentTab) {
      case 'main':
        return (
          <>
            <div className="grid grid-cols-4 gap-1.5">
              <Button variant="outline" onClick={() => addElement('number', '7')} className={buttonClass} size="sm">7</Button>
              <Button variant="outline" onClick={() => addElement('number', '8')} className={buttonClass} size="sm">8</Button>
              <Button variant="outline" onClick={() => addElement('number', '9')} className={buttonClass} size="sm">9</Button>
              <Button variant="outline" onClick={() => addElement('operator', '/')} className={buttonClass} size="sm"><Divide className="h-3.5 w-3.5" /></Button>
              
              <Button variant="outline" onClick={() => addElement('number', '4')} className={buttonClass} size="sm">4</Button>
              <Button variant="outline" onClick={() => addElement('number', '5')} className={buttonClass} size="sm">5</Button>
              <Button variant="outline" onClick={() => addElement('number', '6')} className={buttonClass} size="sm">6</Button>
              <Button variant="outline" onClick={() => addElement('operator', '*')} className={buttonClass} size="sm"><X className="h-3.5 w-3.5" /></Button>
              
              <Button variant="outline" onClick={() => addElement('number', '1')} className={buttonClass} size="sm">1</Button>
              <Button variant="outline" onClick={() => addElement('number', '2')} className={buttonClass} size="sm">2</Button>
              <Button variant="outline" onClick={() => addElement('number', '3')} className={buttonClass} size="sm">3</Button>
              <Button variant="outline" onClick={() => addElement('operator', '-')} className={buttonClass} size="sm"><Minus className="h-3.5 w-3.5" /></Button>
              
              <Button variant="outline" onClick={() => addElement('number', '0')} className={buttonClass} size="sm">0</Button>
              <Button variant="outline" onClick={() => addElement('number', '.')} className={buttonClass} size="sm">.</Button>
              <Button variant="outline" onClick={() => addElement('variable', 'x')} className={buttonClass} size="sm">x</Button>
              <Button variant="outline" onClick={() => addElement('operator', '+')} className={buttonClass} size="sm"><Plus className="h-3.5 w-3.5" /></Button>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5">
              <Button variant="outline" onClick={() => addStructure('fraction')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("\\frac{a}{b}") }} />
              </Button>
              <Button variant="outline" onClick={() => addStructure('sqrt')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("\\sqrt{x}") }} />
              </Button>
              <Button variant="outline" onClick={() => addStructure('power')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("x^n") }} />
              </Button>
              <Button variant="outline" onClick={() => addElement('variable', 'pi')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("\\pi") }} />
              </Button>
              
              <Button variant="outline" onClick={() => addStructure('parentheses')} className={buttonClass} size="sm">
                <Brackets className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" onClick={() => addElement('variable', 'e')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("e") }} />
              </Button>
              <Button variant="outline" onClick={() => addElement('operator', '=')} className={buttonClass} size="sm">=</Button>
              <Button variant="outline" onClick={deleteActiveElement} className={buttonClass} size="sm">Del</Button>
            </div>
          </>
        );
      case 'functions':
        return (
          <div className="grid grid-cols-4 gap-1.5">
            <Button variant="outline" onClick={() => addElement('function', 'sin')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\sin") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'cos')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\cos") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'tan')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\tan") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'cot')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\cot") }} />
            </Button>
            
            <Button variant="outline" onClick={() => addElement('function', 'arcsin')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\arcsin") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'arccos')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\arccos") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'arctan')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\arctan") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'arccot')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\arccot") }} />
            </Button>
            
            <Button variant="outline" onClick={() => addElement('function', 'log')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\log") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'ln')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\ln") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'exp')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\exp") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'log10')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\log_{10}") }} />
            </Button>
          </div>
        );
      case 'calculus':
        return (
          <div className="grid grid-cols-4 gap-1.5">
            <Button variant="outline" onClick={() => addElement('function', 'diff')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\frac{d}{dx}") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'int')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\int") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'sum')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\sum") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'lim')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\lim") }} />
            </Button>
            
            <Button variant="outline" onClick={() => addElement('variable', 'dx')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("dx") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('variable', 'dy')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("dy") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('variable', 'dt')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("dt") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'prod')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\prod") }} />
            </Button>
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
            className="flex-shrink-0 font-serif katex-font"
            size="sm"
          >
            <Calculator className="h-3.5 w-3.5 mr-1" />
            Basic
          </Button>
          <Button 
            variant={currentTab === 'functions' ? "default" : "outline"} 
            onClick={() => setCurrentTab('functions')}
            className="flex-shrink-0 font-serif katex-font"
            size="sm"
          >
            <BarChart className="h-3.5 w-3.5 mr-1" />
            Functions
          </Button>
          <Button 
            variant={currentTab === 'calculus' ? "default" : "outline"} 
            onClick={() => setCurrentTab('calculus')}
            className="flex-shrink-0 font-serif katex-font"
            size="sm"
          >
            <Sigma className="h-3.5 w-3.5 mr-1" />
            Calculus
          </Button>
        </div>
        
        {renderTabContent()}
        
        <div className="flex space-x-2 mt-2">
          <Button 
            onClick={clearCalculator} 
            variant="outline"
            className="flex-1 font-serif katex-font"
            size="sm"
          >
            Clear
          </Button>
          <Button 
            onClick={calculateResult} 
            className="flex-1 bg-neon-cyan hover:bg-neon-cyan/80 text-black font-serif katex-font"
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
        <p className="text-gray-400">Use arrow keys to navigate equations, Tab for placeholders, type directly or use buttons</p>
      </CardFooter>
    </Card>
  );
};

export default VisualCalculator;
