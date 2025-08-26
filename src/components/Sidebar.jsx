import React, { useState } from 'react'
import { Plus, MessageSquare, GitBranch, Clock, Network, Sun, Moon, ChevronDown, ChevronRight, X } from 'lucide-react'
import { formatDate } from '../utils/helpers'
import ConversationDiagram from './ConversationDiagram'
import { useTheme } from '../contexts/ThemeContext'

function Sidebar({ conversations, currentConversationId, onConversationSelect, onNewConversation, onDeleteConversation }) {
  const [showDiagram, setShowDiagram] = useState(false)
  const [collapsedConversations, setCollapsedConversations] = useState(new Set())
  const [deleteDialog, setDeleteDialog] = useState({ show: false, conversation: null, isMain: false })
  const { isDark, toggleTheme } = useTheme()

  const toggleConversationCollapse = (conversationId) => {
    setCollapsedConversations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId)
      } else {
        newSet.add(conversationId)
      }
      return newSet
    })
  }

  const getBranchesForMain = (mainId) => {
    return conversations.filter(conv => conv.parentMessageId && 
      conversations.find(main => main.id === mainId)?.messages.some(msg => msg.id === conv.parentMessageId))
  }

  const handleDeleteClick = (conversation, isMain, e) => {
    e.stopPropagation()
    setDeleteDialog({ show: true, conversation, isMain })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialog.conversation && onDeleteConversation) {
      onDeleteConversation(deleteDialog.conversation.id, deleteDialog.isMain)
    }
    setDeleteDialog({ show: false, conversation: null, isMain: false })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ show: false, conversation: null, isMain: false })
  }

  return (
    <div className="h-full glass border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col">
      {/* Header */}
              <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Concise
            </h1>
                              <div className="w-16 h-16 flex items-center justify-center">
                    <img src="/favicon.png" alt="Concise" className="w-12 h-12 dark:invert dark:brightness-0 dark:contrast-200" />
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
                        .filter(conversation => !conversation.parentMessageId) // Only show main conversations
                        .map((conversation) => {
                          const isActive = conversation.id === currentConversationId
                          const branches = getBranchesForMain(conversation.id)
                          const hasBranches = branches.length > 0
                          const isCollapsed = collapsedConversations.has(conversation.id)
                          
                          return (
                            <div key={conversation.id} className="space-y-1">
                              {/* Main Conversation */}
                              <div
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
                                        text-base font-medium truncate
                                        ${isActive ? 'text-slate-800' : 'text-slate-700'}
                                      `}>
                                        {conversation.title}
                                      </h3>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                      <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1">
                                          <MessageSquare className="w-3 h-3" />
                                          <span>{conversation.messages.length}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center space-x-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{formatDate(conversation.updatedAt)}</span>
                                        </div>
                                        {hasBranches && (
                                          <>
                                            <span>•</span>
                                            <span className="text-green-600">{branches.length} branches</span>
                                          </>
                                        )}
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        {hasBranches && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              toggleConversationCollapse(conversation.id)
                                            }}
                                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                          >
                                            {isCollapsed ? (
                                              <ChevronRight className="w-4 h-4" />
                                            ) : (
                                              <ChevronDown className="w-4 h-4" />
                                            )}
                                          </button>
                                        )}
                                        <button
                                          onClick={(e) => handleDeleteClick(conversation, true, e)}
                                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                          title="Delete conversation"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Branch Conversations */}
                              {hasBranches && !isCollapsed && (
                                <div className="ml-4 space-y-1">
                                  {branches.map((branch) => {
                                    const isBranchActive = branch.id === currentConversationId
                                    
                                    return (
                                      <div
                                        key={branch.id}
                                        onClick={() => onConversationSelect(branch.id)}
                                        className={`
                                          group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ease-out
                                          ${isBranchActive 
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 shadow-sm' 
                                            : 'hover:bg-slate-50/80 border border-transparent hover:border-slate-200/60'
                                          }
                                          hover-lift
                                        `}
                                      >
                                        <div className="flex items-start space-x-2">
                                          <div className={`
                                            w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0
                                            ${isBranchActive 
                                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                            }
                                            transition-all duration-200
                                          `}>
                                            <GitBranch className="w-3 h-3" />
                                          </div>
                                          
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <h4 className={`
                                                text-sm font-medium truncate
                                                ${isBranchActive ? 'text-slate-800' : 'text-slate-700'}
                                              `}>
                                                {branch.title}
                                              </h4>
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                              <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-1">
                                                  <GitBranch className="w-3 h-3" />
                                                  <span>{branch.messages.length}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center space-x-1">
                                                  <Clock className="w-3 h-3" />
                                                  <span>{formatDate(branch.updatedAt)}</span>
                                                </div>
                                              </div>
                                              <button
                                                onClick={(e) => handleDeleteClick(branch, false, e)}
                                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                title="Delete branch"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
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

      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Delete {deleteDialog.isMain ? 'Conversation' : 'Branch'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-slate-700 dark:text-slate-300">
                {deleteDialog.isMain 
                  ? `Are you sure you want to delete "${deleteDialog.conversation?.title}"? This will also delete all ${getBranchesForMain(deleteDialog.conversation?.id).length} branches associated with it.`
                  : `Are you sure you want to delete the branch "${deleteDialog.conversation?.title}"?`
                }
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
