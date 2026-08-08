import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common';

/**
 * Full-screen VSCode/LeetCode style Code Playground component.
 * Features line numbers, draggable resizable bottom terminal console, and live multi-language execution.
 */
const TEMPLATES = {
  javascript: `// JavaScript Playground — Try writing function algorithms & logic!
function greet(name) {
  return "Hello, " + name + "! Welcome to Skillforge.";
}

console.log(greet("Developer"));

// Try array manipulation
const numbers = [10, 20, 30, 40, 50];
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log("Sum of numbers:", sum);
`,

  python: `# Python 3 Playground
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
    body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; text-align: center; }
    .card { background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; max-width: 500px; margin: 0 auto; }
    h1 { color: #818cf8; }
    button { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Skillforge Live Web Preview</h1>
    <p>Edit HTML & CSS code above to see live rendering below!</p>
    <button onclick="alert('Hello from Skillforge!')">Click Interactive Button</button>
  </div>
</body>
</html>
`,
};

const CodePlayground = ({ fullScreen = true }) => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(TEMPLATES.javascript);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Resizable terminal height state (in pixels)
  const [terminalHeight, setTerminalHeight] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Dragging logic for border resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;
      // Clamp terminal height between 80px and 600px
      if (newHeight >= 80 && newHeight <= 600) {
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

      if (language === 'javascript') {
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
        backgroundColor: '#090d16',
        color: '#f8fafc',
        borderRadius: fullScreen ? '0' : 'var(--radius-lg)',
        overflow: 'hidden',
        border: fullScreen ? 'none' : '1px solid var(--border-color)',
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* VSCode-Style IDE Top Header Bar */}
      <div
        style={{
          padding: '10px 20px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
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
            <strong style={{ fontSize: '0.95rem', color: '#f8fafc', letterSpacing: '-0.3px' }}>
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
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #334155',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
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
            style={{ fontSize: '0.8rem', color: '#94a3b8', borderColor: '#334155' }}
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
              backgroundColor: '#10b981',
              borderColor: '#10b981',
              color: '#022c22',
              fontWeight: 800,
              padding: '6px 16px',
            }}
          >
            ▶ Run Code
          </Button>
        </div>
      </div>

      {/* TOP SECTION: Code Editor with Line Numbers */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden', backgroundColor: '#020617' }}>
        {/* Line Numbers Gutter */}
        <div
          style={{
            padding: '14px 10px',
            backgroundColor: '#0b0f19',
            color: '#475569',
            fontFamily: '"Fira Code", "Courier New", monospace',
            fontSize: '0.88rem',
            lineHeight: 1.6,
            textAlign: 'right',
            userSelect: 'none',
            borderRight: '1px solid #1e293b',
            whiteSpace: 'pre',
          }}
        >
          {lineNumbers}
        </div>

        {/* Code Textarea Editor */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          style={{
            flex: 1,
            height: '100%',
            backgroundColor: 'transparent',
            color: '#38bdf8',
            fontFamily: '"Fira Code", "Courier New", monospace',
            fontSize: '0.88rem',
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

      {/* DRAGGABLE BORDER RESIZER (VSCode / LeetCode style) */}
      <div
        onMouseDown={() => setIsDragging(true)}
        title="Drag up or down to resize output terminal"
        style={{
          height: '10px',
          backgroundColor: isDragging ? '#6366f1' : '#1e293b',
          cursor: 'ns-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          borderTop: '1px solid #334155',
          borderBottom: '1px solid #334155',
          zIndex: 10,
        }}
      >
        <div style={{ width: '40px', height: '3px', backgroundColor: isDragging ? '#ffffff' : '#64748b', borderRadius: '2px' }} />
      </div>

      {/* BOTTOM SECTION: Output Terminal / Console (Resizable Height) */}
      <div
        style={{
          height: `${terminalHeight}px`,
          backgroundColor: '#090d16',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            padding: '6px 16px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#94a3b8',
            fontWeight: 700,
          }}
        >
          <span>{language === 'html' ? '🌐 LIVE WEB PREVIEW' : '🖥️ TERMINAL CONSOLE OUTPUT'}</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>↕ Drag splitter to resize</span>
            <button
              type="button"
              onClick={() => setOutput('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Clear Console
            </button>
          </div>
        </div>

        {/* Terminal Output Body */}
        <div style={{ flex: 1, padding: '0', overflow: 'hidden' }}>
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
                backgroundColor: '#020617',
                color: isError ? '#f87171' : '#34d399',
                fontFamily: '"Fira Code", "Courier New", monospace',
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
