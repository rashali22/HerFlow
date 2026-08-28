import { generateChatResponse } from '../services/aiService.js';

// @desc    Process user question through RAG pipeline and return AI response
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res) => {
  try {
    const { question, message, conversationHistory } = req.body;
    const userQuery = question || message;

    if (!userQuery || typeof userQuery !== 'string' || !userQuery.trim()) {
      return res.status(400).json({ error: 'Please provide a valid question or message' });
    }

    if (conversationHistory && conversationHistory.length >= 10) {
      return res.status(400).json({
        error: 'Maximum conversation limit reached (5 questions)',
        limitReached: true,
      });
    }

    const response = await generateChatResponse(
      req.user._id,
      userQuery.trim(),
      conversationHistory || []
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error('AI chat controller error:', error);
    return res.status(500).json({
      error: 'Failed to process AI chat request',
      details: error.message || String(error),
    });
  }
};
