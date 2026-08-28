import mongoose from 'mongoose';

const embeddingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['period', 'flow', 'insight', 'general'],
      required: true,
    },
    sourceId: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
    },
    vector: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user data isolation in vector searches
embeddingSchema.index({ userId: 1, source: 1 });

export const Embedding = mongoose.model('Embedding', embeddingSchema);
