import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../contexts/ThemeContext'

function CodeBlock({ code, language = 'javascript', filename }) {
  const [copied, setCopied] = useState(false)
  const { isDark } = useTheme()
  
  // Select theme based on current mode
  const syntaxTheme = isDark ? vscDarkPlus : oneLight

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const getLanguageDisplayName = (lang) => {
    const languageMap = {
      js: 'JavaScript',
      javascript: 'JavaScript',
      ts: 'TypeScript',
      typescript: 'TypeScript',
      jsx: 'JSX',
      tsx: 'TSX',
      html: 'HTML',
      markup: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      json: 'JSON',
      bash: 'Bash',
      sh: 'Shell',
      sql: 'SQL',
      md: 'Markdown',
      markdown: 'Markdown',
      py: 'Python',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      php: 'PHP',
      rb: 'Ruby',
      go: 'Go',
      rs: 'Rust'
    }
    return languageMap[lang] || lang
  }

  // Map language aliases to supported languages
  const getSupportedLanguage = (lang) => {
    const langMap = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript',
      html: 'markup',
      markup: 'markup',
      scss: 'css',
      sh: 'bash',
      md: 'markdown',
      py: 'python',
      cpp: 'cpp',
      rs: 'rust'
    }
    return langMap[lang] || lang
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          {filename && (
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">
              {filename}
            </span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
            {getLanguageDisplayName(language)}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Code Content */}
      <div className="relative">
        <SyntaxHighlighter
          language={getSupportedLanguage(language)}
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
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

export default CodeBlock
