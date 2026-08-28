import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, RotateCcw, AlertCircle, Sparkles, ChevronRight, Shield } from 'lucide-react';
import { aiApi, insightApi } from '../services/api';

const MAX_QUESTIONS = 5;

export default function ClarityPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [hasInsights, setHasInsights] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, loading]);

  useEffect(() => {
    const checkInsights = async () => {
      try {
        const res = await insightApi.getInsights();
        setHasInsights(!!res.data);
      } catch (err) {
        console.error('Error checking insights:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    checkInsights();
  }, []);

  const handleAsk = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || loading || questionCount >= MAX_QUESTIONS) return;

    const currentQuestion = question.trim();
    setQuestion('');
    setLoading(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Optimistically append user message
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: currentQuestion, time: now },
    ];
    setConversationHistory(updatedHistory);

    try {
      const res = await aiApi.chat({
        question: currentQuestion,
        conversationHistory: conversationHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const data = res.data;
      const answer =
        data.answer ||
        'I am here to support you. Could you provide more details about how you are feeling?';

      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: answer, time: now },
      ]);
      setQuestionCount((prev) => prev + 1);
    } catch (err) {
      console.error('AI chat error:', err);
      setConversationHistory([
        ...updatedHistory,
        {
          role: 'assistant',
          content:
            "I'm sorry, I couldn't process your question right now. Please try asking again in a moment.",
          time: now,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConversationHistory([]);
    setQuestionCount(0);
    setQuestion('');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-6 md:py-8 pb-28 px-4 md:px-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-primary p-6 md:p-8 text-white shadow-lg">
          <div className="pointer-events-none absolute -top-1/2 -right-[10%] h-[250px] w-[300px] rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-[30%] -left-[5%] h-[200px] w-[200px] rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <Brain className="w-7 h-7 text-pink-300" />
                <span>Get Clarity with HerFlow</span>
              </h1>
              <p className="text-white/80 text-sm md:text-base mt-1">
                Your personalized AI health companion, powered by Gemini and your private cycle data.
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-full transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col min-h-[500px]">
          {/* Top Session Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Questions: {questionCount} / {MAX_QUESTIONS}
              </span>
              {questionCount >= MAX_QUESTIONS && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                  Limit reached
                </span>
              )}
            </div>

            {conversationHistory.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Conversation</span>
              </button>
            )}
          </div>

          {/* Conversation Bubbles */}
          <div className="flex-1 space-y-4 overflow-y-auto mb-6">
            {conversationHistory.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="w-16 h-16 rounded-3xl bg-pink-50 text-pink-400 border border-pink-100 flex items-center justify-center mx-auto mb-4 text-3xl">
                  🌸
                </div>
                <h3 className="text-base font-bold text-gray-700 mb-1">
                  How can HerFlow help you today?
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Ask about your cycle predictions, flow trends, PMS relief, cramp management, or general women's wellness.
                </p>

                {/* Example Prompts */}
                <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-md mx-auto">
                  {[
                    'When is my next period expected?',
                    'What can you tell me about my recent flow?',
                    'What phase of my cycle am I currently in?',
                  ].map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuestion(preset);
                      }}
                      className="text-xs bg-pink-50 hover:bg-pink-100 text-primary font-medium py-1.5 px-3 rounded-full border border-pink-200 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              conversationHistory.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-4 md:p-5 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-pink-50/70 border border-pink-100 text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1.5">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider ${
                          msg.role === 'user' ? 'text-white/80' : 'text-primary'
                        }`}
                      >
                        {msg.role === 'user' ? 'You' : 'HerFlow 🌸'}
                      </span>
                      {msg.time && (
                        <span
                          className={`text-[10px] ${
                            msg.role === 'user' ? 'text-white/60' : 'text-gray-400'
                          }`}
                        >
                          {msg.time}
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-xs md:text-sm leading-relaxed prose prose-sm max-w-none ${
                        msg.role === 'user' ? 'prose-invert text-white' : 'text-gray-800'
                      }`}
                    >
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="my-1" {...props} />,
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-4 my-1.5 space-y-1" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-4 my-1.5 space-y-1" {...props} />
                          ),
                          li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {/* Typing Indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-pink-50/80 border border-pink-100 text-primary text-xs font-semibold rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>HerFlow is thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleAsk} className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                disabled={loading || questionCount >= MAX_QUESTIONS}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  questionCount >= MAX_QUESTIONS
                    ? 'Maximum questions reached. Please click "New Conversation".'
                    : 'Ask anything to HerFlow...'
                }
                className="flex-1 px-4 py-3.5 bg-pink-50/40 border border-gray-200 rounded-2xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={!question.trim() || loading || questionCount >= MAX_QUESTIONS}
                className="bg-primary hover:bg-primary/90 text-white font-bold px-4 sm:px-6 rounded-2xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-bold">Ask</span>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-pink-50/50 rounded-2xl border border-pink-100 flex items-center gap-2 text-[11px] text-gray-500">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <span>
                HerFlow provides educational guidance and data summaries. Always consult a healthcare provider for medical diagnosis.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
