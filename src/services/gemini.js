// Google Gemini API service (formerly PaLM)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

export async function generateGeminiResponse(message, conversationHistory = []) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file')
  }

  try {
    // Build conversation context
    const conversationContext = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n')

    const prompt = conversationContext 
      ? `${conversationContext}\n\nUser: ${message}\nAssistant:`
      : `User: ${message}\nAssistant:`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful AI assistant. Provide concise answers by default. 
            If the user wants more details, they can ask for an expanded explanation. 
            Keep your responses short and direct unless asked for more information.
            
            ${prompt}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates[0].content.parts[0].text.trim()

    return {
      short: aiResponse,
      expanded: aiResponse
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}

// Fallback to local AI if Gemini fails
export function getFallbackResponse(message) {
  // Simple fallback response
  return {
    short: 'I understand your question.',
    expanded: `I understand you asked: "${message}". I'm here to help with any follow-up questions or tasks you might have.`
  }
}
