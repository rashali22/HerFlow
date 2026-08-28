import { Period } from '../models/Period.js';
import { updateUserCycleInsights } from '../services/cycleService.js';
import { embedPeriodData } from '../services/embeddingService.js';

// @desc    Get all periods for the authenticated user
// @route   GET /api/periods
// @access  Private
export const getPeriods = async (req, res) => {
  try {
    const periods = await Period.find({ userId: req.user._id }).sort({ startDate: -1 });
    return res.status(200).json(periods);
  } catch (error) {
    console.error('Error fetching periods:', error);
    return res.status(500).json({ error: 'Failed to fetch periods' });
  }
};

// @desc    Get single period by ID
// @route   GET /api/periods/:id
// @access  Private
export const getPeriodById = async (req, res) => {
  try {
    const period = await Period.findOne({ _id: req.params.id, userId: req.user._id });
    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }
    return res.status(200).json(period);
  } catch (error) {
    console.error('Error fetching period by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch period' });
  }
};

// @desc    Create or update a period
// @route   POST /api/periods
// @access  Private
export const createPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ error: 'Start date is required' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    let end = null;
    if (endDate) {
      end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
    }

    // Upsert period by (userId, startDate)
    const period = await Period.findOneAndUpdate(
      {
        userId: req.user._id,
        startDate: start,
      },
      {
        userId: req.user._id,
        startDate: start,
        endDate: end,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    // Asynchronously embed period data for vector RAG search
    embedPeriodData(req.user._id, period).catch((err) =>
      console.error('[Embeddings] Error in embedPeriodData:', err.message)
    );

    // Recalculate cycle insights
    await updateUserCycleInsights(req.user._id);

    return res.status(201).json(period);
  } catch (error) {
    console.error('Error creating/updating period:', error);
    return res.status(500).json({ error: 'Failed to save period' });
  }
};

// @desc    Update a period by ID
// @route   PUT /api/periods/:id
// @access  Private
export const updatePeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const period = await Period.findOne({ _id: req.params.id, userId: req.user._id });
    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      period.startDate = start;
    }

    if (endDate !== undefined) {
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        period.endDate = end;
      } else {
        period.endDate = null;
      }
    }

    await period.save();

    // Recalculate embeddings & insights
    embedPeriodData(req.user._id, period).catch((err) =>
      console.error('[Embeddings] Error in embedPeriodData:', err.message)
    );
    await updateUserCycleInsights(req.user._id);

    return res.status(200).json(period);
  } catch (error) {
    console.error('Error updating period:', error);
    return res.status(500).json({ error: 'Failed to update period' });
  }
};

// @desc    Delete a period
// @route   DELETE /api/periods/:id
// @access  Private
export const deletePeriod = async (req, res) => {
  try {
    const period = await Period.findOne({ _id: req.params.id, userId: req.user._id });

    if (!period) {
      return res.status(404).json({ error: 'Period not found' });
    }

    await Period.deleteOne({ _id: req.params.id, userId: req.user._id });

    // Recalculate cycle insights
    await updateUserCycleInsights(req.user._id);

    return res.status(200).json({ success: true, message: 'Period deleted successfully' });
  } catch (error) {
    console.error('Error deleting period:', error);
    return res.status(500).json({ error: 'Failed to delete period' });
  }
};
