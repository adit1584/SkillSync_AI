const { verifyToken } = require('../middleware/authMiddleware');
const QuizAttempt = require('../models/QuizAttempt');
const InterviewAttempt = require('../models/InterviewAttempt');
const CareerReport = require('../models/CareerReport');
const JobScan = require('../models/JobScan');
const Roadmap = require('../models/Roadmap');
const { isDbConnected } = require('../services/dbHelper');

/**
 * Handle GET /api/history
 */
async function handleGetHistory(req, res) {
  const userId = verifyToken(req, res);
  if (!userId) return;

  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        quizzes: [],
        interviews: [],
        reports: [],
        scans: [],
        roadmaps: []
      });
    }

    const [quizzes, interviews, reports, scans, roadmaps] = await Promise.all([
      QuizAttempt.find({ user_id: userId }).sort({ created_at: -1 }),
      InterviewAttempt.find({ user_id: userId }).sort({ created_at: -1 }),
      CareerReport.find({ user_id: userId }).sort({ created_at: -1 }),
      JobScan.find({ user_id: userId }).sort({ created_at: -1 }),
      Roadmap.find({ user_id: userId }).sort({ created_at: -1 })
    ]);

    res.json({
      success: true,
      quizzes,
      interviews,
      reports,
      scans,
      roadmaps
    });

  } catch (err) {
    console.error('[history] Get history error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to retrieve history.' });
  }
}

module.exports = { handleGetHistory };
