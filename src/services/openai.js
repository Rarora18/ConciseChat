// OpenAI API service (optional enhancement)
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export async function generateOpenAIResponse(message, conversationHistory = []) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file')
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant. Provide concise answers by default. 
            If the user wants more details, they can ask for an expanded explanation. 
            Keep your responses short and direct unless asked for more information.`
          },
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    return {
      short: aiResponse,
      expanded: aiResponse // OpenAI responses are already comprehensive
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

// Fallback to local AI if OpenAI fails
export function getFallbackResponse(message) {
  // This would call your existing generateAIResponse function
  return generateAIResponse(message)
}
