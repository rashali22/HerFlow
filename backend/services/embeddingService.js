import { GoogleGenerativeAI } from '@google/generative-ai';
import { Embedding } from '../models/Embedding.js';
import { cosineSimilarity } from '../utils/math.js';

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
 * Generate vector embedding using Google Gemini Embeddings API (gemini-embedding-001).
 */
export async function createEmbedding(text) {
  const ai = getGenAI();
  if (!ai) {
    console.warn('[Embeddings] Gemini API key not found. Returning empty vector.');
    return [];
  }

  try {
    const model = ai.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('[Embeddings] Error generating embedding:', error.message);
    return [];
  }
}

/**
 * Embeds period record and saves to database.
 */
export async function embedPeriodData(userId, period) {
  const startDateStr = new Date(period.startDate).toDateString();
  const endDateStr = period.endDate ? new Date(period.endDate).toDateString() : 'ongoing';
  const content = `Period record: Started on ${startDateStr}, Ended on ${endDateStr}`;

  const vector = await createEmbedding(content);
  if (!vector || vector.length === 0) return null;

  return await Embedding.findOneAndUpdate(
    { userId, source: 'period', sourceId: String(period._id || period.id) },
    {
      userId,
      source: 'period',
      sourceId: String(period._id || period.id),
      content,
      vector,
    },
    { upsert: true, new: true }
  );
}

/**
 * Embeds daily flow record and saves to database.
 */
export async function embedDailyFlow(userId, flow) {
  const intensityLabels = ['None', 'Light', 'Medium', 'Heavy'];
  const intensityText = intensityLabels[flow.intensity] || 'Unknown';
  const dateStr = new Date(flow.date).toDateString();
  const content = `Flow record on ${dateStr}: ${intensityText} intensity flow`;

  const vector = await createEmbedding(content);
  if (!vector || vector.length === 0) return null;

  return await Embedding.findOneAndUpdate(
    { userId, source: 'flow', sourceId: String(flow._id || flow.id || dateStr) },
    {
      userId,
      source: 'flow',
      sourceId: String(flow._id || flow.id || dateStr),
      content,
      vector,
    },
    { upsert: true, new: true }
  );
}

/**
 * Semantic vector similarity search strictly scoped to the authenticated user.
 * Guarantees 100% User Data Isolation.
 */
export async function searchUserData(userId, query, limit = 7) {
  const queryVector = await createEmbedding(query);
  if (!queryVector || queryVector.length === 0) {
    return [];
  }

  // 1. Fetch only the authenticated user's embeddings
  const userEmbeddings = await Embedding.find({ userId });
  if (!userEmbeddings || userEmbeddings.length === 0) {
    return [];
  }

  // 2. Compute cosine similarity for each user record
  const scored = userEmbeddings
    .map((doc) => {
      const similarity = cosineSimilarity(queryVector, doc.vector);
      return {
        id: doc._id,
        content: doc.content,
        source: doc.source,
        sourceId: doc.sourceId,
        similarity: isNaN(similarity) ? 0 : similarity,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  // 3. Return top K results
  return scored.slice(0, limit);
}
