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
  const [currentTab, setCurrentTab] = useState<string>('main'); // 'main', 'functions', 'trig', 'calculus'
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [lastClickedPosition, setLastClickedPosition] = useState<{x: number, y: number}>({x: 0, y: 0});

  const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Enhanced LaTeX rendering with cursor support
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

  // Improved LaTeX conversion for each element type
  const elementToLatex = (elementId: string): string => {
    const element = elements[elementId];
    if (!element) return '';

    // Add visual cursor for selected elements
    const addCursor = (latex: string): string => {
      if (element.selected && element.cursorPosition !== undefined) {
        const pos = Math.min(element.cursorPosition, latex.length);
        return `${latex.slice(0, pos)}\\textcolor{cyan}{|}${latex.slice(pos)}`;
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
        if (element.children && element.children.length > 0) {
          const args = element.children.map(elementToLatex).join(',');
          return `\\operatorname{${element.value}}\\left(${args}\\right)`;
        }
        return `\\operatorname{${element.value}}\\left(\\right)`;
        
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
          return element.children.map(elementToLatex).join('');
        }
        return '';
        
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
          return '\\textcolor{cyan}{\\square}';
        }
        return '\\square';
        
      default:
        return '';
    }
  };

  // Get the parent element and position for a given element
  const getParentInfo = (elementId: string): {parentId: string, index: number} => {
    const parent = Object.values(elements).find(el => 
      el.children.includes(elementId)
    );
    
    if (parent) {
      const index = parent.children.indexOf(elementId);
      return { parentId: parent.id, index };
    }
    
    return { parentId: 'root', index: -1 };
  };

  // Add new element to the active position
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
    const active = newElements[activeElementId];
    
    if (!active) {
      // If no active element, add to root
      newElements.root.children.push(newId);
      newElements[newId] = newElement;
    } else if (active.type === 'placeholder') {
      // Replace placeholder with new element
      const { parentId, index } = getParentInfo(activeElementId);
      if (parentId && index !== -1) {
        const parent = newElements[parentId];
        parent.children[index] = newId;
        newElements[newId] = newElement;
        delete newElements[activeElementId];
      }
    } else {
      // Insert at the active element's parent
      const { parentId, index } = getParentInfo(activeElementId);
      if (parentId && index !== -1) {
        const parent = newElements[parentId];
        parent.children.splice(index + 1, 0, newId);
        newElements[newId] = newElement;
      } else if (active.children) {
        // Add to active element's children if it can contain children
        active.children.push(newId);
        newElements[newId] = newElement;
      }
    }
    
    setElements(newElements);
    setActiveElementId(newId);
  };

  // Add a structure (fraction, sqrt, etc.) at the active position
  const addStructure = (type: 'fraction' | 'sqrt' | 'power' | 'parentheses') => {
    const newId = generateId();
    const placeholderId1 = generateId();
    const placeholderId2 = type !== 'sqrt' && type !== 'parentheses' ? generateId() : undefined;
    
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
    
    const active = newElements[activeElementId];
    
    if (!active) {
      // If no active element, add to root
      newElements.root.children.push(newId);
    } else if (active.type === 'placeholder') {
      // Replace placeholder with new structure
      const { parentId, index } = getParentInfo(activeElementId);
      if (parentId && index !== -1) {
        const parent = newElements[parentId];
        parent.children[index] = newId;
        delete newElements[activeElementId];
      }
    } else {
      // Insert at the active element's parent
      const { parentId, index } = getParentInfo(activeElementId);
      if (parentId && index !== -1) {
        const parent = newElements[parentId];
        parent.children.splice(index + 1, 0, newId);
      } else if (active.children) {
        // Add to active element's children if it can contain children
        active.children.push(newId);
      }
    }
    
    setElements(newElements);
    setActiveElementId(placeholderId1);
  };

  // Convert elements to evaluable expression
  const elementToEvaluable = (elementId: string): string => {
    const element = elements[elementId];
    if (!element) return '';

    switch (element.type) {
      case 'number':
      case 'variable':
        if (element.value === 'pi') return 'Math.PI';
        if (element.value === 'e') return 'Math.E';
        return element.value;
        
      case 'operator':
        return element.value;
        
      case 'function':
        if (element.children && element.children.length > 0) {
          return `Math.${element.value}(${element.children.map(elementToEvaluable).join(',')})`;
        }
        return `Math.${element.value}()`;
        
      case 'fraction':
        if (element.children && element.children.length === 2) {
          return `(${elementToEvaluable(element.children[0])})/(${elementToEvaluable(element.children[1])})`;
        }
        return '0';
        
      case 'sqrt':
        if (element.children && element.children.length === 1) {
          return `Math.sqrt(${elementToEvaluable(element.children[0])})`;
        }
        return 'Math.sqrt(0)';
        
      case 'power':
        if (element.children && element.children.length === 2) {
          return `Math.pow(${elementToEvaluable(element.children[0])}, ${elementToEvaluable(element.children[1])})`;
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

  // Find and select the next element in tab order
  const selectNextInput = () => {
    const allElements = Object.values(elements);
    if (allElements.length === 0) return;
    
    // If no active element, select the first one
    if (!activeElementId || !elements[activeElementId]) {
      setActiveElementId(allElements[0].id);
      return;
    }
    
    // Flatten the element tree into a traversable list
    const flattenElements = (elementId: string, result: string[] = []): string[] => {
      const element = elements[elementId];
      if (!element) return result;
      
      result.push(elementId);
      if (element.children) {
        for (const childId of element.children) {
          flattenElements(childId, result);
        }
      }
      return result;
    };
    
    const flatList = flattenElements('root');
    const currentIndex = flatList.indexOf(activeElementId);
    
    if (currentIndex === -1 || currentIndex === flatList.length - 1) {
      // If at the end, loop back to the beginning
      setActiveElementId(flatList[0]);
    } else {
      // Otherwise, select the next element
      setActiveElementId(flatList[currentIndex + 1]);
    }
  };

  // Navigate through the equation structure
  const navigateStructure = (direction: 'up' | 'down' | 'left' | 'right') => {
    const activeElement = elements[activeElementId];
    if (!activeElement) return;
    
    if (direction === 'left' || direction === 'right') {
      // For left/right, move within the parent's children
      const { parentId, index } = getParentInfo(activeElementId);
      if (!parentId) return;
      
      const parent = elements[parentId];
      if (!parent || !parent.children) return;
      
      const newIndex = direction === 'left' 
        ? Math.max(0, index - 1)
        : Math.min(parent.children.length - 1, index + 1);
        
      if (newIndex !== index) {
        setActiveElementId(parent.children[newIndex]);
      }
    } else if (direction === 'up') {
      // For up, move to the parent
      const { parentId } = getParentInfo(activeElementId);
      if (parentId && elements[parentId]) {
        setActiveElementId(parentId);
      }
    } else if (direction === 'down') {
      // For down, move to the first child
      if (activeElement.children && activeElement.children.length > 0) {
        setActiveElementId(activeElement.children[0]);
      }
    }
  };

  // Calculate the result of the expression
  const calculateResult = () => {
    try {
      const expression = elementToEvaluable('root');
      if (!expression.trim() || expression === '(0)') {
        toast({
          title: "Empty Expression",
          description: "Please enter a mathematical expression",
          variant: "destructive",
        });
        return;
      }
      
      // Use safer approach with Function constructor
      const calculationFunction = new Function(`return ${expression}`);
      const calculatedResult = calculationFunction();
      
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

  // Clear the calculator
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
    setCursorPosition(0);
    setResult('');
  };

  // Delete the active element
  const deleteActiveElement = () => {
    if (activeElementId === 'root') return;
    
    const { parentId, index } = getParentInfo(activeElementId);
    if (!parentId || index === -1) return;
    
    const newElements = {...elements};
    const parent = newElements[parentId];
    
    // Simply remove the element from its parent
    parent.children.splice(index, 1);
    
    // Recursively delete children
    const deleteRecursive = (elementId: string) => {
      const element = elements[elementId];
      if (!element) return;
      
      if (element.children && element.children.length > 0) {
        element.children.forEach(deleteRecursive);
      }
      
      delete newElements[elementId];
    };
    
    deleteRecursive(activeElementId);
    
    // Set active element to parent or previous sibling
    const newActiveId = parent.children[Math.max(0, index - 1)] || parentId;
    
    setElements(newElements);
    setActiveElementId(newActiveId);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      selectNextInput();
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
    } else if (/^[0-9+\-*/=.()a-zA-Z,]$/.test(e.key)) {
      e.preventDefault();
      
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

  // Handle mouse clicks on elements
  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveElementId(elementId);
    setLastClickedPosition({x: e.clientX, y: e.clientY});
    
    // Focus the editor to enable keyboard input
    editorRef.current?.focus();
  };

  // Render tabbed button panels
  const renderTabContent = () => {
    const buttonClass = "font-serif text-[12px] leading-none katex-font h-8";
    
    switch (currentTab) {
      case 'main':
        return (
          <>
            <div className="grid grid-cols-5 gap-1">
              <Button variant="outline" onClick={() => addElement('number', '7')} className={buttonClass} size="sm">7</Button>
              <Button variant="outline" onClick={() => addElement('number', '8')} className={buttonClass} size="sm">8</Button>
              <Button variant="outline" onClick={() => addElement('number', '9')} className={buttonClass} size="sm">9</Button>
              <Button variant="outline" onClick={() => addElement('operator', '/')} className={buttonClass} size="sm"><Divide className="h-3 w-3" /></Button>
              <Button variant="outline" onClick={deleteActiveElement} className={buttonClass} size="sm">Del</Button>
              
              <Button variant="outline" onClick={() => addElement('number', '4')} className={buttonClass} size="sm">4</Button>
              <Button variant="outline" onClick={() => addElement('number', '5')} className={buttonClass} size="sm">5</Button>
              <Button variant="outline" onClick={() => addElement('number', '6')} className={buttonClass} size="sm">6</Button>
              <Button variant="outline" onClick={() => addElement('operator', '*')} className={buttonClass} size="sm"><X className="h-3 w-3" /></Button>
              <Button variant="outline" onClick={() => addStructure('parentheses')} className={buttonClass} size="sm"><Brackets className="h-3 w-3" /></Button>
              
              <Button variant="outline" onClick={() => addElement('number', '1')} className={buttonClass} size="sm">1</Button>
              <Button variant="outline" onClick={() => addElement('number', '2')} className={buttonClass} size="sm">2</Button>
              <Button variant="outline" onClick={() => addElement('number', '3')} className={buttonClass} size="sm">3</Button>
              <Button variant="outline" onClick={() => addElement('operator', '-')} className={buttonClass} size="sm"><Minus className="h-3 w-3" /></Button>
              <Button variant="outline" onClick={() => addStructure('power')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("x^n") }} />
              </Button>
              
              <Button variant="outline" onClick={() => addElement('number', '0')} className={buttonClass} size="sm">0</Button>
              <Button variant="outline" onClick={() => addElement('number', '.')} className={buttonClass} size="sm">.</Button>
              <Button variant="outline" onClick={() => addElement('variable', 'x')} className={buttonClass} size="sm">x</Button>
              <Button variant="outline" onClick={() => addElement('operator', '+')} className={buttonClass} size="sm"><Plus className="h-3 w-3" /></Button>
              <Button variant="outline" onClick={() => addStructure('sqrt')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("\\sqrt{x}") }} />
              </Button>
              
              <Button variant="outline" onClick={() => addElement('variable', 'pi')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("\\pi") }} />
              </Button>
              <Button variant="outline" onClick={() => addElement('variable', 'e')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("e") }} />
              </Button>
              <Button variant="outline" onClick={() => addElement('operator', '=')} className={buttonClass} size="sm">=</Button>
              <Button variant="outline" onClick={() => addStructure('fraction')} className={buttonClass} size="sm">
                <span dangerouslySetInnerHTML={{ __html: renderLatex("\\frac{a}{b}") }} />
              </Button>
              <Button variant="outline" onClick={calculateResult} className={buttonClass} size="sm">=</Button>
            </div>
          </>
        );
      case 'functions':
        return (
          <div className="grid grid-cols-4 gap-1">
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
            
            <Button variant="outline" onClick={() => addElement('function', 'asin')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\arcsin") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'acos')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\arccos") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'atan')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\arctan") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'atan2')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\arctan_2") }} />
            </Button>
            
            <Button variant="outline" onClick={() => addElement('function', 'log')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\log") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'log10')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\log_{10}") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'log2')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\log_{2}") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'ln')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\ln") }} />
            </Button>
          </div>
        );
      case 'calculus':
        return (
          <div className="grid grid-cols-4 gap-1">
            <Button variant="outline" onClick={() => addElement('function', 'diff')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\frac{d}{dx}") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'int')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\int") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'sum')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\sum") }} />
            </Button>
            <Button variant="outline" onClick={() => addElement('function', 'prod')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\prod") }} />
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
            <Button variant="outline" onClick={() => addElement('function', 'lim')} className={buttonClass} size="sm">
              <span dangerouslySetInnerHTML={{ __html: renderLatex("\\lim") }} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  // Render the math editor
  const renderEditor = () => {
    // Map element IDs to their rendered elements for click handling
    const renderElementWithClick = (elementId: string) => {
      const elem = document.getElementById(`math-elem-${elementId}`);
      if (elem) {
        elem.onclick = (e: any) => handleElementClick(elementId, e);
      }
    };
    
    // Add clickable attributes to rendered LaTeX
    const enhanceLatexWithClicks = (latex: string) => {
      let enhancedLatex = latex;
      Object.keys(elements).forEach(id => {
        enhancedLatex = enhancedLatex.replace(
          new RegExp(`<span class="katex-html" aria-hidden="true">(.*?)</span>`, 'g'),
          `<span id="math-elem-${id}" class="katex-html cursor-pointer" aria-hidden="true">$1</span>`
        );
      });
      return enhancedLatex;
    };
    
    // Add click handler to math elements after rendering
    useEffect(() => {
      Object.keys(elements).forEach(renderElementWithClick);
    }, [elements, activeElementId]);
    
    return (
      <div 
        ref={editorRef}
        className="p-4 bg-noir-accent rounded-md min-h-32 flex items-center justify-center cursor-text"
        onClick={() => {
          editorRef.current?.focus();
          setActiveElementId('root');
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div
          className="math-editor text-2xl katex-font"
          dangerouslySetInnerHTML={{ 
            __html: renderLatex(elementToLatex('root'))
          }}
        />
      </div>
    );
  };

  // Update selected state for elements
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

  // Add focus handler for the editor
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

  // Add KaTeX font styles
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
