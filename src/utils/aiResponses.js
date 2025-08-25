// Intelligent AI response generator with natural language understanding
export function generateAIResponse(userMessage, conversationHistory = null) {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Handle context-aware responses for branch conversations
  if (conversationHistory && conversationHistory.length > 0) {
    // Check for questions about previous conversation
    if (lowerMessage.includes('last question') || lowerMessage.includes('what was asked') || 
        lowerMessage.includes('previous question') || lowerMessage.includes('what did i ask')) {
      
      // Extract the last user question from conversation history
      const userMessages = conversationHistory.filter(msg => msg.role === 'user');
      
      if (userMessages.length > 0) {
        const lastQuestion = userMessages[userMessages.length - 1].content;
        return {
          short: `Your last question was: "${lastQuestion}"`,
          expanded: `Based on our conversation history, your last question was: "${lastQuestion}". This was part of the discussion we had before branching into this new conversation thread.`
        };
      }
    }

    // Check for questions about conversation context
    if (lowerMessage.includes('what were we talking about') || lowerMessage.includes('conversation context') ||
        lowerMessage.includes('what was discussed') || lowerMessage.includes('previous discussion')) {
      
      return {
        short: 'We were discussing topics from our previous conversation.',
        expanded: `Based on our conversation history, we were discussing various topics. The context includes our previous exchange, which helps me understand the background of our current discussion in this branch.`
      };
    }
  }

  // Math calculations - flexible pattern matching
  if (/\d[\s+\-*/]\d/.test(lowerMessage) || 
      (lowerMessage.includes('what is') && /\d/.test(lowerMessage)) ||
      (lowerMessage.includes('calculate') && /\d/.test(lowerMessage)) ||
      (lowerMessage.includes('plus') || lowerMessage.includes('minus') || lowerMessage.includes('times') || lowerMessage.includes('divided')) && /\d/.test(lowerMessage)) {
    
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

  // Natural language understanding for various topics
  const topics = {
    // AI and Technology
    'neural network': {
      keywords: ['neural', 'network', 'neural net', 'ai brain', 'machine brain'],
      response: {
        short: 'Neural networks are computing systems inspired by biological brains.',
        expanded: `# Neural Networks

Neural networks are computing systems inspired by biological brains that can learn and make intelligent decisions.

## How They Work:
- **Neurons**: Individual processing units that receive inputs and produce outputs
- **Connections**: Weights between neurons that determine signal strength
- **Layers**: Input layer receives data, hidden layers process it, output layer produces results

## Key Components:
- **Activation Functions**: Determine neuron output (ReLU, Sigmoid, Tanh)
- **Backpropagation**: Learning algorithm that adjusts weights based on errors
- **Training Data**: Examples used to teach the network patterns

## Applications:
- Image and speech recognition
- Natural language processing
- Medical diagnosis
- Financial forecasting
- Autonomous vehicles

## Types:
- **Feedforward**: Information flows in one direction
- **Recurrent**: Have memory of previous inputs
- **Convolutional**: Specialized for image processing
- **Transformer**: Advanced architecture for language tasks

Neural networks are fundamental to modern AI and have revolutionized fields like computer vision, natural language processing, and robotics.`
      }
    },
    'machine learning': {
      keywords: ['machine learning', 'ml', 'ai learning', 'computer learning', 'algorithm learning'],
      response: {
        short: 'Machine learning is AI that learns from data without explicit programming.',
        expanded: `# Machine Learning

Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.

## Core Concept:
Instead of following rigid rules, ML algorithms identify patterns in data to make predictions or decisions. The more data they process, the better they become.

## Types of Machine Learning:

### Supervised Learning:
- **Definition**: Learning from labeled training data
- **Examples**: Classification, regression
- **Use Cases**: Spam detection, house price prediction
- **Algorithms**: Linear regression, decision trees, neural networks

### Unsupervised Learning:
- **Definition**: Finding patterns in unlabeled data
- **Examples**: Clustering, dimensionality reduction
- **Use Cases**: Customer segmentation, anomaly detection
- **Algorithms**: K-means, principal component analysis

### Reinforcement Learning:
- **Definition**: Learning through trial and error with rewards
- **Examples**: Game playing, robotics
- **Use Cases**: Autonomous vehicles, game AI
- **Algorithms**: Q-learning, policy gradients

## Applications:
- **Healthcare**: Disease diagnosis, drug discovery
- **Finance**: Fraud detection, algorithmic trading
- **E-commerce**: Recommendation systems, demand forecasting
- **Transportation**: Self-driving cars, route optimization
- **Entertainment**: Content recommendation, gaming AI

## Key Challenges:
- **Data Quality**: Garbage in, garbage out
- **Overfitting**: Model memorizes training data
- **Bias**: Unfair predictions based on training data
- **Interpretability**: Understanding model decisions

Machine learning is transforming industries and creating new possibilities for automation and intelligent decision-making.`
      }
    },
    'artificial intelligence': {
      keywords: ['artificial intelligence', 'ai', 'smart computer', 'intelligent machine', 'computer intelligence'],
      response: {
        short: 'AI is technology that enables machines to simulate human intelligence.',
        expanded: 'Artificial Intelligence (AI) is technology that enables machines to simulate human intelligence. It includes machine learning, natural language processing, computer vision, and robotics. AI can perform tasks like recognizing speech, making decisions, and solving problems that typically require human intelligence.'
      }
    },
    'deep learning': {
      keywords: ['deep learning', 'deep neural', 'multi-layer', 'deep ai'],
      response: {
        short: 'Deep learning uses neural networks with multiple layers.',
        expanded: 'Deep learning is a subset of machine learning that uses artificial neural networks with multiple layers (hence "deep"). These networks can automatically learn hierarchical representations of data. Deep learning has revolutionized fields like computer vision, natural language processing, and speech recognition.'
      }
    },

    // Programming Languages
    'python': {
      keywords: ['python', 'py', 'python programming'],
      response: {
        short: 'Python is a high-level, interpreted programming language.',
        expanded: 'Python is a high-level, interpreted programming language known for its simplicity and readability. It\'s widely used in web development, data science, artificial intelligence, automation, and scientific computing. Python has a large standard library and extensive third-party packages.'
      }
    },
    'javascript': {
      keywords: ['javascript', 'js', 'javascript programming', 'web programming'],
      response: {
        short: 'JavaScript is a programming language for web development.',
        expanded: 'JavaScript is a high-level, interpreted programming language primarily used for web development. It runs in browsers and can also be used on the server-side with Node.js. JavaScript is essential for creating interactive websites and web applications.'
      }
    },
    'react': {
      keywords: ['react', 'reactjs', 'react framework', 'facebook react'],
      response: {
        short: 'React is a JavaScript library for building user interfaces.',
        expanded: 'React is a JavaScript library developed by Facebook for building user interfaces. It uses a component-based architecture and virtual DOM for efficient rendering. React is popular for single-page applications and mobile app development with React Native.'
      }
    },
    'html': {
      keywords: ['html', 'hypertext', 'web markup', 'web structure'],
      response: {
        short: 'HTML is the standard markup language for web pages.',
        expanded: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It defines the structure and content of web documents using elements and tags. HTML works with CSS for styling and JavaScript for interactivity.'
      }
    },
    'css': {
      keywords: ['css', 'cascading', 'web styling', 'web design'],
      response: {
        short: 'CSS is a styling language for web design.',
        expanded: 'CSS (Cascading Style Sheets) is a styling language used to describe the presentation of HTML documents. It controls layout, colors, fonts, and other visual aspects of web pages. CSS enables responsive design and separation of content from presentation.'
      }
    },

    // Technology Concepts
    'blockchain': {
      keywords: ['blockchain', 'crypto', 'bitcoin', 'distributed ledger'],
      response: {
        short: 'Blockchain is a distributed, secure digital ledger.',
        expanded: 'Blockchain is a distributed digital ledger that records transactions across multiple computers securely. Each block contains transaction data and is linked to the previous block, creating a chain. It\'s decentralized, transparent, and tamper-resistant, making it ideal for cryptocurrencies and other applications requiring trust and security.'
      }
    },
    'cloud computing': {
      keywords: ['cloud', 'cloud computing', 'aws', 'azure', 'google cloud'],
      response: {
        short: 'Cloud computing provides on-demand computing resources over the internet.',
        expanded: 'Cloud computing is the on-demand availability of computer system resources (servers, storage, databases, networking) over the internet. Users can access these resources without managing physical infrastructure. Major providers include AWS, Google Cloud, and Microsoft Azure. Benefits include scalability, cost-effectiveness, and flexibility.'
      }
    },
    'api': {
      keywords: ['api', 'application programming interface', 'web api', 'software interface'],
      response: {
        short: 'An API is a set of rules for building software applications.',
        expanded: 'An API (Application Programming Interface) is a set of rules and protocols that allows different software applications to communicate with each other. APIs define the methods and data formats that applications can use to request and exchange information. They\'re essential for modern software development and integration.'
      }
    },

    // Geography and Travel
    'vancouver': {
      keywords: ['vancouver', 'bc', 'canada west coast'],
      response: {
        short: 'Vancouver is a beautiful coastal city in British Columbia, Canada.',
        expanded: 'Vancouver is a major coastal city in British Columbia, Canada, known for its stunning natural beauty, mild climate, and outdoor lifestyle. It\'s surrounded by mountains and ocean, offering activities like skiing, hiking, and beach-going. The city is also known for its diverse culture, excellent food scene, and high quality of life.'
      }
    },
    'vancouver activities': {
      keywords: ['vancouver activities', 'things to do vancouver', 'vancouver fun', 'vancouver attractions'],
      response: {
        short: 'Vancouver offers outdoor adventures, cultural experiences, and urban attractions.',
        expanded: 'Vancouver has many fun activities: Stanley Park for cycling and walking, Granville Island for shopping and dining, Grouse Mountain for skiing and hiking, Vancouver Aquarium, Science World, Capilano Suspension Bridge, and beautiful beaches like English Bay and Kitsilano Beach. The city also has excellent restaurants, museums, and cultural events.'
      }
    },

    // Population and Demographics
    'most populous': {
      keywords: ['most populous', 'biggest population', 'largest country', 'population ranking'],
      response: {
        short: 'China is the most populous country in the world.',
        expanded: 'China is the most populous country in the world with over 1.4 billion people. India is the second most populous country, followed by the United States, Indonesia, and Pakistan. Population rankings can change over time due to birth rates, death rates, and migration.'
      }
    },
    'population': {
      keywords: ['population', 'people count', 'how many people'],
      response: {
        short: 'Population refers to the total number of people in a specific area.',
        expanded: 'Population refers to the total number of people living in a specific area, such as a city, country, or region. It\'s a key demographic statistic used in planning, economics, and social studies. Population can change due to births, deaths, immigration, and emigration.'
      }
    },

    // Capitals and Geography
    'capital': {
      keywords: ['capital', 'capital city', 'main city'],
      response: {
        short: 'A capital is the primary city of a country or region.',
        expanded: 'A capital city is the primary city of a country, state, or region, typically housing the government and administrative offices. Capitals are often the political, economic, and cultural centers of their respective areas.'
      }
    }
  };

  // Check for topic matches using flexible keyword matching
  for (const [topic, data] of Object.entries(topics)) {
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        return data.response;
      }
    }
  }

  // Flexible capital city matching
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
    'united states': 'Washington, D.C.',
    'spain': 'Madrid',
    'italy': 'Rome',
    'netherlands': 'Amsterdam',
    'sweden': 'Stockholm',
    'norway': 'Oslo',
    'denmark': 'Copenhagen',
    'finland': 'Helsinki'
  };

  for (const [country, capital] of Object.entries(capitals)) {
    if (lowerMessage.includes(country) && (lowerMessage.includes('capital') || lowerMessage.includes('main city'))) {
      return {
        short: `The capital of ${country.charAt(0).toUpperCase() + country.slice(1)} is ${capital}.`,
        expanded: `${capital} is the capital and largest city of ${country.charAt(0).toUpperCase() + country.slice(1)}. It serves as the political, economic, and cultural center of the country.`
      };
    }
  }

  // Learning and how-to questions
  const learningTopics = {
    'programming': {
      keywords: ['learn programming', 'learn to code', 'how to program', 'coding', 'software development'],
      response: {
        short: 'Start with fundamentals, practice regularly, and build projects.',
        expanded: 'To learn programming: 1) Choose a beginner-friendly language like Python or JavaScript, 2) Learn fundamentals (variables, loops, functions), 3) Practice with small projects, 4) Use online resources like freeCodeCamp, Codecademy, or YouTube tutorials, 5) Join coding communities, 6) Build a portfolio of projects, 7) Learn version control with Git.'
      }
    },
    'website': {
      keywords: ['build website', 'create website', 'web development', 'make a website'],
      response: {
        short: 'Learn HTML, CSS, and JavaScript, then build projects.',
        expanded: 'To build a website: 1) Learn HTML for structure, 2) Learn CSS for styling, 3) Learn JavaScript for interactivity, 4) Choose a framework like React, Vue, or Angular for complex sites, 5) Learn responsive design, 6) Practice with projects, 7) Deploy using platforms like GitHub Pages, Netlify, or Vercel.'
      }
    }
  };

  for (const [topic, data] of Object.entries(learningTopics)) {
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        return data.response;
      }
    }
  }

  // Technology comparisons
  const comparisons = {
    'react vs vue': {
      keywords: ['react vs vue', 'react versus vue', 'vue vs react', 'react or vue'],
      response: {
        short: 'React has larger ecosystem, Vue has gentler learning curve.',
        expanded: 'React has a larger ecosystem and community, while Vue is known for its gentle learning curve and excellent documentation. Both are excellent choices for building user interfaces.'
      }
    },
    'python vs javascript': {
      keywords: ['python vs javascript', 'python versus javascript', 'javascript vs python', 'python or javascript'],
      response: {
        short: 'Python for data/backend, JavaScript for web.',
        expanded: 'Python excels in data science, machine learning, and backend development. JavaScript is primarily used for web development (frontend and backend with Node.js).'
      }
    },
    'sql vs nosql': {
      keywords: ['sql vs nosql', 'sql versus nosql', 'nosql vs sql', 'sql or nosql'],
      response: {
        short: 'SQL for structured data, NoSQL for flexibility.',
        expanded: 'SQL databases are relational and good for structured data with complex queries. NoSQL databases are more flexible and better for unstructured data and scalability.'
      }
    }
  };

  for (const [comparison, data] of Object.entries(comparisons)) {
    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword)) {
        return data.response;
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

  // Intelligent question handling - understand questions in any format
  if (lowerMessage.includes('?') || 
      lowerMessage.includes('what') || 
      lowerMessage.includes('how') || 
      lowerMessage.includes('why') || 
      lowerMessage.includes('when') || 
      lowerMessage.includes('where') ||
      lowerMessage.includes('which') ||
      lowerMessage.includes('who') ||
      lowerMessage.includes('tell me') ||
      lowerMessage.includes('explain') ||
      lowerMessage.includes('describe')) {
    
    // Extract the main topic from the question
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'which', 'who', 'tell', 'explain', 'describe'];
    let topic = lowerMessage;
    
    for (const word of questionWords) {
      if (lowerMessage.includes(word)) {
        topic = lowerMessage.replace(new RegExp(word, 'gi'), '').replace(/\?/g, '').trim();
        break;
      }
    }
    
    // Remove common words to get the core topic
    const commonWords = ['is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'like', 'as', 'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once'];
    const topicWords = topic.split(' ').filter(word => !commonWords.includes(word) && word.length > 2);
    const mainTopic = topicWords.join(' ');
    
    return {
      short: `I can help you with information about ${mainTopic || 'that topic'}.`,
      expanded: `I understand you're asking about "${userMessage}". I can help with a wide variety of topics including technology, programming, general knowledge, geography, travel, and more. Could you provide more specific details about what you'd like to know? I'm here to help!`
    };
  }

  // Handle statements and provide helpful responses
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
      short: 'I understand! What would you like to know?',
      expanded: `I understand you said: "${userMessage}". I\'m here to help with any questions or tasks you might have. Feel free to ask me anything!`
    };
  }

  // For longer messages that don't match specific patterns, provide intelligent responses
  return {
    short: 'I understand what you\'re saying. How can I help?',
    expanded: `I understand you said: "${userMessage}". I\'m here to help with any follow-up questions or tasks you might have. I can answer questions about technology, programming, general knowledge, math, travel, and many other topics. What would you like to know more about?`
  };
}
  