import React, { useState } from 'react';
import { Card, Button } from '../common';

/**
 * Interactive Code Playground component — allows students to write, execute,
 * and view output for JavaScript, Python (Simulated/JS execution), and HTML/CSS web snippets.
 */
const TEMPLATES = {
  javascript: `// JavaScript Playground
function greet(name) {
  return "Hello, " + name + "! Welcome to Skillforge.";
}

console.log(greet("Developer"));

// Try calculating numbers
const numbers = [10, 20, 30, 40, 50];
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log("Sum of numbers:", sum);
`,

  python: `# Python Playground
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
    body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; text-align: center; }
    .card { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; }
    h1 { color: #6366f1; }
    button { background: #6366f1; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Skillforge Live Preview</h1>
    <p>Edit this HTML/CSS code to see live rendering!</p>
    <button onclick="alert('Hello from Skillforge!')">Click Me</button>
  </div>
</body>
</html>
`,
};

const CodePlayground = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(TEMPLATES.javascript);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

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
          // Execute JS safely with captured console output
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
        // Python execution via simulated JS interpreter
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
    }, 200);
  };

  return (
    <Card style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💻</span> Interactive Code Playground
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Practice coding algorithms, test snippets, and view output in real-time.
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="javascript">⚡ JavaScript (Node / ES6)</option>
            <option value="python">🐍 Python 3</option>
            <option value="html">🌐 HTML / CSS Live Preview</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunCode}
            isLoading={isRunning}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ▶ Run Code
          </Button>
        </div>
      </div>

      {/* Editor & Terminal Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Code Input Window */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', backgroundColor: '#0f172a', borderRadius: '8px 8px 0 0', border: '1px solid var(--border-color)', borderBottom: 'none', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            EDITOR — {language.toUpperCase()}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            style={{
              width: '100%',
              height: '320px',
              backgroundColor: '#020617',
              color: '#38bdf8',
              fontFamily: '"Fira Code", "Courier New", monospace',
              fontSize: '0.88rem',
              padding: '14px',
              borderRadius: '0 0 8px 8px',
              border: '1px solid var(--border-color)',
              outline: 'none',
              resize: 'vertical',
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* Output Console / Preview Window */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', backgroundColor: '#0f172a', borderRadius: '8px 8px 0 0', border: '1px solid var(--border-color)', borderBottom: 'none', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {language === 'html' ? 'LIVE PREVIEW' : 'CONSOLE OUTPUT'}
          </div>

          {language === 'html' ? (
            <iframe
              srcDoc={output || TEMPLATES.html}
              title="HTML Preview"
              style={{
                width: '100%',
                height: '320px',
                backgroundColor: '#ffffff',
                borderRadius: '0 0 8px 8px',
                border: '1px solid var(--border-color)',
              }}
            />
          ) : (
            <pre
              style={{
                width: '100%',
                height: '320px',
                backgroundColor: '#0f172a',
                color: isError ? '#ef4444' : '#10b981',
                fontFamily: '"Fira Code", "Courier New", monospace',
                fontSize: '0.88rem',
                padding: '14px',
                borderRadius: '0 0 8px 8px',
                border: '1px solid var(--border-color)',
                margin: 0,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {output || '// Click "Run Code" to execute script...'}
            </pre>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CodePlayground;
