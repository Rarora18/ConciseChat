import React from 'react'
import { MessageSquare, GitBranch, ChevronRight, ChevronDown } from 'lucide-react'
import { formatDate } from '../utils/helpers'

function ConversationDiagram({ conversations, currentConversationId, onConversationSelect, onBranchSelect }) {
  const [expandedBranches, setExpandedBranches] = React.useState(new Set())

  // Group conversations by main and branches
  const mainConversations = conversations.filter(conv => !conv.parentMessageId)
  const branchConversations = conversations.filter(conv => conv.parentMessageId)

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
    return branchConversations.filter(branch => {
      // Find the main conversation that this branch was created from
      const mainConv = conversations.find(conv => conv.id === mainId)
      if (!mainConv) return false
      
      // Check if this branch was created from any message in the main conversation
      return branch.parentMessageId && mainConv.messages.some(msg => msg.id === branch.parentMessageId)
    })
  }

  if (mainConversations.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Conversation Structure</h3>
        <div className="text-xs text-slate-500">
          {mainConversations.length} main • {branchConversations.length} branches
        </div>
      </div>

      <div className="space-y-2">
        {mainConversations.map((mainConv) => {
          const branches = getBranchesForMain(mainConv.id)
          const isExpanded = expandedBranches.has(mainConv.id)
          const isActive = mainConv.id === currentConversationId
          const hasBranches = branches.length > 0

          return (
            <div key={mainConv.id} className="space-y-1">
              {/* Main Conversation */}
              <div
                onClick={() => onConversationSelect(mainConv.id)}
                className={`
                  flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                  }
                `}
              >
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">
                    {mainConv.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {mainConv.messages.length} messages • {formatDate(mainConv.updatedAt)}
                  </div>
                </div>
                {hasBranches && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBranchExpansion(mainConv.id)
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Branches */}
              {hasBranches && isExpanded && (
                <div className="ml-6 space-y-1">
                  {branches.map((branch) => {
                    const isBranchActive = branch.id === currentConversationId
                    
                    return (
                      <div
                        key={branch.id}
                        onClick={() => onBranchSelect(branch.id)}
                        className={`
                          flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-200
                          ${isBranchActive 
                            ? 'bg-green-50 border border-green-200' 
                            : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                          }
                        `}
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <GitBranch className="w-4 h-4 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700 truncate">
                            {branch.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {branch.messages.length} messages • {formatDate(branch.updatedAt)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-3 h-3 text-slate-600" />
            <span>Main conversation</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitBranch className="w-3 h-3 text-green-600" />
            <span>Branch conversation</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationDiagram
