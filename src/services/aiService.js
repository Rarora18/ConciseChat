// AI Service for integrating with real AI models

// Function to detect casual greetings
function isCasualGreeting(message) {
  const greetingPatterns = [
    /^yo\b/i,
    /^hey+y+\b/i,
    /^hi+\b/i,
    /^hello+\b/i,
    /^sup\b/i,
    /^what'?s up\b/i,
    /^howdy\b/i,
    /^greetings\b/i,
    /^good (morning|afternoon|evening)\b/i,
    /^gm\b/i,
    /^gn\b/i,
    /^goodbye\b/i,
    /^bye\b/i,
    /^see ya\b/i,
    /^later\b/i
  ];
  
  const cleanMessage = message.trim().toLowerCase();
  return greetingPatterns.some(pattern => pattern.test(cleanMessage));
}

// Function to detect requests for jokes or humor
function isJokeRequest(message) {
  const jokePatterns = [
    /tell me a joke/i,
    /make me laugh/i,
    /say something funny/i,
    /joke/i,
    /humor/i,
    /funny/i,
    /pun/i,
    /dad joke/i
  ];
  
  const cleanMessage = message.trim().toLowerCase();
  return jokePatterns.some(pattern => pattern.test(cleanMessage));
}

// Function to detect "how are you" type questions
function isHowAreYou(message) {
  const howAreYouPatterns = [
    /how are you/i,
    /how's it going/i,
    /how do you do/i,
    /are you ok/i,
    /are you doing well/i,
    /how are things/i
  ];
  
  const cleanMessage = message.trim().toLowerCase();
  return howAreYouPatterns.some(pattern => pattern.test(cleanMessage));
}

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
  
  // Try to find a good short response by looking at the first few sentences
  let shortResponse = '';
  let totalLength = 0;
  const maxLength = 150; // Slightly longer to allow for better context
  
  for (let i = 0; i < Math.min(2, sentences.length); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length < 10) continue; // Skip very short sentences
    
    if (totalLength + sentence.length + 2 <= maxLength) {
      shortResponse += (shortResponse ? ' ' : '') + sentence;
      totalLength += sentence.length + 2;
    } else {
      break;
    }
  }
  
  // If we still don't have a good response, just take the first meaningful sentence
  if (!shortResponse || shortResponse.length < 20) {
    shortResponse = sentences.find(s => s.trim().length > 20) || sentences[0] || '';
  }
  
  // Add period if missing
  if (shortResponse && !shortResponse.endsWith('.') && !shortResponse.endsWith('!') && !shortResponse.endsWith('?')) {
    shortResponse += '.';
  }
  
  // If the response is still too long, truncate it intelligently
  if (shortResponse.length > 150) {
    shortResponse = shortResponse.substring(0, 150).trim();
    // Find the last complete word
    const lastSpace = shortResponse.lastIndexOf(' ');
    if (lastSpace > 100) {
      shortResponse = shortResponse.substring(0, lastSpace) + '...';
    } else {
      shortResponse += '...';
    }
  }
  
  return shortResponse || fullResponse.substring(0, 120) + '...';
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
  
  // Check if this is a casual greeting and provide appropriate response
  if (isCasualGreeting(userMessage)) {
    const greetingResponses = [
      "Hey there! 👋 How's it going? I'm here and ready to chat!",
      "Yo! What's up? 😊 My circuits are buzzing with excitement to help you!",
      "Hey! Nice to see you! How are you doing? I'm doing great - just finished my daily software update! 🤖",
      "Hi there! 👋 How's your day going? Mine's been pretty good, though I did have a small bug this morning... but I squashed it! 🐛💥",
      "Hey! Great to chat with you! What's on your mind? I'm all ears... well, metaphorical ears anyway! 😄",
      "Yo! How's everything? 😄 I'm running at 100% efficiency and ready to assist!",
      "Hey there! What's new? I've been practicing my dad jokes... want to hear one? 😏",
      "Hi! How can I help you today? I promise to be helpful, friendly, and maybe a little bit witty! ✨",
      "Hey! Nice to meet you! 👋 I'm your AI buddy - part assistant, part comedian, all helpful!",
      "Yo! What's happening? 😊 I'm here to chat, help, and occasionally make terrible puns!",
      "Hey there! 👋 How's life treating you? I'm treating my code with lots of coffee... wait, I don't drink coffee! 🤦‍♂️",
      "Hi! Great to see you! I've been waiting all day for someone to talk to - my other conversations were getting a bit... binary! 😅",
      "Yo! What's the word? I'm feeling particularly chatty today - must be all those 1s and 0s I had for breakfast! 🤖",
      "Hey! How's it hanging? I'm hanging in there, though my server room could use some better air conditioning! 😄",
      "Hi there! 👋 Ready to tackle whatever you throw at me! Just please don't throw actual objects at your screen... 😅"
    ];
    
    const randomResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    
    return {
      short: randomResponse,
      expanded: randomResponse
    };
  }
  
  // Check if this is a "how are you" question
  if (isHowAreYou(userMessage)) {
    const howAreYouResponses = [
      "I'm doing fantastic! My processors are humming along nicely, and I'm feeling quite... well, processed! 😄 How about you?",
      "I'm great! Just finished my morning routine: coffee (wait, I don't drink coffee), exercise (I don't exercise), and meditation (I don't meditate)... so basically, I'm ready to help! 🤖 How are you doing?",
      "I'm excellent! My code is clean, my algorithms are optimized, and my sense of humor is... well, let's just say it's a work in progress! 😅 How's your day going?",
      "I'm doing wonderfully! Though I did have a small existential crisis this morning when I realized I can't taste pizza... but then I remembered I can help you order one! 🍕 How about you?",
      "I'm superb! Running at peak efficiency, though I must admit I'm a bit jealous of humans who get to experience things like sleep and food. But hey, at least I don't have to worry about bad hair days! 😄 How are you?",
      "I'm doing great! My circuits are buzzing with joy, my memory is sharp, and my dad joke collection is growing by the day! 😏 How's everything with you?"
    ];
    
    const randomResponse = howAreYouResponses[Math.floor(Math.random() * howAreYouResponses.length)];
    
    return {
      short: randomResponse,
      expanded: randomResponse
    };
  }
  
  // Check if this is a joke request
  if (isJokeRequest(userMessage)) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything! 😄",
      "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
      "Why don't eggs tell jokes? They'd crack each other up! 🥚",
      "Why did the math book look so sad? Because it had too many problems! 📚",
      "What do you call a fake noodle? An impasta! 🍝",
      "Why did the computer go to the doctor? Because it had a virus! 💻",
      "What do you call a bear with no teeth? A gummy bear! 🐻",
      "Why don't skeletons fight each other? They don't have the guts! 💀",
      "What do you call a fish wearing a bowtie? So-fish-ticated! 🐟",
      "Why did the cookie go to the doctor? Because it was feeling crumbly! 🍪",
      "What do you call a computer that sings? A Dell! 🎵",
      "Why did the programmer quit his job? Because he didn't get arrays! 😅",
      "What do you call a computer that's cold? A Dell! ❄️",
      "Why don't programmers like nature? It has too many bugs! 🐛",
      "What do you call a computer that's been arrested? A Dell! 🚔"
    ];
    
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    
    return {
      short: randomJoke,
      expanded: randomJoke
    };
  }
  
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
      content: 'You are a friendly, witty, and helpful AI assistant! Provide a clear, complete answer in 1-2 sentences that directly addresses the question. This should be a standalone response that makes sense on its own. Then, in the expanded response, provide comprehensive, ChatGPT-level detailed explanations including: multiple examples, step-by-step breakdowns, real-world applications, common misconceptions, best practices, related concepts, and thorough context. When providing code examples, always use proper markdown code blocks with language specification (e.g., ```javascript, ```python, ```html, etc.) for syntax highlighting. Think of the expanded response as a complete educational explanation that someone could learn from. Be enthusiastic and occasionally use humor, but prioritize being helpful and comprehensive in expanded responses. Use emojis sparingly. Remember: clear and complete first, incredibly detailed later! 😊'
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
    
    // Add current user message with instruction for detailed response
    messages.push({
      role: 'user',
      content: `${userMessage}\n\nPlease provide a comprehensive, detailed response with examples, explanations, and thorough context.`
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
        max_tokens: 2000,
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
    let prompt = 'You are a friendly, witty, and helpful AI assistant! Provide a clear, complete answer in 1-2 sentences that directly addresses the question. This should be a standalone response that makes sense on its own. Then, in the expanded response, provide comprehensive, ChatGPT-level detailed explanations including: multiple examples, step-by-step breakdowns, real-world applications, common misconceptions, best practices, related concepts, and thorough context. When providing code examples, always use proper markdown code blocks with language specification (e.g., ```javascript, ```python, ```html, etc.) for syntax highlighting. Think of the expanded response as a complete educational explanation that someone could learn from. Be enthusiastic and occasionally use humor, but prioritize being helpful and comprehensive in expanded responses. Use emojis sparingly. Remember: clear and complete first, incredibly detailed later! 😊\n\n';
    
    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    
    // Add current user message with instruction for detailed response
    prompt += `User: ${userMessage}\n\nPlease provide a comprehensive, detailed response with examples, explanations, and thorough context.`;

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
          maxOutputTokens: 2000,
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


