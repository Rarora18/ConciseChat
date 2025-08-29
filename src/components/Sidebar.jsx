import React, { useState } from 'react'
import { Plus, MessageSquare, GitBranch, Clock, Sun, Moon, ChevronDown, ChevronRight, X } from 'lucide-react'
import { formatDate } from '../utils/helpers'
import { useTheme } from '../contexts/ThemeContext'

function Sidebar({ conversations, currentConversationId, onConversationSelect, onNewConversation, onDeleteConversation, onToggleSidebar }) {
  const [expandedBranches, setExpandedBranches] = useState(new Set())
  const [deleteDialog, setDeleteDialog] = useState({ show: false, conversation: null, isMain: false })
  const { isDark, toggleTheme } = useTheme()

  const toggleBranchExpansion = (mainId) => {
    const newExpanded = new Set(expandedBranches)
    if (newExpanded.has(mainId)) {
      newExpanded.delete(mainId)
    } else {
      newExpanded.add(mainId)
    }
    setExpandedBranches(newExpanded)
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
            <div className="flex items-center justify-center">
              <img src="/favicon.png" alt="Concise" className="w-16 h-16 dark:invert dark:brightness-0 dark:contrast-200" />
            </div>
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Hide sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
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

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-modern">
        <div className="p-4 space-y-3">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No conversations yet</p>
              <p className="text-slate-400 text-xs mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            conversations
              .filter(conversation => !conversation.parentMessageId && conversation.messages) // Only show main conversations
              .map((conversation) => {
                const isActive = conversation.id === currentConversationId
                const branches = getBranchesForMain(conversation.id)
                const hasBranches = branches.length > 0
                const isExpanded = expandedBranches.has(conversation.id)
                
                return (
                  <div key={conversation.id} className="space-y-1">
                    {/* Main Conversation */}
                    <div
                      onClick={() => onConversationSelect(conversation.id)}
                      className={`
                        flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                        }
                      `}
                    >
                      <MessageSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {conversation.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {conversation.messages.length} messages • {formatDate(conversation.updatedAt)}
                          {hasBranches && (
                            <span className="text-green-600 dark:text-green-400 ml-1">• {branches.length} branches</span>
                          )}
                        </div>
                      </div>
                      {hasBranches && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleBranchExpansion(conversation.id)
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(conversation, true, e)
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete conversation"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Branches */}
                    {hasBranches && isExpanded && (
                      <div className="ml-6 space-y-1">
                        {branches.map((branch) => {
                          const isBranchActive = branch.id === currentConversationId
                          
                          return (
                            <div
                              key={branch.id}
                              onClick={() => onConversationSelect(branch.id)}
                              className={`
                                flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-200
                                ${isBranchActive 
                                  ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/50' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                                }
                              `}
                            >
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <GitBranch className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                  {branch.title}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {branch.messages.length} messages • {formatDate(branch.updatedAt)}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClick(branch, false, e)
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                title="Delete branch"
                              >
                                <X className="w-3 h-3" />
                              </button>
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
