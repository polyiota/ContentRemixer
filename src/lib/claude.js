import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function remixContent(text, platform) {
  const prompts = {
    twitter: "Rewrite this as an engaging tweet, keeping it under 280 characters. Make it punchy and attention-grabbing while maintaining the key message:",
    linkedin: "Rewrite this as a professional LinkedIn post. Add relevant business context and maintain a professional tone while being engaging:",
    instagram: "Rewrite this as an Instagram caption. Make it casual, engaging, and add relevant emoji suggestions. Include hashtag suggestions at the end:"
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: text ? `${prompts[platform]} "${text}"` : "No text provided"
      }]
    });

    if (message.content && message.content[0] && message.content[0].text) {
      return message.content[0].text;
    } else {
      throw new Error('Invalid response format from Claude API');
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

export async function sendMessage(message) {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
} 