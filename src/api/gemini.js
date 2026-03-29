import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

export async function callGemini(systemPrompt, userMessage) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite-preview',
    systemInstruction: systemPrompt,
  })

  const result = await model.generateContent(userMessage)
  let text = result.response.text()

  // Strip code fences if Gemini wraps response
  text = text.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim()

  return text
}
