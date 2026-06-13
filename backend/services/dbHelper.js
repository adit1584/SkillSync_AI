const mongoose = require('mongoose');
const sessionStore = require('./sessionStore');

// Models
const User = require('../models/User');
const Resume = require('../models/Resume');
const SessionState = require('../models/SessionState');
const RoleRecommendations = require('../models/RoleRecommendations');
const QuizAttempt = require('../models/QuizAttempt');
const InterviewAttempt = require('../models/InterviewAttempt');
const CareerReport = require('../models/CareerReport');
const Roadmap = require('../models/Roadmap');

/**
 * Returns true if MongoDB is currently connected
 */
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Adapter to fetch a reconstructed session by ID / User ID
 */
async function getSession(sessionId) {
  if (!sessionId) return null;

  if (isDbConnected()) {
    try {
      // Try to look up records using sessionId as user_id link
      const [resume, state, recs, report, roadmapDoc] = await Promise.all([
        Resume.findOne({ user_id: sessionId }).sort({ created_at: -1 }),
        SessionState.findOne({ user_id: sessionId }),
        RoleRecommendations.findOne({ user_id: sessionId }).sort({ created_at: -1 }),
        CareerReport.findOne({ user_id: sessionId }).sort({ created_at: -1 }),
        Roadmap.findOne({ user_id: sessionId }).sort({ created_at: -1 })
      ]);

      if (resume || state || recs) {
        return {
          session_id: sessionId,
          target_role: state?.selected_role || null,
          selected_role: state?.selected_role || null,
          custom_role: state?.custom_role || null,
          job_description: state?.job_description || null,
          target_opportunity_option: state?.target_opportunity_option || null,
          mode: state?.mode || null,
          quiz_answers: state?.quiz_answers || [],
          current_quiz_idx: state?.current_quiz_idx || 0,
          quiz_skipped: state?.quiz_skipped || false,
          interview_skipped: state?.interview_skipped || false,
          interview_history: state?.interview_history || [],
          interview_concluded: state?.interview_concluded || false,

          // Reconstruct resume_data object for existing route compatibility
          resume_data: resume ? {
            name: '',
            email: '',
            phone: '',
            experience_level: resume.extracted_experience?.[0]?.title || 'Mid',
            technical_skills: resume.extracted_skills || [],
            tools_and_frameworks: [],
            soft_skills: [],
            projects: resume.extracted_projects || [],
            certifications: resume.extracted_certifications || [],
            domains: [],
            education: resume.extracted_education || [],
            experience: resume.extracted_experience || []
          } : null,

          // Reconstruct recommendations
          recommended_roles: recs ? recs.roles : null,

          // Reconstruct gaps / reports
          gap_analysis: report ? report.gap_analysis : null,
          career_simulation: report ? report.simulations : null,
          career_readiness_score: report ? report.readiness_score : null,

          // Reconstruct roadmap
          roadmap: roadmapDoc ? { weeks: roadmapDoc.weeks } : null
        };
      }
    } catch (err) {
      console.warn('[dbHelper] MongoDB getSession failed, trying in-memory store:', err.message);
    }
  }
  return sessionStore.findOne(sessionId);
}

/**
 * Adapter to create a session
 */
async function createSession(sessionId, data) {
  if (isDbConnected()) {
    try {
      // Extract properties to save to respective collections
      if (data.resume_data) {
        await Resume.findOneAndUpdate(
          { user_id: sessionId },
          {
            $set: {
              user_id: sessionId,
              cloudinary_url: data.cloudinary_url || 'local-fallback-url',
              parsed_text: data.parsed_text || '',
              extracted_skills: data.resume_data.technical_skills || [],
              extracted_projects: data.resume_data.projects || [],
              extracted_experience: data.resume_data.experience || [],
              extracted_education: data.resume_data.education || [],
              extracted_certifications: data.resume_data.certifications || []
            }
          },
          { upsert: true, new: true }
        );
      }

      const stateFields = {
        user_id: sessionId,
        mode: data.mode || null,
        selected_role: data.selected_role || data.target_role || null,
        custom_role: data.custom_role || null,
        job_description: data.job_description || null,
        target_opportunity_option: data.target_opportunity_option || null,
        quiz_answers: data.quiz_answers || [],
        current_quiz_idx: data.current_quiz_idx || 0,
        interview_history: data.interview_history || [],
        interview_concluded: data.interview_concluded || false
      };

      await SessionState.findOneAndUpdate(
        { user_id: sessionId },
        { $set: stateFields },
        { upsert: true, new: true }
      );

      if (data.recommended_roles) {
        await RoleRecommendations.findOneAndUpdate(
          { user_id: sessionId },
          { $set: { roles: data.recommended_roles } },
          { upsert: true, new: true }
        );
      }
      return { session_id: sessionId };
    } catch (err) {
      console.warn('[dbHelper] MongoDB createSession failed, using in-memory store:', err.message);
    }
  }
  return sessionStore.create(sessionId, data);
}

/**
 * Adapter to update/save a session's parts
 */
async function updateSession(sessionId, updates) {
  if (isDbConnected()) {
    try {
      // 1. Update Resume
      if (updates.resume_data) {
        const resumeFields = {
          user_id: sessionId,
          extracted_skills: updates.resume_data.technical_skills || [],
          extracted_projects: updates.resume_data.projects || [],
          extracted_experience: updates.resume_data.experience || [],
          extracted_education: updates.resume_data.education || [],
          extracted_certifications: updates.resume_data.certifications || []
        };
        await Resume.findOneAndUpdate(
          { user_id: sessionId },
          { $set: resumeFields },
          { upsert: true }
        );
      }

      // 2. Update SessionState
      const stateFields = {};
      if (updates.selected_role !== undefined) stateFields.selected_role = updates.selected_role;
      if (updates.target_role !== undefined) stateFields.selected_role = updates.target_role;
      if (updates.custom_role !== undefined) stateFields.custom_role = updates.custom_role;
      if (updates.job_description !== undefined) stateFields.job_description = updates.job_description;
      if (updates.target_opportunity_option !== undefined) stateFields.target_opportunity_option = updates.target_opportunity_option;
      if (updates.mode !== undefined) stateFields.mode = updates.mode;
      if (updates.quiz_answers !== undefined) stateFields.quiz_answers = updates.quiz_answers;
      if (updates.current_quiz_idx !== undefined) stateFields.current_quiz_idx = updates.current_quiz_idx;
      if (updates.quiz_skipped !== undefined) stateFields.quiz_skipped = updates.quiz_skipped;
      if (updates.interview_skipped !== undefined) stateFields.interview_skipped = updates.interview_skipped;
      if (updates.interview_history !== undefined) stateFields.interview_history = updates.interview_history;
      if (updates.interview_concluded !== undefined) stateFields.interview_concluded = updates.interview_concluded;

      if (Object.keys(stateFields).length > 0) {
        await SessionState.findOneAndUpdate(
          { user_id: sessionId },
          { $set: stateFields },
          { upsert: true }
        );
      }

      // 3. Update RoleRecommendations
      if (updates.recommended_roles) {
        await RoleRecommendations.findOneAndUpdate(
          { user_id: sessionId },
          { $set: { roles: updates.recommended_roles } },
          { upsert: true }
        );
      }

      // 4. Update CareerReport
      const reportFields = {};
      if (updates.gap_analysis !== undefined) reportFields.gap_analysis = updates.gap_analysis;
      if (updates.career_simulation !== undefined) reportFields.simulations = updates.career_simulation;
      if (updates.career_readiness_score !== undefined) reportFields.readiness_score = updates.career_readiness_score;

      if (Object.keys(reportFields).length > 0) {
        await CareerReport.findOneAndUpdate(
          { user_id: sessionId },
          { $set: reportFields, role: updates.selected_role || updates.target_role || 'Target Role' },
          { upsert: true }
        );
      }

      // 5. Update Roadmap
      if (updates.roadmap) {
        await Roadmap.findOneAndUpdate(
          { user_id: sessionId },
          {
            $set: {
              weeks: updates.roadmap.weeks,
              priority_skills: updates.roadmap.priority_skills || [],
              certifications: updates.roadmap.certifications || [],
              projects: updates.roadmap.projects || []
            },
            role: updates.selected_role || updates.target_role || 'Target Role'
          },
          { upsert: true }
        );
      }
    } catch (err) {
      console.warn('[dbHelper] MongoDB updateSession failed, using in-memory store:', err.message);
    }
  }
  return sessionStore.update(sessionId, updates);
}

/**
 * Save quiz result to QuizAttempt history
 */
async function saveQuizResult(data) {
  if (isDbConnected()) {
    try {
      await QuizAttempt.create({
        user_id: data.session_id,
        role: data.target_role || 'Target Role',
        questions: data.per_skill_scores,
        score: data.overall_score,
        completed: true
      });
    } catch (err) {
      console.warn('[dbHelper] QuizAttempt save failed:', err.message);
    }
  }
  return null;
}

module.exports = {
  createSession,
  getSession,
  updateSession,
  saveQuizResult,
  isDbConnected
};
