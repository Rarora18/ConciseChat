// AI Service for integrating with real AI models

// Function to create better short responses
function createBetterShortResponse(fullResponse) {
  // Remove markdown formatting for short response
  let cleanResponse = fullResponse
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/`(.*?)`/g, '$1') // Remove code blocks
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .trim();
  
  // Split into sentences
  const sentences = cleanResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return fullResponse.substring(0, 100) + (fullResponse.length > 100 ? '...' : '');
  }
  
  // Take first 2-3 sentences for better context
  let shortResponse = '';
  let totalLength = 0;
  const maxLength = 200; // Maximum characters for short response
  
  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const sentence = sentences[i].trim();
    if (totalLength + sentence.length + 2 <= maxLength) {
      shortResponse += (shortResponse ? '. ' : '') + sentence;
      totalLength += sentence.length + 2;
    } else {
      break;
    }
  }
  
  // Add period if missing
  if (shortResponse && !shortResponse.endsWith('.') && !shortResponse.endsWith('!') && !shortResponse.endsWith('?')) {
    shortResponse += '.';
  }
  
  return shortResponse || fullResponse.substring(0, 150) + '...';
}

// Configuration for different AI providers
const AI_CONFIG = {
  // OpenAI ChatGPT
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  },
  // Google Gemini (Primary)
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash'
  },
  // Google Gemini (Backup)
  geminiBackup: {
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash'
  }
};

// Debug API keys (without exposing full keys)
console.log('OpenAI API Key available:', !!AI_CONFIG.openai.apiKey);
console.log('Gemini API Key available:', !!AI_CONFIG.gemini.apiKey);
console.log('Gemini Backup API Key available:', !!AI_CONFIG.geminiBackup.apiKey);

// Main AI response generator that tries real AI first, falls back to local AI
export async function generateIntelligentResponse(userMessage, conversationHistory = null) {
  console.log('Generating AI response for:', userMessage);
  console.log('Conversation history:', conversationHistory);
  
  try {
    // Try OpenAI ChatGPT first
    if (AI_CONFIG.openai.apiKey) {
      console.log('Trying OpenAI...');
      const response = await callOpenAI(userMessage, conversationHistory);
      if (response) {
        console.log('OpenAI response:', response);
        return response;
      }
    }
    
    // Try Google Gemini (Primary)
    if (AI_CONFIG.gemini.apiKey) {
      console.log('Trying Gemini (Primary)...');
      try {
        const response = await callGemini(userMessage, conversationHistory, AI_CONFIG.gemini);
        if (response) {
          console.log('Gemini (Primary) response:', response);
          return response;
        }
      } catch (error) {
        console.error('Gemini (Primary) API failed:', error.message);
        // Try backup API key
      }
    }
    
    // Try Google Gemini (Backup)
    if (AI_CONFIG.geminiBackup.apiKey) {
      console.log('Trying Gemini (Backup)...');
      try {
        const response = await callGemini(userMessage, conversationHistory, AI_CONFIG.geminiBackup);
        if (response) {
          console.log('Gemini (Backup) response:', response);
          return response;
        }
      } catch (error) {
        console.error('Gemini (Backup) API failed:', error.message);
        // Continue to error handling below
      }
    }
    
    // No fallback - only use real AI
    console.log('No working API keys available.');
    throw new Error('API rate limit exceeded or no working API keys. Please try again later or check your API configuration.');
    
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
}

// OpenAI ChatGPT integration
async function callOpenAI(userMessage, conversationHistory = null) {
  try {
    const messages = [];
    
    // Add system message
    messages.push({
      role: 'system',
      content: 'You are a helpful AI assistant. Provide comprehensive, detailed answers that thoroughly explain concepts. Include examples, step-by-step explanations, and relevant details. Your responses should be educational and informative, similar to ChatGPT.'
    });
    
    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }
    
    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    const response = await fetch(AI_CONFIG.openai.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Create better short response
    const shortResponse = createBetterShortResponse(aiResponse);
    const expandedResponse = aiResponse;
    
    return {
      short: shortResponse,
      expanded: expandedResponse
    };
    
  } catch (error) {
    console.error('OpenAI Error:', error);
    return null;
  }
}

// Google Gemini integration
async function callGemini(userMessage, conversationHistory = null, apiConfig = AI_CONFIG.gemini) {
  try {
    let prompt = 'You are a helpful AI assistant. Provide comprehensive, detailed answers that thoroughly explain concepts. Include examples, step-by-step explanations, and relevant details. Your responses should be educational and informative, similar to ChatGPT.\n\n';
    
    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    
    // Add current user message
    prompt += `User: ${userMessage}`;

    const response = await fetch(`${apiConfig.endpoint}?key=${apiConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Create better short response
    const shortResponse = createBetterShortResponse(aiResponse);
    const expandedResponse = aiResponse;
    
    return {
      short: shortResponse,
      expanded: expandedResponse
    };
    
  } catch (error) {
    console.error('Gemini Error:', error);
    return null;
  }
}


