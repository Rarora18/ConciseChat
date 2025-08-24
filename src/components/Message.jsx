import React, { useState } from 'react'
import { Bot, User, ChevronDown, ChevronUp, GitBranch, Clock, Download, Copy, Check } from 'lucide-react'
import { formatTimestamp } from '../utils/helpers'

function Message({ message, onBranch, onToggleExpansion, isBranchView = false, conversationId }) {
  const isUser = message.role === 'user'
  const hasExpandedContent = message.expandedContent && message.expandedContent !== message.content
  const hasAttachments = message.attachments && message.attachments.length > 0
  const [copied, setCopied] = useState(false)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('text') || fileType.includes('code')) return '📝'
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('word') || fileType.includes('document')) return '📄'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️'
    return '📎'
  }

  const handleFileDownload = (file) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyContent = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className={`flex items-start space-x-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
        ${isUser 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
          : 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600'
        }
      `}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <div className={`
          inline-block rounded-2xl px-6 py-4 shadow-sm
          ${isUser 
            ? 'chat-message-user' 
            : 'chat-message-assistant'
          }
        `}>
          <div className="text-sm leading-relaxed">
            {message.content}
          </div>
          
          {/* File Attachments */}
          {hasAttachments && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Attachments ({message.attachments.length})
              </div>
              {message.attachments.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-xl">{getFileIcon(file.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)} • {file.type}
                    </div>
                  </div>
                  <button
                    onClick={() => handleFileDownload(file)}
                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-1"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Expanded content for AI messages */}
          {!isUser && hasExpandedContent && message.isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="relative">
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  {message.expandedContent}
                </div>
                <button
                  onClick={() => handleCopyContent(message.expandedContent)}
                  className="absolute top-2 right-2 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm"
                  title="Copy content"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className={`flex items-center space-x-3 mt-3 text-xs ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(message.timestamp)}</span>
          </div>

          {/* AI message actions */}
          {!isUser && (
            <div className="flex items-center space-x-2">
              {hasExpandedContent && (
                <button
                  onClick={() => onToggleExpansion(message.id, conversationId)}
                  className="btn-ghost px-2 py-1 rounded-lg text-xs font-medium hover-lift"
                >
                  {message.isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show more
                    </>
                  )}
                </button>
              )}

              {!isBranchView && (
                <button
                  onClick={() => onBranch(message.id, message.content)}
                  className="btn-ghost px-2 py-1 rounded-lg text-xs font-medium hover-lift"
                  title="Branch from this message"
                >
                  <GitBranch className="w-3 h-3 mr-1" />
                  Branch
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Message
