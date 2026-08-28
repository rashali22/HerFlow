import { DailyFlow } from '../models/DailyFlow.js';
import { embedDailyFlow } from '../services/embeddingService.js';

// @desc    Get all flows for the authenticated user
// @route   GET /api/flows (or /api/flow)
// @access  Private
export const getFlows = async (req, res) => {
  try {
    const flows = await DailyFlow.find({ userId: req.user._id }).sort({ date: -1 });
    return res.status(200).json(flows);
  } catch (error) {
    console.error('Error fetching flows:', error);
    return res.status(500).json({ error: 'Failed to fetch flows' });
  }
};

// @desc    Create or update daily flow
// @route   POST /api/flows (or /api/flow)
// @access  Private
export const createOrUpdateFlow = async (req, res) => {
  try {
    const { date, intensity } = req.body;

    if (!date || intensity === undefined) {
      return res.status(400).json({ error: 'Please provide date and flow intensity' });
    }

    const flowDate = new Date(date);
    flowDate.setHours(0, 0, 0, 0);

    const parsedIntensity = Number(intensity);
    if (isNaN(parsedIntensity) || parsedIntensity < 0 || parsedIntensity > 3) {
      return res.status(400).json({ error: 'Intensity must be a number between 0 and 3' });
    }

    const flow = await DailyFlow.findOneAndUpdate(
      {
        userId: req.user._id,
        date: flowDate,
      },
      {
        userId: req.user._id,
        date: flowDate,
        intensity: parsedIntensity,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Embed flow record for RAG semantic search
    embedDailyFlow(req.user._id, flow).catch((err) =>
      console.error('[Embeddings] Error in embedDailyFlow:', err.message)
    );

    return res.status(201).json(flow);
  } catch (error) {
    console.error('Error saving flow:', error);
    return res.status(500).json({ error: 'Failed to save flow record' });
  }
};

// @desc    Update daily flow by ID
// @route   PUT /api/flows/:id
// @access  Private
export const updateFlow = async (req, res) => {
  try {
    const { intensity } = req.body;
    const flow = await DailyFlow.findOne({ _id: req.params.id, userId: req.user._id });

    if (!flow) {
      return res.status(404).json({ error: 'Flow record not found' });
    }

    if (intensity !== undefined) {
      flow.intensity = Number(intensity);
      await flow.save();
    }

    return res.status(200).json(flow);
  } catch (error) {
    console.error('Error updating flow:', error);
    return res.status(500).json({ error: 'Failed to update flow record' });
  }
};

// @desc    Delete daily flow
// @route   DELETE /api/flows/:id
// @access  Private
export const deleteFlow = async (req, res) => {
  try {
    const flow = await DailyFlow.findOne({ _id: req.params.id, userId: req.user._id });

    if (!flow) {
      return res.status(404).json({ error: 'Flow record not found' });
    }

    await DailyFlow.deleteOne({ _id: req.params.id, userId: req.user._id });
    return res.status(200).json({ success: true, message: 'Flow record deleted' });
  } catch (error) {
    console.error('Error deleting flow:', error);
    return res.status(500).json({ error: 'Failed to delete flow record' });
  }
};
