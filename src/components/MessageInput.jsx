import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, X, FileText, FileImage, FileSpreadsheet, FileCode } from 'lucide-react'
import { isFileTypeSupported } from '../utils/fileProcessor'

function MessageInput({ onSendMessage, disabled = false }) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if ((message.trim() || attachments.length > 0) && !disabled) {
      onSendMessage(message.trim(), 'user', attachments)
      setMessage('')
      setAttachments([])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      // Check file size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      
      // Check if file type is supported
      if (!isFileTypeSupported(file.name)) {
        alert(`File type not supported: ${file.name}. Supported types include PDF, Word, Excel, CSV, text files, and images.`)
        return false
      }
      
      return true
    })
    
    setAttachments(prev => [...prev, ...validFiles])
    e.target.value = '' // Reset input
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType, fileName) => {
    const ext = fileName.split('.').pop().toLowerCase()
    
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || ext === 'docx' || ext === 'doc') return '📝'
    if (fileType.includes('excel') || ext === 'xlsx' || ext === 'xls') return '📊'
    if (ext === 'csv') return '📈'
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'html', 'css', 'scss', 'json', 'xml'].includes(ext)) return '💻'
    if (fileType.includes('text') || fileType.includes('code')) return '📝'
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦'
    return '📎'
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  return (
    <div className="space-y-3">
      {/* File Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-slate-300 shadow-sm">
              <span className="text-lg">{getFileIcon(file.type, file.name)}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-700 truncate max-w-32">
                  {file.name}
                </span>
                <span className="text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or attach files..."
            disabled={disabled}
            className="w-full resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 border border-slate-300 dark:border-slate-600 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-sm"
            rows="1"
          />
          
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
            title="Attach files (PDF, Word, Excel, CSV, text, images)"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.json,.xml,.js,.ts,.jsx,.tsx,.html,.css,.scss,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
          />
        </div>
        
        <button
          type="submit"
          disabled={(!message.trim() && attachments.length === 0) || disabled}
          className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

export default MessageInput
