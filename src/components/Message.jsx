import React from 'react'
import { Bot, User, ChevronDown, ChevronUp, GitBranch, Clock } from 'lucide-react'
import { formatTimestamp } from '../utils/helpers'

function Message({ message, onBranch, onToggleExpansion }) {
  const isUser = message.role === 'user'
  const hasExpandedContent = message.expandedContent && message.expandedContent !== message.content

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary-600' : 'bg-primary-100'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-primary-600" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block rounded-lg px-4 py-3 ${
          isUser 
            ? 'bg-primary-600 text-white' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="text-sm">
            {message.content}
          </div>
          
          {/* Expanded content for AI messages */}
          {!isUser && hasExpandedContent && message.isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                {message.expandedContent}
              </div>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className={`flex items-center space-x-2 mt-2 text-xs text-gray-500 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(message.timestamp)}</span>
          </div>

          {/* AI message actions */}
          {!isUser && (
            <>
              {hasExpandedContent && (
                <button
                  onClick={() => onToggleExpansion(message.id)}
                  className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
                >
                  {message.isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      <span>Show less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      <span>Show more</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => onBranch(message.id, message.content)}
                className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
                title="Branch from this message"
              >
                <GitBranch className="w-3 h-3" />
                <span>Branch</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Message
