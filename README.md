# Concise Chat - AI Assistant

A modern ChatGPT clone built with React and Vite, featuring concise answers and conversation branching capabilities.

## Features

### 🎯 **Concise Answers by Default**
- AI responses are short and direct by default
- Perfect for yes/no questions and quick answers
- Reduces conversation clutter and improves readability

### 🔄 **Expandable Explanations**
- Click "Show more" to expand any AI response for detailed explanations
- Users have full control over when they want more information
- Prevents overwhelming users with unnecessary details

### 🌿 **Conversation Branching**
- Create new conversation threads from any message
- Explore different topics without losing context
- Maintain clean conversation history
- Visual indicators for branched conversations

### 🎨 **Modern UI/UX**
- Clean, responsive design with Tailwind CSS
- Smooth animations and transitions
- Intuitive navigation and controls
- Mobile-friendly interface

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd concise-chat
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Usage

### Starting a Conversation
1. Click "New Chat" in the sidebar
2. Type your message and press Enter
3. Receive a concise AI response

### Expanding Answers
- Click "Show more" on any AI message to see detailed explanations
- Click "Show less" to collapse back to the concise version

### Branching Conversations
- Click the "Branch" button on any AI message
- This creates a new conversation thread starting from that point
- Perfect for exploring different aspects of a topic

### Managing Conversations
- All conversations are listed in the sidebar
- Click any conversation to switch to it
- Branched conversations are marked with a "Branch" label

## Technology Stack

- **Frontend**: React 18 with JSX
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **AI**: Custom built-in AI (no API required)
- **Development**: ESLint, PostCSS

## AI Options

### Google Gemini API (Recommended)
- **Powerful AI responses**
- **Context-aware conversations**
- **Comprehensive knowledge**
- **Free tier available**
- **Fast and reliable**

### Built-in AI (Fallback)
- **No API key required**
- **Works offline**
- **Instant responses**
- **Free to use**
- **Covers common topics**: Technology, programming, general knowledge, math

### OpenAI Integration (Alternative)
- **Requires OpenAI API key**
- **More comprehensive responses**
- **Context-aware conversations**
- **Advanced language understanding**

## Setup Instructions

### Using Gemini API (Recommended):
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a `.env` file with: `VITE_GEMINI_API_KEY=your_key_here`
3. The app will automatically use Gemini API

### Using OpenAI API:
1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Create a `.env` file with: `VITE_OPENAI_API_KEY=your_key_here`
3. The app will use OpenAI when available

### Using Built-in AI:
- No setup required! The app works immediately with the built-in AI

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatInterface.jsx
│   ├── Message.jsx
│   ├── MessageInput.jsx
│   └── Sidebar.jsx
├── utils/              # Utility functions
│   └── helpers.js
├── App.jsx             # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

## Customization

### Adding New AI Responses
Edit the `generateAIResponse` function in `src/App.jsx` to add custom response patterns.

### Styling
Modify `src/index.css` and `tailwind.config.js` to customize the appearance.

### Features
The modular component structure makes it easy to add new features like:
- Message search
- Conversation export
- User preferences
- API integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by ChatGPT's interface
- Built with modern React patterns
- Designed for optimal user experience
