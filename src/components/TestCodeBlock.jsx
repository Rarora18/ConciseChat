import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../contexts/ThemeContext'

function TestCodeBlock() {
  const { isDark } = useTheme()
  const syntaxTheme = isDark ? vscDarkPlus : oneLight
  
  const testCode = `function helloWorld() {
  const message = "Hello, World!";
  console.log(message);
  return message;
}

// This is a comment
const greeting = helloWorld();`

  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h3 className="text-white mb-4">Test Code Block</h3>
      <SyntaxHighlighter
        language="javascript"
        style={syntaxTheme}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '14px',
          lineHeight: '1.5',
          fontFamily: "'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace",
          background: 'transparent',
          borderRadius: 0,
          border: 'none'
        }}
        showLineNumbers={false}
        wrapLines={true}
      >
        {testCode}
      </SyntaxHighlighter>
    </div>
  )
}

export default TestCodeBlock
