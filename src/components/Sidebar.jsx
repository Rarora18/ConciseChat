import React, { useState } from 'react'
import { Plus, MessageSquare, GitBranch, Clock, Network, Sun, Moon } from 'lucide-react'
import { formatDate } from '../utils/helpers'
import ConversationDiagram from './ConversationDiagram'
import { useTheme } from '../contexts/ThemeContext'

function Sidebar({ conversations, currentConversationId, onConversationSelect, onNewConversation }) {
  const [showDiagram, setShowDiagram] = useState(false)
    const { isDark, toggleTheme } = useTheme()
  return (
    <div className="h-full glass border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            Concise
          </h1>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">C</span>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Intelligent conversations with branching
        </p>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewConversation}
          className="w-full btn-primary rounded-xl py-3 px-4 flex items-center justify-center space-x-2 font-medium hover-lift"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Diagram Toggle Button */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowDiagram(!showDiagram)}
          className={`w-full rounded-xl py-2 px-4 flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 ${
            showDiagram 
              ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/50' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>{showDiagram ? 'Hide Diagram' : 'Show Diagram'}</span>
        </button>
      </div>

      {/* Theme Toggle Button */}
      <div className="px-4 pb-2">
        <button
          onClick={toggleTheme}
          className="w-full rounded-xl py-2 px-4 flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Conversations List or Diagram */}
      <div className="flex-1 overflow-y-auto scrollbar-modern">
        {showDiagram ? (
          <ConversationDiagram
            conversations={conversations}
            currentConversationId={currentConversationId}
            onConversationSelect={onConversationSelect}
            onBranchSelect={onConversationSelect}
          />
        ) : (
          <div className="p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No conversations yet</p>
                <p className="text-slate-400 text-xs mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              conversations
                .filter(conversation => !conversation.parentMessageId) // Only show main conversations, not branches
                .map((conversation) => {
                  const isActive = conversation.id === currentConversationId
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => onConversationSelect(conversation.id)}
                      className={`
                        group relative p-4 rounded-xl cursor-pointer transition-all duration-200 ease-out
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 shadow-sm' 
                          : 'hover:bg-slate-50/80 border border-transparent hover:border-slate-200/60'
                        }
                        hover-lift
                      `}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full"></div>
                      )}
                      
                      <div className="flex items-start space-x-3">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' 
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }
                          transition-all duration-200
                        `}>
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`
                              font-medium truncate
                              ${isActive ? 'text-slate-800' : 'text-slate-700'}
                            `}>
                              {conversation.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{conversation.messages.length}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(conversation.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/60">
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Powered by intelligent AI
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
