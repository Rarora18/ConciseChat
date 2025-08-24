import React, { useState, useCallback } from 'react'
import { generateId } from './utils/helpers'
import { generateIntelligentResponse } from './services/aiService'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'

function App() {
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [branchConversationId, setBranchConversationId] = useState(null) // Track the branch conversation
  const [isLoading, setIsLoading] = useState(false)
  const [branchLoading, setBranchLoading] = useState(false)

  const createNewConversation = useCallback(() => {
    const newConversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setConversations(prev => [...prev, newConversation])
    setCurrentConversationId(newConversation.id)
    setBranchConversationId(null) // Reset branching
  }, [])

  const addMessage = useCallback(async (content, role = 'user', targetConversationId) => {
    // Use provided target conversation ID or current conversation ID
    const actualTargetId = targetConversationId || currentConversationId
    
    // Create new conversation if none exists
    if (!actualTargetId) {
      createNewConversation()
      return
    }
    
    // Ensure the target conversation exists
    const targetConversation = conversations.find(conv => conv.id === actualTargetId)
    if (!targetConversation) return

    const newMessage = {
      id: generateId(),
      content,
      role,
      timestamp: new Date(),
      conversationId: actualTargetId
    }

    // Add the user message to the correct conversation
    setConversations(prev => prev.map(conv => 
      conv.id === actualTargetId 
        ? { 
            ...conv, 
            messages: [...conv.messages, newMessage],
            updatedAt: new Date(),
            title: conv.messages.length === 0 ? content.substring(0, 30) + (content.length > 30 ? '...' : '') : conv.title
          }
        : conv
    ))

    // Generate AI response for user messages
    if (role === 'user') {
      // Set loading state based on which conversation is being updated
      if (actualTargetId === currentConversationId) {
        setIsLoading(true)
      } else if (actualTargetId === branchConversationId) {
        setBranchLoading(true)
      }
      
      // Get the target conversation to check if it's a branch with history
      const targetConversation = conversations.find(conv => conv.id === actualTargetId)
      
      // For branch conversations, include conversation history in the AI response
      let aiResponse
      if (targetConversation && targetConversation.conversationHistory) {
        // Create context from conversation history
        const context = targetConversation.conversationHistory
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n')
        
        // Pass context to intelligent AI response generation
        aiResponse = await generateIntelligentResponse(content, context)
      } else {
        // Regular AI response for main conversations
        aiResponse = await generateIntelligentResponse(content)
      }
      
      const aiMessage = {
        id: generateId(),
        content: aiResponse.short,
        role: 'assistant',
        timestamp: new Date(),
        conversationId: actualTargetId,
        expandedContent: aiResponse.expanded
      }

      setConversations(prev => prev.map(conv => 
        conv.id === actualTargetId 
          ? { 
              ...conv, 
              messages: [...conv.messages, aiMessage],
              updatedAt: new Date()
            }
          : conv
      ))
      
      // Clear loading state based on which conversation was updated
      if (actualTargetId === currentConversationId) {
        setIsLoading(false)
      } else if (actualTargetId === branchConversationId) {
        setBranchLoading(false)
      }
    }
  }, [conversations, currentConversationId, branchConversationId, createNewConversation])

  const branchConversation = useCallback((messageId, content) => {
    // Only allow branching from the main conversation (not from a branch)
    if (branchConversationId) {
      alert('You can only branch from the main conversation.')
      return
    }

    const parentConversation = conversations.find(conv => conv.id === currentConversationId)
    if (!parentConversation) return

    // Get conversation history up to the branching point for context
    const conversationHistory = parentConversation.messages.filter(msg => msg.id <= messageId)

    const newConversation = {
      id: generateId(),
      title: `Branch: ${content.substring(0, 30)}...`,
      messages: [], // Start with empty messages (blank chat)
      createdAt: new Date(),
      updatedAt: new Date(),
      parentMessageId: messageId,
      conversationHistory: conversationHistory // Store history as context, not displayed
    }

    setConversations(prev => [...prev, newConversation])
    // DON'T change currentConversationId - keep the main chat as current
    setBranchConversationId(newConversation.id) // Mark this as a branch
  }, [conversations, currentConversationId, branchConversationId])

  const toggleMessageExpansion = useCallback((messageId, conversationId = null) => {
    // Use provided conversationId or fall back to currentConversationId
    const targetConversationId = conversationId || currentConversationId;
    
    setConversations(prev => prev.map(conv => 
      conv.id === targetConversationId 
        ? {
            ...conv,
            messages: conv.messages.map(msg => 
              msg.id === messageId 
                ? { ...msg, isExpanded: !msg.isExpanded }
                : msg
            )
          }
        : conv
    ))
  }, [currentConversationId])

  const closeBranch = useCallback(() => {
    setBranchConversationId(null)
  }, [])

  // Wrapper functions to send messages to specific conversations
  const sendToMainChat = useCallback(async (content, role = 'user') => {
    await addMessage(content, role, currentConversationId)
  }, [addMessage, currentConversationId])

  const sendToBranchChat = useCallback(async (content, role = 'user') => {
    await addMessage(content, role, branchConversationId)
  }, [addMessage, branchConversationId])

  const currentConversation = conversations.find(conv => conv.id === currentConversationId)
  const branchConversationData = conversations.find(conv => conv.id === branchConversationId)
  
  // Determine if we should show split view
  const showSplitView = branchConversationId && branchConversationData

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
      {/* Modern Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Sidebar 
          conversations={conversations}
          currentConversationId={currentConversationId}
          onConversationSelect={setCurrentConversationId}
          onNewConversation={createNewConversation}
        />
      </div>
      
      {/* Main Chat Area */}
      {showSplitView ? (
        // Split view: Original chat on left, branch on right
        <div className="flex-1 flex">
          <div className="w-1/2 border-r border-slate-200/60">
            <ChatInterface 
              conversation={currentConversation}
              onSendMessage={sendToMainChat}
              onBranchConversation={branchConversation}
              onToggleExpansion={toggleMessageExpansion}
              isLoading={isLoading}
              isBranchView={false}
            />
          </div>
          <div className="w-1/2">
            <ChatInterface 
              conversation={branchConversationData}
              onSendMessage={sendToBranchChat}
              onBranchConversation={branchConversation}
              onToggleExpansion={toggleMessageExpansion}
              isLoading={branchLoading}
              isBranchView={true}
              onCloseBranch={closeBranch}
            />
          </div>
        </div>
      ) : (
        // Single view: Full width chat
        <div className="flex-1">
          <ChatInterface 
            conversation={currentConversation}
            onSendMessage={sendToMainChat}
            onBranchConversation={branchConversation}
            onToggleExpansion={toggleMessageExpansion}
            isLoading={isLoading}
            isBranchView={false}
          />
        </div>
      )}
    </div>
  )
}

export default App
