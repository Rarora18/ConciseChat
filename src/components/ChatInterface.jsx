import React, { useRef, useEffect } from 'react'
import { Send, Bot } from 'lucide-react'
import Message from './Message'

function ChatInterface({ 
  conversation, 
  onSendMessage, 
  onBranchConversation, 
  onToggleExpansion, 
  isLoading 
}) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const content = e.target.value.trim()
      if (content) {
        onSendMessage(content, 'user')
        e.target.value = ''
      }
    }
  }

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
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-100">
          {conversation.title}
        </h1>
        <p className="text-sm text-gray-400">
          {conversation.messages.length} messages
        </p>
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
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 bg-gray-700 text-gray-200 placeholder-gray-500 px-4 py-2 rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={() => {
            const input = document.querySelector('input[type="text"]')
            const content = input.value.trim()
            if (content) {
              onSendMessage(content, 'user')
              input.value = ''
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ChatInterface
