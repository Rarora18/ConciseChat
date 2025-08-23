import React, { useState, useCallback } from 'react'
import ChatInterface from './components/ChatInterface'
import Sidebar from './components/Sidebar'
import { generateId } from './utils/helpers'

function App() {
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [branchConversationId, setBranchConversationId] = useState(null) // Track the branch conversation
  const [isLoading, setIsLoading] = useState(false)

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

  const addMessage = useCallback((content, role = 'user', targetConversationId) => {
    // Ensure the target conversation exists
    const targetConversation = conversations.find(conv => conv.id === targetConversationId)
    if (!targetConversation) return

    const newMessage = {
      id: generateId(),
      content,
      role,
      timestamp: new Date(),
      conversationId: targetConversationId
    }

    // Add the user message to the correct conversation
    setConversations(prev => prev.map(conv => 
      conv.id === targetConversationId 
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
      setIsLoading(true)
      
      const aiResponse = generateAIResponse(content)
      
      const aiMessage = {
        id: generateId(),
        content: aiResponse.short,
        role: 'assistant',
        timestamp: new Date(),
        conversationId: targetConversationId,
        expandedContent: aiResponse.expanded
      }

      setConversations(prev => prev.map(conv => 
        conv.id === targetConversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, aiMessage],
              updatedAt: new Date()
            }
          : conv
      ))
      
      setIsLoading(false)
    }
  }, [conversations])

  const branchConversation = useCallback((messageId, content) => {
    // Prevent branching off a branch
    if (branchConversationId) {
      alert('You cannot branch off a branch.')
      return
    }

    const parentConversation = conversations.find(conv => conv.id === currentConversationId)
    if (!parentConversation) return

    // Copy messages up to the point of branching
    const branchMessages = parentConversation.messages.filter(msg => msg.id <= messageId)

    const newConversation = {
      id: generateId(),
      title: `Branch: ${content.substring(0, 30)}...`,
      messages: branchMessages,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentMessageId: messageId
    }

    setConversations(prev => [...prev, newConversation])
    setBranchConversationId(newConversation.id) // Set the branch conversation
  }, [conversations, currentConversationId, branchConversationId])

  const toggleMessageExpansion = useCallback((messageId) => {
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId 
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

  const currentConversation = conversations.find(conv => conv.id === currentConversationId)
  const branchConversationData = conversations.find(conv => conv.id === branchConversationId)

  return (
    <div className="h-screen w-screen bg-gray-900 text-gray-100 flex">
      {/* Sidebar */}
      <Sidebar 
        conversations={conversations}
        currentConversationId={currentConversationId}
        onConversationSelect={setCurrentConversationId}
        onNewConversation={createNewConversation}
        className="w-72 bg-gray-800"
      />

      {/* Chat Interface */}
      <div className="flex-1 flex">
        {/* Main Conversation */}
        <div className="w-1/2 bg-gray-900 text-gray-100">
          <ChatInterface 
            conversation={currentConversation}
            onSendMessage={(content, role) => addMessage(content, role, currentConversationId)}
            onBranchConversation={branchConversation}
            onToggleExpansion={toggleMessageExpansion}
            isLoading={isLoading}
            className="flex-1 bg-gray-900 text-gray-100"
          />
        </div>

        {/* Branch Conversation */}
        {branchConversationId ? (
          <div className="w-1/2 bg-gray-900 text-gray-100 border-l border-gray-800">
            <ChatInterface 
              conversation={branchConversationData}
              onSendMessage={(content, role) => addMessage(content, role, branchConversationId)}
              onBranchConversation={null} // Disable branching from the branch
              onToggleExpansion={toggleMessageExpansion}
              isLoading={isLoading}
              className="flex-1 bg-gray-900 text-gray-100"
            />
          </div>
        ) : (
          <div className="w-1/2 bg-gray-900 text-gray-800 flex items-center justify-center">
            <p className="text-gray-500">No branch created yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Intelligent AI response generator
function generateAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Greetings and basic interactions
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
    return {
      short: 'Hi there! 👋',
      expanded: 'Hello! I\'m your AI assistant, here to help with anything you need. Whether it\'s answering questions, solving problems, or just having a chat, feel free to ask!'
    };
  }

  if (lowerMessage.includes('how are you')) {
    return {
      short: 'I\'m doing great!',
      expanded: 'Thanks for asking! As an AI, I don\'t have feelings, but I\'m fully operational and ready to assist you with anything you need. Let me know how I can help!'
    };
  }

  if (lowerMessage.match(/^(thanks?|thank you)/)) {
    return {
      short: 'You\'re welcome! 😊',
      expanded: 'You\'re very welcome! I\'m always here to help. If you have more questions or need assistance, don’t hesitate to ask!'
    };
  }

  if (lowerMessage.match(/^(yes|yeah|yep|sure|ok|okay)$/)) {
    return {
      short: 'Got it! 👍',
      expanded: 'Understood! If there’s anything else you’d like to discuss or clarify, let me know. I’m here to help!'
    };
  }

  if (lowerMessage.match(/^(no|nope|nah)$/)) {
    return {
      short: 'Alright. 👌',
      expanded: 'No problem! If you change your mind or have any questions later, feel free to ask. I’m here whenever you need me.'
    };
  }

  if (lowerMessage.includes('who are you')) {
    return {
      short: 'I\'m your AI assistant! 🤖',
      expanded: 'I\'m an AI assistant designed to help you with a variety of tasks. Whether you need answers, explanations, or creative ideas, I\'m here to assist. Let me know how I can make your day easier!'
    };
  }

  // General knowledge questions
  if (lowerMessage.includes('capital of') || lowerMessage.includes('what is the capital')) {
    const capitals = {
      'france': 'Paris',
      'germany': 'Berlin',
      'japan': 'Tokyo',
      'canada': 'Ottawa',
      'australia': 'Canberra',
      'brazil': 'Brasília',
      'india': 'New Delhi',
      'china': 'Beijing',
      'russia': 'Moscow',
      'uk': 'London',
      'united kingdom': 'London',
      'usa': 'Washington, D.C.',
      'united states': 'Washington, D.C.'
    };

    for (const [country, capital] of Object.entries(capitals)) {
      if (lowerMessage.includes(country)) {
        return {
          short: `The capital of ${country.charAt(0).toUpperCase() + country.slice(1)} is ${capital}.`,
          expanded: `${capital} is the capital of ${country.charAt(0).toUpperCase() + country.slice(1)}. It is a major hub for politics, culture, and history, and is home to many iconic landmarks and institutions.`
        };
      }
    }
  }

  // Math questions
  if (lowerMessage.includes('what is') && /\d/.test(lowerMessage)) {
    const mathMatch = lowerMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    if (mathMatch) {
      const [, num1, operator, num2] = mathMatch;
      const a = parseFloat(num1);
      const b = parseFloat(num2);
      let result;

      switch (operator) {
        case '+':
          result = a + b;
          break;
        case '-':
          result = a - b;
          break;
        case '*':
          result = a * b;
          break;
        case '/':
          result = b !== 0 ? a / b : 'undefined (division by zero)';
          break;
        default:
          result = 'unknown operation';
      }

      return {
        short: `${a} ${operator} ${b} = ${result}`,
        expanded: `The result of ${a} ${operator} ${b} is ${result}. This is a basic arithmetic operation. Let me know if you need help with more complex calculations!`
      };
    }
  }

  // Fallback for vague or unclear prompts
  return {
    short: 'I\'m not sure what you mean.',
    expanded: `I couldn’t fully understand your message: "${userMessage}". Could you clarify or provide more details? I’m here to help with anything you need, whether it’s answering questions, solving problems, or just having a conversation.`
  };
}

export default App
