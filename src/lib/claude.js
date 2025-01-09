import Anthropic from '@anthropic-ai/sdk';
import { supabase } from './supabase';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

if (!CLAUDE_API_KEY) {
  console.error('Missing Claude API key environment variable')
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function remixContent(text, platform) {
  const prompts = {
    twitter: `
      Rewrite this as an engaging tweet, keeping it under 280 characters. You are a social media expert and ghostwriter. You work for a popular blogger, and your job is to take their blog post and develop a variety of tweets to share ideas from the post.
Since you are a ghostwriter, you must follow the style, tone, and voice of the blog post as closely as possible. 
      Guidelines:
      - Please return the tweets in a list format, with each tweet on a new line, and include at least five tweets.
      - Use relevant emojis sparingly (1-2 max)
      - Do not include hashtags
      - Maintain the key message and call to action
      - Make it conversational but professional
      - If there's a link, place it at the end
      Original text: "${text}"
    `,
    
    linkedin: `
      Rewrite this as an engaging LinkedIn post. You are a social media expert and ghostwriter. You work for a popular blogger, and your job is to take their blog post and develop a variety of tweets to share ideas from the post.
Since you are a ghostwriter, you must follow the style, tone, and voice of the blog post as closely as possible.  
      Guidelines:
      - Add relevant business context
      - Break into 2-3 short paragraphs for readability
      - Maintain a professional yet conversational tone
      - Include a clear call to action
      - Add 3-5 relevant hashtags at the end
      - Optimize for LinkedIn's algorithm by encouraging engagement
      - Keep under 1,300 characters for optimal reach
      Original text: "${text}"
    `,
    
    instagram: `
      Rewrite this as an Instagram caption. You are a social media expert and ghostwriter. You work for a popular blogger, and your job is to take their blog post and develop a variety of tweets to share ideas from the post.
Since you are a ghostwriter, you must follow the style, tone, and voice of the blog post as closely as possible. 
      Guidelines:
      - Make it casual and engaging
      - Break into short, readable paragraphs
      - Add 1-2 relevant emojis 
      - Include a call to action (e.g., "Double tap if you agree" or "Share your thoughts below")
      - Add line breaks between paragraphs using \n
      - End with 5-8 relevant hashtags
      - Keep the tone friendly and authentic
      - Optimize for Instagram's algorithm by encouraging engagement
      Original text: "${text}"
    `
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: prompts[platform] || "No text provided"
      }]
    });

    if (message.content && message.content[0] && message.content[0].text) {
      if (platform === 'twitter') {
        return message.content[0].text.split('\n').filter(line => line.trim());
      }
      return [message.content[0].text];
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

export async function saveContent(content, platform) {
  try {
    const { data, error } = await supabase
      .from('saved_content')
      .insert([
        {
          content,
          platform,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
} 