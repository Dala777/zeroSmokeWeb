import axios from 'axios'

interface GeminiRequest {
  message: string
  history?: Array<{ role: 'user' | 'assistant' | 'system'; text: string; timestamp?: string }>
}

interface GeminiResponse {
  text: string
  rawResponse: any
}

const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://api.openai.com/v1/chat/completions'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY no está definido en .env; el endpoint de chat devolverá fallback solo')
}

export const geminiService = {
  async sendMessage({ message, history }: GeminiRequest): Promise<GeminiResponse> {
    if (!GEMINI_API_KEY) {
      throw new Error('Falta GEMINI_API_KEY en variables de entorno')
    }

    const systemPrompt = `Eres el asistente de ZeroSmoke. Acompaña al usuario en su proceso de dejar de fumar. Usa un tono empático, práctico y corto.`

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((item) => ({ role: item.role === 'user' ? 'user' : 'assistant', content: item.text })),
      { role: 'user', content: message },
    ]

    const body = {
      model: process.env.GEMINI_MODEL || 'gpt-4o-mini',
      messages: chatMessages,
      max_tokens: 350,
      temperature: 0.8,
    }

    const response = await axios.post(GEMINI_API_URL, body, {
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = response.data

    // OpenAI-like response parsing
    const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || ''

    return {
      text: text.trim(),
      rawResponse: data,
    }
  },
}
