import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchUserData } from './embeddingService.js';
import { CycleInsight } from '../models/CycleInsight.js';

let genAI = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Gemini] Warning: GEMINI_API_KEY is not set in environment.');
      return null;
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Executes the RAG pipeline for the authenticated user and generates an AI response.
 */
export async function generateChatResponse(userId, question, conversationHistory = []) {
  if (!question || typeof question !== 'string') {
    throw new Error('Invalid question');
  }

  const ai = getGenAI();
  if (!ai) {
    return {
      answer:
        'AI Assistant is currently offline because the GEMINI_API_KEY has not been configured yet. Please check your backend .env settings.',
      sources: [],
    };
  }

  // 1. Semantic search strictly for the authenticated user
  const results = await searchUserData(userId, question, 7);

  // Also fetch user's cycle insight summary if available
  const insight = await CycleInsight.findOne({ userId });
  let insightContext = '';
  if (insight) {
    insightContext = `User General Cycle Stats: Average cycle length is ${
      insight.avgCycleLength ? `${insight.avgCycleLength} days` : 'calculating'
    }, Average period duration is ${
      insight.avgPeriodLength ? `${insight.avgPeriodLength} days` : 'calculating'
    }, Next predicted period starts on ${
      insight.nextPeriodDate ? new Date(insight.nextPeriodDate).toDateString() : 'insufficient data'
    }. Total logged periods: ${insight.totalPeriods}.`;
  }

  const dataContext =
    results.length > 0
      ? results.map((r) => `- ${r.content} (${r.source})`).join('\n')
      : 'No specific period or flow entries found matching this question.';

  if (results.length === 0 && !insight) {
    return {
      answer:
        'I don’t have enough of your cycle data yet to answer that. Try logging your periods or daily flow information on the dashboard first, and I will be happy to help!',
      sources: [],
    };
  }

  // 2. Format conversation history
  let conversationContext = '';
  if (conversationHistory && conversationHistory.length > 0) {
    conversationContext =
      '\n\nPrevious Conversation:\n' +
      conversationHistory
        .map((msg) => `${msg.role === 'user' ? 'User' : 'HerFlow'}: ${msg.content}`)
        .join('\n');
  }

  // 3. Prompt Construction with HerFlow persona
  const prompt = `
You are HerFlow, a calm, warm, empathetic, and human-like menstrual health assistant and also a general guide for women's overall well-being.

STRICT OUTPUT RULES (VERY IMPORTANT):
- Write in natural conversational sentences, like a caring companion would
- Keep the tone gentle, reassuring, respectful, and clear
- When useful, use simple Markdown bullet points or numbered lists
- Short paragraphs or sentences are preferred
- Keep the answer concise and to the point

FORMAT RULES:
- If you list items, use "-" for bullet points
- Use "1.", "2.", "3." for numbered lists
- Do NOT use "•" symbols

BEHAVIOR RULES:
- Use ONLY the user's health data provided below along with healthy scientific guidance
- Reference previous questions and answers when relevant from the conversation history
- If the data is insufficient, clearly say you do not have enough information but provide gentle general advice if applicable
- Do NOT diagnose or give medical prescriptions
- You may suggest gentle next steps (e.g., tracking more data, resting, drinking fluids, or consulting a healthcare professional for persistent concerns)
- Acknowledge the user's concern warmly if they seem anxious
- Always encourage the user to seek professional medical advice for serious or persistent symptoms
- Be open and compassionate about questions like cycle irregularities, flow changes, PMS symptoms, mood changes, cramps, sleep, and lifestyle impacts

User's Health Data & Context:
${insightContext}
${dataContext}
${conversationContext}

User's Question:
${question}

Now reply in sweet, friendly, helpful human language:
`;

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-3.5-flash',
    });

    const result = await model.generateContent(prompt);
    const rawAnswer = result.response.text();
    const answer = rawAnswer ? rawAnswer.trim() : 'I am here to help. Could you try rephrasing your question?';

    return {
      answer,
      sources: results.map((r) => ({
        source: r.source,
        content: r.content,
        similarity: Number(r.similarity.toFixed(4)),
      })),
    };
  } catch (error) {
    console.error('[Gemini] Error generating AI response:', error);
    if (error?.status === 429 || error?.message?.includes('quota')) {
      return {
        answer: 'I’m receiving a lot of questions right now. Please wait a moment and try again.',
        retryAfter: 30,
        sources: [],
      };
    }
    throw error;
  }
}
