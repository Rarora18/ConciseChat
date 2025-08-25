// AI Service for integrating with real AI models
import { generateAIResponse } from '../utils/aiResponses.js';

// Configuration for different AI providers
const AI_CONFIG = {
  // OpenAI ChatGPT
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  },
  // Google Gemini
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash'
  }
};

// Debug API keys (without exposing full keys)
console.log('OpenAI API Key available:', !!AI_CONFIG.openai.apiKey);
console.log('Gemini API Key available:', !!AI_CONFIG.gemini.apiKey);

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
    
    // Try Google Gemini as backup
    if (AI_CONFIG.gemini.apiKey) {
      console.log('Trying Gemini...');
      const response = await callGemini(userMessage, conversationHistory);
      if (response) {
        console.log('Gemini response:', response);
        return response;
      }
    }
    
    // Fallback to local AI
    console.log('Using local AI fallback...');
    const localResponse = generateAIResponse(userMessage, conversationHistory);
    console.log('Local AI response:', localResponse);
    return localResponse;
    
  } catch (error) {
    console.error('AI API Error:', error);
    // Fallback to local AI
    console.log('Error occurred, using local AI fallback...');
    const localResponse = generateAIResponse(userMessage, conversationHistory);
    console.log('Local AI fallback response:', localResponse);
    return localResponse;
  }
}

// OpenAI ChatGPT integration
async function callOpenAI(userMessage, conversationHistory = null) {
  try {
    const messages = [];
    
    // Add system message
    messages.push({
      role: 'system',
      content: 'You are a helpful AI assistant. Provide concise answers by default, but be ready to expand when asked for more details.'
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
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Split response into short and expanded versions
    const shortResponse = aiResponse.split('.')[0] + '.';
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
async function callGemini(userMessage, conversationHistory = null) {
  try {
    let prompt = 'You are a helpful AI assistant. Provide concise answers by default, but be ready to expand when asked for more details.\n\n';
    
    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    
    // Add current user message
    prompt += `User: ${userMessage}`;

    const response = await fetch(`${AI_CONFIG.gemini.endpoint}?key=${AI_CONFIG.gemini.apiKey}`, {
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
          maxOutputTokens: 500,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Split response into short and expanded versions
    const shortResponse = aiResponse.split('.')[0] + '.';
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

// Local AI fallback with improved responses
export function generateLocalResponse(userMessage, conversationHistory = null) {
  return generateAIResponse(userMessage, conversationHistory);
}
