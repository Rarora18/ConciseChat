import React from 'react'
import { Plus, MessageSquare } from 'lucide-react'
import { formatDate, truncateText } from '../utils/helpers'

function Sidebar({ 
  conversations, 
  currentConversationId, 
  onConversationSelect, 
  onNewConversation 
}) {
  return (
    <div className="h-full w-72 bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={onNewConversation}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No conversations yet</p>
            <p className="text-sm text-gray-400">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  conversation.id === currentConversationId
                    ? 'bg-blue-700 text-white'
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {conversation.messages.length} messages
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                </div>
                
                {conversation.messages.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    {truncateText(conversation.messages[conversation.messages.length - 1].content, 60)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          Concise Chat v1.0
        </div>
      </div>
    </div>
  )
}

export default Sidebar
