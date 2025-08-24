import React, { useRef, useEffect } from 'react'
import { Bot, X } from 'lucide-react'
import Message from './Message'
import MessageInput from './MessageInput'

function ChatInterface({ 
  conversation, 
  onSendMessage, 
  onBranchConversation, 
  onToggleExpansion, 
  isLoading,
  isBranchView = false,
  onCloseBranch
}) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])



  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Welcome to Concise Chat
          </h2>
          <p className="text-gray-500 mb-6">
            Start a new conversation to begin chatting with AI
          </p>
          <button
            onClick={() => onSendMessage('Hello', 'user')}
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
          >
            Start Chatting
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">
            {isBranchView ? 'Branch' : conversation.title}
          </h1>
          <p className="text-sm text-gray-400">
            {conversation.messages.length} messages
            {isBranchView && ' • Branch'}
          </p>
        </div>
        {isBranchView && onCloseBranch && (
          <button
            onClick={onCloseBranch}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            title="Close branch"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onBranch={onBranchConversation}
              onToggleExpansion={onToggleExpansion}
              isBranchView={isBranchView}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1 bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <MessageInput onSendMessage={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}

export default ChatInterface
