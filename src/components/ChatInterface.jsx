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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">
            Welcome to Concise
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Start a new conversation to begin chatting with intelligent AI. 
            Explore topics, ask questions, and branch into new discussions.
          </p>
          <button
            onClick={() => onSendMessage('Hello', 'user')}
            className="btn-primary rounded-xl px-8 py-4 text-lg font-medium hover-lift"
          >
            Start Chatting
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="glass border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {isBranchView ? 'Branch Conversation' : conversation.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <span>{conversation.messages.length} messages</span>
            {isBranchView && (
              <>
                <span>•</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  Branch
                </span>
              </>
            )}
          </p>
        </div>
        {isBranchView && onCloseBranch && (
          <button
            onClick={onCloseBranch}
            className="btn-ghost p-2 rounded-lg hover-lift"
            title="Close branch"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-modern p-6 space-y-6">
        {conversation.messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No messages yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Start the conversation below</p>
          </div>
        ) : (
          conversation.messages.map((message, index) => (
            <div key={message.id} className="slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <Message
                message={message}
                onBranch={onBranchConversation}
                onToggleExpansion={onToggleExpansion}
                isBranchView={isBranchView}
                conversationId={conversation.id}
              />
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start space-x-4 slide-up">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 glass rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass border-t border-slate-200/60 dark:border-slate-700/60 p-6">
        <MessageInput onSendMessage={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}

export default ChatInterface
