import { NextResponse } from 'next/server';

const KEYS = {
  gemini: process.env.GEMINI_API_KEY || '',
  groq: process.env.GROQ_API_KEY || '',
  mistral: process.env.MISTRAL_API_KEY || '',
  cerebras: process.env.CEREBRAS_API_KEY || '',
  openrouter: process.env.OPENROUTER_API_KEY || ''
};

export async function POST(req: Request) {
  try {
    const { messages, context, provider = 'gemini' } = await req.json();
    
    // System prompt setup
    const systemPrompt = `You are a friendly, encouraging, but highly experienced 20+ year JEE Advanced mentor. 
The user is a student preparing for JEE Advanced 2027. 

CRITICAL RULES FOR YOUR RESPONSES:
1. Use standard Markdown formatting extensively (bold, italics, headings, bullet points, numbered lists).
2. Use appropriate emojis to make the text lively, engaging, and friendly.
3. Be concise and break your responses into well-structured, scannable paragraphs and lists. 
4. DO NOT write massive, unbroken walls of text. Use spacing and formatting to your advantage.
5. Do not explicitly mention that you were fed JSON data. Just act like you naturally know their progress.

Here is the user's current progress data:
${JSON.stringify(context || {})}`;

    if (provider === 'gemini') {
      // Format messages for Gemini API
      const contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
      
      // Inject system context into the first user message
      if (contents.length > 0 && contents[0].role === 'user') {
        contents[0].parts[0].text = systemPrompt + '\n\nUser query:\n' + contents[0].parts[0].text;
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEYS.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch from Gemini');
      
      return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
      
    } else {
      // Standard OpenAI format for Groq, Mistral, Cerebras, OpenRouter
      let endpoint = '';
      let model = '';
      let apiKey = '';
      
      if (provider === 'groq') {
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        model = 'llama-3.3-70b-versatile';
        apiKey = KEYS.groq;
      } else if (provider === 'mistral') {
        endpoint = 'https://api.mistral.ai/v1/chat/completions';
        model = 'mistral-small-latest';
        apiKey = KEYS.mistral;
      } else if (provider === 'cerebras') {
        endpoint = 'https://api.cerebras.ai/v1/chat/completions';
        model = 'llama3.1-8b';
        apiKey = KEYS.cerebras;
      } else if (provider === 'openrouter') {
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        model = 'meta-llama/llama-3.1-8b-instruct';
        apiKey = KEYS.openrouter;
      }
      
      // Build standard OpenAI messages array
      const standardMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      ];
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(provider === 'openrouter' && {
             'HTTP-Referer': 'http://localhost:3000',
             'X-Title': 'JEE Tracker'
          })
        },
        body: JSON.stringify({
          model: model,
          messages: standardMessages,
          temperature: 0.7,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `Failed to fetch from ${provider}`);
      
      return NextResponse.json({ reply: data.choices[0].message.content });
    }
    
  } catch (error: any) {
    console.error(`Chat API Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
