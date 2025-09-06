# Gemini AI Chatbot Setup Guide

## Overview
Your portfolio now includes an interactive chatbot that can answer questions about you and your work. Currently, it uses mock responses for demo purposes, but you can easily integrate it with Google's Gemini AI for more intelligent responses.

## Current Status
✅ Chatbot UI implemented and styled  
✅ Mock response system working  
✅ Comprehensive context about George created  
⏳ Gemini API integration (ready for your API key)  

## To Enable Gemini AI Integration:

### Step 1: Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Update the API Key
1. Open `script.js`
2. Find line 6: `this.apiKey = 'YOUR_GEMINI_API_KEY';`
3. Replace `'YOUR_GEMINI_API_KEY'` with your actual API key
4. Save the file

### Step 3: Enable Gemini Integration
1. In `script.js`, find the commented section starting at line 202
2. Uncomment the Gemini API call code (lines 204-220)
3. Comment out or remove the mock response system (lines 173-200)
4. Save the file

### Step 4: Test the Integration
1. Refresh your portfolio page
2. Click the chatbot icon
3. Ask questions about your work
4. Verify that Gemini AI is responding

## Features

### Current Mock Responses Include:
- **Greetings**: Friendly welcome messages
- **Projects**: Detailed information about all 6 projects
- **Experience**: Current and previous work experience
- **Skills**: Technical skills and specializations
- **Contact**: Email, phone, and social links
- **Education**: Cornell and Duke background

### Chatbot Capabilities:
- 💬 **Interactive Chat**: Users can ask questions naturally
- ⚡ **Quick Responses**: Instant answers about your background
- 📱 **Mobile Friendly**: Works on all device sizes
- 🎨 **Professional Design**: Matches your portfolio theme
- 🔄 **Typing Indicator**: Shows when bot is "thinking"
- 💾 **Persistent Chat**: Maintains conversation history

### User Experience:
- **Auto-prompt**: Chatbot pulses after 5 seconds to indicate availability
- **Smooth Animations**: Professional transitions and hover effects
- **Keyboard Support**: Enter key to send messages
- **Scroll Management**: Auto-scrolls to new messages
- **Error Handling**: Graceful fallbacks if API fails

## Customization Options

### Modify Responses:
Edit the `createContext()` method in `script.js` to update:
- Your background information
- Project details
- Skills and technologies
- Contact information
- Response tone and style

### Add More Topics:
Extend the mock responses object to include:
- Specific project deep-dives
- Technical explanations
- Career goals
- Hobbies and interests

### Styling Changes:
Modify the CSS in `styles.css` under the "Chatbot Widget" section to:
- Change colors and gradients
- Adjust size and positioning
- Modify animations
- Update mobile responsiveness

## Security Notes
- Keep your API key secure
- Consider implementing rate limiting
- Monitor API usage and costs
- Use environment variables for production

## Troubleshooting
- **API Key Issues**: Verify key is correct and has proper permissions
- **CORS Errors**: Ensure you're using the correct Gemini API endpoint
- **Rate Limits**: Implement delays between requests if needed
- **Mobile Issues**: Test on various devices and screen sizes

## Future Enhancements
- Multi-language support (Chinese/English)
- Voice input/output
- File sharing capabilities
- Integration with your calendar
- Analytics and conversation tracking

The chatbot is now ready to use! Visitors can learn about your work in an interactive, engaging way that sets your portfolio apart from traditional static sites.
