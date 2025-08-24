// Comprehensive AI response generator
export function generateAIResponse(userMessage, context = null) {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Handle context-aware responses for branch conversations
  if (context) {
    // Check for questions about previous conversation
    if (lowerMessage.includes('last question') || lowerMessage.includes('what was asked') || 
        lowerMessage.includes('previous question') || lowerMessage.includes('what did i ask')) {
      
      // Extract the last user question from context
      const contextLines = context.split('\n');
      const userMessages = contextLines.filter(line => line.startsWith('user:'));
      
      if (userMessages.length > 0) {
        const lastQuestion = userMessages[userMessages.length - 1].replace('user: ', '');
        return {
          short: `Your last question was: "${lastQuestion}"`,
          expanded: `Based on our conversation history, your last question was: "${lastQuestion}". This was part of the discussion we had before branching into this new conversation thread.`
        };
      }
    }

    // Check for questions about conversation context
    if (lowerMessage.includes('what were we talking about') || lowerMessage.includes('conversation context') ||
        lowerMessage.includes('what was discussed') || lowerMessage.includes('previous discussion')) {
      
      // Extract key topics from context
      const contextLines = context.split('\n');
      const allMessages = contextLines.map(line => line.replace(/^(user|assistant): /, '')).join(' ');
      
      return {
        short: 'We were discussing topics from our previous conversation.',
        expanded: `Based on our conversation history, we were discussing various topics. The context includes our previous exchange, which helps me understand the background of our current discussion in this branch.`
      };
    }
  }

  // Math calculations - check this first for better pattern matching
  if (/\d[\s+\-*/]\d/.test(lowerMessage) || (lowerMessage.includes('what is') && /\d/.test(lowerMessage))) {
    const mathMatch = lowerMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    if (mathMatch) {
      const [, num1, operator, num2] = mathMatch;
      const a = parseFloat(num1);
      const b = parseFloat(num2);
      let result, operation;

      switch (operator) {
        case '+':
          result = a + b;
          operation = 'plus';
          break;
        case '-':
          result = a - b;
          operation = 'minus';
          break;
        case '*':
          result = a * b;
          operation = 'times';
          break;
        case '/':
          result = b !== 0 ? a / b : 'undefined (division by zero)';
          operation = 'divided by';
          break;
        default:
          result = 'unknown operation';
          operation = operator;
      }

      return {
        short: `${a} ${operation} ${b} = ${result}`,
        expanded: `The calculation ${a} ${operation} ${b} equals ${result}. This is a basic arithmetic operation.`
      };
    }
  }

  // Neural networks and AI concepts
  if (lowerMessage.includes('neural network') || lowerMessage.includes('neural net')) {
    return {
      short: 'Neural networks are computing systems inspired by biological brains.',
      expanded: 'Neural networks are computing systems inspired by biological brains. They consist of interconnected nodes (neurons) that process information. Each connection has a weight that adjusts during training. Neural networks can learn patterns from data and make predictions or classifications. They\'re fundamental to modern AI and machine learning.'
    };
  }

  if (lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
    return {
      short: 'Machine learning is AI that learns from data without explicit programming.',
      expanded: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It uses algorithms to identify patterns in data and make predictions or decisions. Common types include supervised learning, unsupervised learning, and reinforcement learning.'
    };
  }

  if (lowerMessage.includes('artificial intelligence') || lowerMessage.includes('ai')) {
    return {
      short: 'AI is technology that enables machines to simulate human intelligence.',
      expanded: 'Artificial Intelligence (AI) is technology that enables machines to simulate human intelligence. It includes machine learning, natural language processing, computer vision, and robotics. AI can perform tasks like recognizing speech, making decisions, and solving problems that typically require human intelligence.'
    };
  }

  if (lowerMessage.includes('deep learning')) {
    return {
      short: 'Deep learning uses neural networks with multiple layers.',
      expanded: 'Deep learning is a subset of machine learning that uses artificial neural networks with multiple layers (hence "deep"). These networks can automatically learn hierarchical representations of data. Deep learning has revolutionized fields like computer vision, natural language processing, and speech recognition.'
    };
  }

  // Technology concepts
  if (lowerMessage.includes('blockchain')) {
    return {
      short: 'Blockchain is a distributed, secure digital ledger.',
      expanded: 'Blockchain is a distributed digital ledger that records transactions across multiple computers securely. Each block contains transaction data and is linked to the previous block, creating a chain. It\'s decentralized, transparent, and tamper-resistant, making it ideal for cryptocurrencies and other applications requiring trust and security.'
    };
  }

  if (lowerMessage.includes('cloud computing')) {
    return {
      short: 'Cloud computing provides on-demand computing resources over the internet.',
      expanded: 'Cloud computing is the on-demand availability of computer system resources (servers, storage, databases, networking) over the internet. Users can access these resources without managing physical infrastructure. Major providers include AWS, Google Cloud, and Microsoft Azure. Benefits include scalability, cost-effectiveness, and flexibility.'
    };
  }

  if (lowerMessage.includes('api') && !lowerMessage.includes('capital')) {
    return {
      short: 'An API is a set of rules for building software applications.',
      expanded: 'An API (Application Programming Interface) is a set of rules and protocols that allows different software applications to communicate with each other. APIs define the methods and data formats that applications can use to request and exchange information. They\'re essential for modern software development and integration.'
    };
  }

  // Programming languages
  if (lowerMessage.includes('python')) {
    return {
      short: 'Python is a high-level, interpreted programming language.',
      expanded: 'Python is a high-level, interpreted programming language known for its simplicity and readability. It\'s widely used in web development, data science, artificial intelligence, automation, and scientific computing. Python has a large standard library and extensive third-party packages.'
    };
  }

  if (lowerMessage.includes('javascript')) {
    return {
      short: 'JavaScript is a programming language for web development.',
      expanded: 'JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web. It enables interactive web pages and is an essential part of web applications. JavaScript can be used on both the client-side and server-side (Node.js).'
    };
  }

  if (lowerMessage.includes('react')) {
    return {
      short: 'React is a JavaScript library for building user interfaces.',
      expanded: 'React is a JavaScript library developed by Facebook for building user interfaces, particularly single-page applications. It allows developers to create reusable UI components and efficiently update the DOM when data changes. React uses a virtual DOM for performance optimization and follows a component-based architecture.'
    };
  }

  if (lowerMessage.includes('html')) {
    return {
      short: 'HTML is the standard markup language for web pages.',
      expanded: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of web content using a system of elements and tags. HTML is the backbone of web development and works alongside CSS and JavaScript.'
    };
  }

  if (lowerMessage.includes('css')) {
    return {
      short: 'CSS is a style sheet language for styling web pages.',
      expanded: 'CSS (Cascading Style Sheets) is a style sheet language used for describing the presentation of a document written in HTML. CSS describes how elements should be rendered on screen, on paper, in speech, or on other media.'
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

  // How-to questions
  if (lowerMessage.includes('how to') || lowerMessage.includes('how do i')) {
    const howToAnswers = {
      'learn programming': {
        short: 'Start with Python or JavaScript basics.',
        expanded: 'To learn programming, start with a beginner-friendly language like Python or JavaScript. Practice with small projects, use online resources like freeCodeCamp or Codecademy, and build a portfolio of projects.'
      },
      'build a website': {
        short: 'Learn HTML, CSS, and JavaScript.',
        expanded: 'To build a website, learn HTML for structure, CSS for styling, and JavaScript for interactivity. Start with static sites, then learn frameworks like React or Vue.js for dynamic applications.'
      },
      'get a job in tech': {
        short: 'Build skills, projects, and network.',
        expanded: 'To get a job in tech, develop relevant technical skills, build a portfolio of projects, network with professionals, contribute to open source, and prepare for technical interviews with practice.'
      }
    };

    for (const [topic, response] of Object.entries(howToAnswers)) {
      if (lowerMessage.includes(topic)) {
        return response;
      }
    }
  }

  // Technology comparisons
  if (lowerMessage.includes('vs') || lowerMessage.includes('versus') || lowerMessage.includes('difference between')) {
    const comparisons = {
      'react vs vue': {
        short: 'React is more popular, Vue is easier to learn.',
        expanded: 'React has a larger ecosystem and community, while Vue is known for its gentle learning curve and excellent documentation. Both are excellent choices for building user interfaces.'
      },
      'python vs javascript': {
        short: 'Python for data/backend, JavaScript for web.',
        expanded: 'Python excels in data science, machine learning, and backend development. JavaScript is primarily used for web development (frontend and backend with Node.js).'
      },
      'sql vs nosql': {
        short: 'SQL for structured data, NoSQL for flexibility.',
        expanded: 'SQL databases are relational and good for structured data with complex queries. NoSQL databases are more flexible and better for unstructured data and scalability.'
      }
    };

    for (const [comparison, response] of Object.entries(comparisons)) {
      if (lowerMessage.includes(comparison.replace(' vs ', ' '))) {
        return response;
      }
    }
  }

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
      expanded: 'You\'re very welcome! I\'m always here to help. If you have more questions or need assistance, don\'t hesitate to ask!'
    };
  }

  if (lowerMessage.match(/^(yes|yeah|yep|sure|ok|okay)$/)) {
    return {
      short: 'Got it! 👍',
      expanded: 'Understood! If there\'s anything else you\'d like to discuss or clarify, let me know. I\'m here to help!'
    };
  }

  if (lowerMessage.match(/^(no|nope|nah)$/)) {
    return {
      short: 'Alright. 👌',
      expanded: 'No problem! If you change your mind or have any questions later, feel free to ask. I\'m here whenever you need me.'
    };
  }

  if (lowerMessage.includes('who are you')) {
    return {
      short: 'I\'m your AI assistant! 🤖',
      expanded: 'I\'m an AI assistant designed to help you with a variety of tasks. Whether you need answers, explanations, or creative ideas, I\'m here to assist. Let me know how I can make your day easier!'
    };
  }

  // Question detection with better responses
  if (lowerMessage.includes('?')) {
    if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why') || lowerMessage.includes('when') || lowerMessage.includes('where')) {
      return {
        short: 'I don\'t have specific information about that.',
        expanded: `I understand you're asking about "${userMessage}", but I don't have specific information about that topic. I can help with technology, programming, general knowledge, math, and common questions. Could you try rephrasing or ask about something else?`
      };
    }
  }

  // Better default responses based on message type
  if (lowerMessage.length < 20) {
    if (lowerMessage.match(/^(ok|okay|sure|alright|fine)$/)) {
      return {
        short: 'Great! 👍',
        expanded: 'Perfect! I\'m ready to help you with whatever you need next.'
      };
    }
    
    if (lowerMessage.match(/^(cool|awesome|nice|good|great)$/)) {
      return {
        short: 'Glad you think so! 😊',
        expanded: 'I\'m happy you find that helpful! Is there anything else you\'d like to know or discuss?'
      };
    }
    
    return {
      short: 'I understand!',
      expanded: `I understand you said: "${userMessage}". I\'m here to help with any questions or tasks you might have.`
    };
  }

  return {
    short: 'I understand what you\'re saying.',
    expanded: `I understand you said: "${userMessage}". I\'m here to help with any follow-up questions or tasks you might have. I can answer questions about technology, programming, general knowledge, math, and more.`
  };
}
  