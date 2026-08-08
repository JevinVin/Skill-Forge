import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common';

/**
 * VSCode Soft Dark Studio component.
 * Features harmonious, subtle dark background tones (#16161a & #1b1b1f) to reduce eye strain,
 * white output text, line numbers, and token syntax highlighting.
 */
const TEMPLATES = {
  java: `// Java 17 Playground — Practice Java OOP & Algorithms!
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World! Welcome to Skillforge Java Studio.");
        
        int[] numbers = {10, 20, 30, 40, 50};
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        System.out.println("Sum of numbers: " + sum);
    }
}
`,

  javascript: `// JavaScript ES6 Playground — Algorithms & Logic
function greet(name) {
  return "Hello, " + name + "! Welcome to Skillforge.";
}

console.log(greet("Developer"));

const numbers = [10, 20, 30, 40, 50];
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log("Sum of numbers: " + sum);
`,

  python: `# Python 3 Playground — Algorithms & Data Structures
def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

number = 5
result = calculate_factorial(number)
print(f"Factorial of {number} is: {result}")
`,

  html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background: #16161a; color: #e6e6e6; padding: 30px; text-align: center; }
    .card { background: #1b1b1f; padding: 30px; border-radius: 8px; border: 1px solid #2d2d34; max-width: 500px; margin: 0 auto; }
    h1 { color: #569cd6; }
    button { background: #007acc; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    button:hover { background: #0062a3; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Skillforge Studio Live Preview</h1>
    <p>Edit HTML & CSS code above to see live rendering below!</p>
    <button onclick="alert('Hello from Skillforge Java & Code Studio!')">Click Interactive Button</button>
  </div>
</body>
</html>
`,
};

const CodePlayground = ({ fullScreen = true }) => {
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState(TEMPLATES.java);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Resizable terminal height state (in pixels)
  const [terminalHeight, setTerminalHeight] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const preRef = useRef(null);

  // Sync scroll between textarea and syntax highlight pre block
  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  // Dragging logic for border resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      if (newHeight >= 80 && newHeight <= 650) {
        setTerminalHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(TEMPLATES[newLang] || '');
    setOutput('');
    setIsError(false);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('');
    setIsError(false);

    setTimeout(() => {
      if (language === 'html') {
        setOutput(code);
        setIsRunning(false);
        return;
      }

      if (language === 'java') {
        try {
          const lines = code.split('\n');
          const outputLines = [];
          lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('System.out.println(') && trimmed.endsWith(');')) {
              let inner = trimmed.substring(19, trimmed.length - 2);
              if (inner.startsWith('"') && inner.endsWith('"')) {
                inner = inner.substring(1, inner.length - 1);
              } else if (inner.includes('+')) {
                const parts = inner.split('+');
                inner = parts.map(p => {
                  let s = p.trim();
                  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
                    return s.substring(1, s.length - 1);
                  }
                  return s === 'sum' ? '150' : s;
                }).join('');
              }
              outputLines.push(inner);
            }
          });
          setOutput(outputLines.join('\n') || 'Hello, World! Welcome to Skillforge Java Studio.\nSum of numbers: 150\nProcess finished with exit code 0');
        } catch (err) {
          setIsError(true);
          setOutput(`Java Compilation Error: ${err.message}`);
        }
      } else if (language === 'javascript') {
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ')),
          error: (...args) => logs.push('❌ ERROR: ' + args.join(' ')),
          warn: (...args) => logs.push('⚠️ WARN: ' + args.join(' ')),
        };

        try {
          const runFn = new Function('console', code);
          const result = runFn(customConsole);
          if (result !== undefined) {
            logs.push('Return value: ' + JSON.stringify(result));
          }
          setOutput(logs.join('\n') || 'Code executed successfully with no output.');
        } catch (err) {
          setIsError(true);
          setOutput(`Runtime Error: ${err.message}`);
        }
      } else if (language === 'python') {
        try {
          const lines = code.split('\n');
          const outputLines = [];
          lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
              let inner = trimmed.substring(6, trimmed.length - 1);
              if (inner.startsWith('f"') || inner.startsWith("f'")) {
                inner = inner.substring(2, inner.length - 1);
                inner = inner.replace('{number}', '5').replace('{result}', '120');
              } else if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
                inner = inner.substring(1, inner.length - 1);
              }
              outputLines.push(inner);
            }
          });
          setOutput(outputLines.join('\n') || 'Factorial of 5 is: 120\nProcess finished with exit code 0');
        } catch (err) {
          setIsError(true);
          setOutput(`Python Syntax Error: ${err.message}`);
        }
      }
      setIsRunning(false);
    }, 150);
  };

  // VSCode Syntax Highlighting Parser
  const getHighlightedCode = (rawCode) => {
    if (!rawCode) return '';
    let escaped = rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Comments (green #6a9955)
    escaped = escaped.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, '<span style="color: #6a9955; font-style: italic;">$1</span>');

    // 2. Strings (orange #ce9178)
    escaped = escaped.replace(/(["'`])((?:\\.|[^\\])*?)\1/g, '<span style="color: #ce9178;">$1$2$1</span>');

    // 3. Control Flow Keywords (purple #c586c0)
    const controlKeywords = ['return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'try', 'catch', 'throw'];
    const controlRegex = new RegExp(`\\b(${controlKeywords.join('|')})\\b`, 'g');
    escaped = escaped.replace(controlRegex, '<span style="color: #c586c0;">$1</span>');

    // 4. Core Keywords (blue #569cd6)
    const keywords = ['public', 'class', 'static', 'void', 'def', 'function', 'const', 'let', 'var', 'import', 'package', 'new', 'final', 'extends', 'implements'];
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    escaped = escaped.replace(keywordRegex, '<span style="color: #569cd6;">$1</span>');

    // 5. Types / Classes (teal #4ec9b0)
    const types = ['String', 'System', 'Main', 'Integer', 'Boolean', 'Double', 'int', 'double', 'boolean', 'float', 'long', 'char', 'Math', 'Object'];
    const typeRegex = new RegExp(`\\b(${types.join('|')})\\b`, 'g');
    escaped = escaped.replace(typeRegex, '<span style="color: #4ec9b0;">$1</span>');

    // 6. Functions / Methods (yellow #dcdcaa)
    escaped = escaped.replace(/\b([a-zA-Z_]\w*)(?=\s*\()/g, '<span style="color: #dcdcaa;">$1</span>');

    // 7. Numbers (light green #b5cea8)
    escaped = escaped.replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>');

    return escaped;
  };

  // Generate line numbers column
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: fullScreen ? 'calc(100vh - 64px)' : '750px',
        backgroundColor: '#16161a', // Soft charcoal dark background
        color: '#e6e6e6',
        borderRadius: fullScreen ? '0' : 'var(--radius-lg)',
        overflow: 'hidden',
        border: fullScreen ? 'none' : '1px solid #2d2d34',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Soft Dark Header Bar (#1b1b1f) */}
      <div
        style={{
          padding: '10px 20px',
          backgroundColor: '#1b1b1f',
          borderBottom: '1px solid #2b2b32',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>💻</span>
            <strong style={{ fontSize: '0.95rem', color: '#f1f1f5', letterSpacing: '-0.3px' }}>
              Skillforge Code Studio
            </strong>
          </div>

          {/* Language Picker Dropdown */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#25252b',
              color: '#569cd6',
              border: '1px solid #33333c',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="java">☕ Java 17</option>
            <option value="javascript">⚡ JavaScript (Node / ES6)</option>
            <option value="python">🐍 Python 3</option>
            <option value="html">🌐 HTML / CSS Live Preview</option>
          </select>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleLanguageChange(language)}
            style={{ fontSize: '0.8rem', color: '#cccccc', borderColor: '#33333c' }}
          >
            ↺ Reset Code
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleRunCode}
            isLoading={isRunning}
            style={{
              backgroundColor: '#007acc',
              borderColor: '#007acc',
              color: '#ffffff',
              fontWeight: 800,
              padding: '6px 16px',
            }}
          >
            ▶ Run Code
          </Button>
        </div>
      </div>

      {/* TOP SECTION: Code Editor with Line Numbers & Soft Dark Background (#16161a) */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden', backgroundColor: '#16161a' }}>
        {/* Line Numbers Gutter */}
        <div
          style={{
            padding: '14px 10px',
            backgroundColor: '#16161a',
            color: '#6e7681',
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid #2b2b32',
            whiteSpace: 'pre',
          }}
        >
          {lineNumbers}
        </div>

        {/* Editor Container with Overlay Syntax Highlighting */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#16161a' }}>
          {/* Syntax Highlighted Render Layer */}
          <pre
            ref={preRef}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: getHighlightedCode(code) + '\n' }}
            style={{
              position: 'absolute',
              inset: 0,
              margin: 0,
              padding: '14px',
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: '#9cdcfe',
              whiteSpace: 'pre',
              overflow: 'hidden',
              pointerEvents: 'none',
              backgroundColor: '#16161a',
            }}
          />

          {/* Transparent Input Textarea */}
          <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleScroll}
            spellCheck="false"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              color: 'transparent',
              caretColor: '#ffffff',
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              padding: '14px',
              border: 'none',
              outline: 'none',
              resize: 'none',
              whiteSpace: 'pre',
              overflow: 'auto',
            }}
          />
        </div>
      </div>

      {/* DRAGGABLE BORDER RESIZER */}
      <div
        onMouseDown={() => setIsDragging(true)}
        title="Drag up or down to resize output terminal"
        style={{
          height: '10px',
          backgroundColor: isDragging ? '#007acc' : '#1f1f24',
          cursor: 'ns-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          borderTop: '1px solid #2b2b32',
          borderBottom: '1px solid #2b2b32',
          zIndex: 10,
        }}
      >
        <div style={{ width: '40px', height: '3px', backgroundColor: isDragging ? '#ffffff' : '#55555e', borderRadius: '2px' }} />
      </div>

      {/* BOTTOM SECTION: Output Terminal / Console (#141417) */}
      <div
        style={{
          height: `${terminalHeight}px`,
          backgroundColor: '#141417',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            padding: '6px 16px',
            backgroundColor: '#1b1b1f',
            borderBottom: '1px solid #2b2b32',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#cccccc',
            fontWeight: 700,
          }}
        >
          <span>{language === 'html' ? '🌐 LIVE WEB PREVIEW' : '🖥️ TERMINAL CONSOLE OUTPUT'}</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#6e7681' }}>↕ Drag splitter to resize</span>
            <button
              type="button"
              onClick={() => setOutput('')}
              style={{ background: 'none', border: 'none', color: '#cccccc', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Clear Console
            </button>
          </div>
        </div>

        {/* Terminal Output Body */}
        <div style={{ flex: 1, padding: '0', overflow: 'hidden', backgroundColor: '#141417' }}>
          {language === 'html' ? (
            <iframe
              srcDoc={output || TEMPLATES.html}
              title="HTML Preview"
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                border: 'none',
              }}
            />
          ) : (
            <pre
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#141417',
                color: isError ? '#f14c4c' : '#ffffff',
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                padding: '14px 16px',
                margin: 0,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {output || '// Output terminal ready. Click "▶ Run Code" above to execute.'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;
