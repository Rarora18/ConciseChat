# Setup Guide for Gemini API

## Quick Start

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Your App
1. Create a `.env` file in your project root
2. Add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Restart Your Development Server
```bash
npm run dev
```

## Features You'll Get

✅ **Intelligent Responses** - Gemini can answer any question intelligently
✅ **Context Awareness** - Remembers conversation history
✅ **Concise Answers** - Short, direct responses by default
✅ **Expandable Details** - Click "Show more" for detailed explanations
✅ **Conversation Branching** - Create new threads from any message
✅ **Fallback Protection** - Uses built-in AI if API fails

## Testing Your Setup

Try these questions to test the integration:

1. **"What is quantum computing?"**
2. **"How do I learn machine learning?"**
3. **"Explain blockchain technology"**
4. **"What are the best programming languages for beginners?"**

## Troubleshooting

### API Key Issues
- Make sure your `.env` file is in the project root
- Verify the API key starts with `AIza...`
- Check that you've restarted the dev server

### Rate Limiting
- Gemini has generous free limits
- If you hit limits, the app will fall back to built-in AI

### Network Issues
- The app automatically falls back to built-in AI if API calls fail
- Check your internet connection

## Cost Information

- **Gemini API**: Free tier with generous limits
- **Built-in AI**: Always free, no limits
- **No hidden costs**: The app works without any API key

## Next Steps

Once you have Gemini working, you can:
- Ask any question and get intelligent responses
- Have natural conversations with context
- Use the branching feature to explore topics
- Enjoy the concise + expandable answer format
