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

// Main AI response generator that tries real AI first, falls back to local AI
export async function generateIntelligentResponse(userMessage, context = null) {
  try {
    // Try OpenAI ChatGPT first
    if (AI_CONFIG.openai.apiKey) {
      const response = await callOpenAI(userMessage, context);
      if (response) return response;
    }
    
    // Try Google Gemini as backup
    if (AI_CONFIG.gemini.apiKey) {
      const response = await callGemini(userMessage, context);
      if (response) return response;
    }
    
    // Fallback to local AI
    return generateAIResponse(userMessage, context);
    
  } catch (error) {
    console.error('AI API Error:', error);
    // Fallback to local AI
    return generateAIResponse(userMessage, context);
  }
}

// OpenAI ChatGPT integration
async function callOpenAI(userMessage, context = null) {
  try {
    const messages = [];
    
    // Add context if available
    if (context) {
      messages.push({
        role: 'system',
        content: `You are a helpful AI assistant. Here's the conversation context: ${context}`
      });
    }
    
    // Add user message
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
async function callGemini(userMessage, context = null) {
  try {
    let prompt = userMessage;
    
    // Add context if available
    if (context) {
      prompt = `Context: ${context}\n\nUser: ${userMessage}`;
    }

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
export function generateLocalResponse(userMessage, context = null) {
  return generateAIResponse(userMessage, context);
}
