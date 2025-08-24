import React from 'react'
import { Bot, User, ChevronDown, ChevronUp, GitBranch, Clock, Sparkles } from 'lucide-react'
import { formatTimestamp } from '../utils/helpers'

function Message({ message, onBranch, onToggleExpansion, isBranchView = false, conversationId }) {
  const isUser = message.role === 'user'
  const hasExpandedContent = message.expandedContent && message.expandedContent !== message.content

  return (
    <div className={`flex items-start space-x-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
        ${isUser 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
          : 'bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-200'
        }
      `}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-slate-600" />
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
          
          {/* Expanded content for AI messages */}
          {!isUser && hasExpandedContent && message.isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <div className="text-sm text-slate-700 leading-relaxed">
                {message.expandedContent}
              </div>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className={`flex items-center space-x-3 mt-3 text-xs ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <div className="flex items-center space-x-1 text-slate-400">
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
