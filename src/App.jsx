import React, { useState, useCallback, useRef, useEffect } from 'react'
import { generateId } from './utils/helpers'
import { generateIntelligentResponse } from './services/aiService'
import { processFiles, formatFileResultsForAI } from './utils/fileProcessor'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'
import { ThemeProvider } from './contexts/ThemeContext'
import FuturisticBackground from './components/FuturisticBackground'
import TestCodeBlock from './components/TestCodeBlock'

function App() {
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [branchConversationId, setBranchConversationId] = useState(null) // Track the branch conversation
  const [isLoading, setIsLoading] = useState(false)
  const [branchLoading, setBranchLoading] = useState(false)
  const [fileProcessing, setFileProcessing] = useState(false)
  const [splitPosition, setSplitPosition] = useState(50) // Percentage for split position
  const [isDragging, setIsDragging] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const containerRef = useRef(null)

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

  const addMessage = useCallback(async (content, role = 'user', attachments = [], targetConversationId) => {
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
      conversationId: actualTargetId,
      attachments: attachments
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
      
      // Process file attachments for AI analysis
      let fileContent = ''
      if (attachments && attachments.length > 0) {
        try {
          const fileTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('File processing timeout')), 15000) // 15 second timeout
          )
          
          fileContent = await Promise.race([
            processFileAttachments(attachments),
            fileTimeoutPromise
          ])
        } catch (error) {
          console.error('File processing error:', error)
          fileContent = `Error processing files: ${error.message}`
        }
      }
      
      // Prepare conversation history for AI context
      let conversationHistory = null
      if (targetConversation) {
        // For main conversations, use all previous messages
        if (!targetConversation.parentMessageId) {
          conversationHistory = targetConversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        } else {
          // For branch conversations, use the stored conversation history (up to branching point)
          conversationHistory = targetConversation.conversationHistory?.map(msg => ({
            role: msg.role,
            content: msg.content
          })) || []
        }
      }
      
      try {
        // Generate AI response with conversation history
        const fullContent = fileContent ? `${content}\n\nAttached files:\n${fileContent}` : content
        console.log('Generating AI response for:', fullContent.substring(0, 100) + '...')
        
        // Add timeout to prevent stuck loading state
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI response timeout')), 30000) // 30 second timeout
        )
        
        const aiResponse = await Promise.race([
          generateIntelligentResponse(fullContent, conversationHistory),
          timeoutPromise
        ])
        console.log('AI response received:', aiResponse)
        
        if (!aiResponse || !aiResponse.short) {
          throw new Error('Invalid AI response received')
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
        
      } catch (error) {
        console.error('Error generating AI response:', error)
        
        // Add error message to conversation
        const errorMessage = {
          id: generateId(),
          content: error.message === 'AI response timeout' 
            ? 'Sorry, the response took too long. Please try again.'
            : 'Sorry, I encountered an error while processing your request. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
          conversationId: actualTargetId,
          expandedContent: error.message === 'AI response timeout'
            ? 'The AI response timed out after 30 seconds. This could be due to a complex request, network issues, or API rate limits. Please try breaking down your question into smaller parts or try again later.'
            : 'Sorry, I encountered an error while processing your request. Please try again.'
        }
        
        setConversations(prev => prev.map(conv => 
          conv.id === actualTargetId 
            ? { 
                ...conv, 
                messages: [...conv.messages, errorMessage],
                updatedAt: new Date()
              }
            : conv
        ))
      } finally {
        // Always clear loading state
        console.log('Clearing loading state for conversation:', actualTargetId)
        if (actualTargetId === currentConversationId) {
          setIsLoading(false)
        } else if (actualTargetId === branchConversationId) {
          setBranchLoading(false)
        }
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

  const deleteConversation = useCallback((conversationId, isMain) => {
    setConversations(prev => {
      if (isMain) {
        // Delete main conversation and all its branches
        return prev.filter(conv => {
          if (conv.id === conversationId) return false
          if (conv.parentMessageId) {
            // Check if this branch belongs to the main conversation being deleted
            const mainConv = prev.find(main => main.id === conversationId)
            if (mainConv && mainConv.messages.some(msg => msg.id === conv.parentMessageId)) {
              return false
            }
          }
          return true
        })
      } else {
        // Delete only the branch
        return prev.filter(conv => conv.id !== conversationId)
      }
    })

    // If we're deleting the current conversation, select a new one
    if (conversationId === currentConversationId) {
      const remainingConversations = conversations.filter(conv => conv.id !== conversationId)
      if (remainingConversations.length > 0) {
        setCurrentConversationId(remainingConversations[0].id)
      } else {
        setCurrentConversationId(null)
      }
    }

    // If we're deleting the branch conversation, close the branch view
    if (conversationId === branchConversationId) {
      setBranchConversationId(null)
    }
  }, [conversations, currentConversationId, branchConversationId])

  // Drag handlers for split view
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100
    
    // Limit the split position between 20% and 80%
    const clampedPosition = Math.max(20, Math.min(80, newPosition))
    setSplitPosition(clampedPosition)
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev)
  }, [])

  // Process file attachments for AI analysis
  const processFileAttachments = async (attachments) => {
    try {
      setFileProcessing(true)
      console.log('Processing files:', attachments.map(f => f.name))
      
      // Process all files using the new file processor
      const results = await processFiles(attachments)
      
      // Format results for AI consumption
      const formattedContent = formatFileResultsForAI(results)
      
      console.log('File processing completed:', results.length, 'files')
      return formattedContent
      
    } catch (error) {
      console.error('Error processing files:', error)
      return `Error processing files: ${error.message}`
    } finally {
      setFileProcessing(false)
    }
  }

  // Wrapper functions to send messages to specific conversations
  const sendToMainChat = useCallback(async (content, role = 'user', attachments = []) => {
    await addMessage(content, role, attachments, currentConversationId)
  }, [addMessage, currentConversationId])

  const sendToBranchChat = useCallback(async (content, role = 'user', attachments = []) => {
    await addMessage(content, role, attachments, branchConversationId)
  }, [addMessage, branchConversationId])

  const currentConversation = conversations.find(conv => conv.id === currentConversationId)
  const branchConversationData = conversations.find(conv => conv.id === branchConversationId)
  
  // Determine if we should show split view
  const showSplitView = branchConversationId && branchConversationData

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden relative">
        {/* Futuristic Background Animation */}
        <FuturisticBackground />
        
        {/* Modern Sidebar */}
        <div className={`flex-shrink-0 relative z-10 transition-all duration-300 ease-in-out transform ${
          sidebarVisible 
            ? 'w-80 translate-x-0 opacity-100' 
            : 'w-0 -translate-x-full opacity-0'
        }`}>
          <Sidebar 
            conversations={conversations}
            currentConversationId={currentConversationId}
            onConversationSelect={setCurrentConversationId}
            onNewConversation={createNewConversation}
            onDeleteConversation={deleteConversation}
            onToggleSidebar={toggleSidebar}
          />
        </div>
        
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 z-20 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform ${
            sidebarVisible 
              ? 'left-4 -translate-x-full opacity-0' 
              : 'left-4 translate-x-0 opacity-100'
          }`}
          title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
        >
          <svg 
            className="w-5 h-5 text-slate-600 dark:text-slate-300 transition-transform duration-300"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Test Code Block - Temporary */}
        <div className="fixed top-20 right-4 z-30">
          <TestCodeBlock />
        </div>
        
        {/* Main Chat Area */}
        {showSplitView ? (
          // Split view: Original chat on left, branch on right
          <div ref={containerRef} className="flex-1 flex relative z-10 transition-all duration-300 ease-in-out">
            <div 
              className="border-r border-slate-200/60 dark:border-slate-700/60"
              style={{ width: `${splitPosition}%` }}
            >
              <ChatInterface 
                conversation={currentConversation}
                onSendMessage={sendToMainChat}
                onBranchConversation={branchConversation}
                onToggleExpansion={toggleMessageExpansion}
                isLoading={isLoading || fileProcessing}
                isBranchView={false}
              />
            </div>
            
            {/* Draggable Divider */}
            <div
              className="w-1 bg-slate-300 dark:bg-slate-600 hover:bg-blue-500 dark:hover:bg-blue-400 cursor-col-resize relative group"
              onMouseDown={handleMouseDown}
            >
              {/* Divider Handle */}
              <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
                <div className="w-1 h-8 bg-slate-400 dark:bg-slate-500 rounded-full group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors"></div>
              </div>
            </div>
            
            <div 
              style={{ width: `${100 - splitPosition}%` }}
            >
              <ChatInterface 
                conversation={branchConversationData}
                onSendMessage={sendToBranchChat}
                onBranchConversation={branchConversation}
                onToggleExpansion={toggleMessageExpansion}
                isLoading={branchLoading || fileProcessing}
                isBranchView={true}
                onCloseBranch={closeBranch}
              />
            </div>
          </div>
        ) : (
          // Single view: Full width chat
          <div className="flex-1 relative z-10 transition-all duration-300 ease-in-out">
            <ChatInterface 
              conversation={currentConversation}
              onSendMessage={sendToMainChat}
              onBranchConversation={branchConversation}
              onToggleExpansion={toggleMessageExpansion}
              isLoading={isLoading || fileProcessing}
              isBranchView={false}
            />
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}

export default App
