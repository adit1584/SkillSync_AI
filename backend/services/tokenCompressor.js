/**
 * Token Compression Service
 * Reduces resume JSON from ~4000 tokens to ~300 tokens before AI calls
 * Implements the 93% token reduction strategy from SkillSync AI spec
 */

/**
 * Compress resume JSON for AI calls — strips all non-essential fields
 * @param {Object} resumeJSON - Full structured resume from AI Prompt 1
 * @param {string} targetRole - The selected target role
 * @param {Array|null} quizScores - Optional quiz scores for later prompts
 * @returns {Object} Compressed payload (~300 tokens)
 */
function compressForAI(resumeJSON, targetRole, quizScores = null) {
  const compressed = {
    skills: (resumeJSON.technical_skills || []).slice(0, 10),
    tools: (resumeJSON.tools_and_frameworks || []).slice(0, 8),
    soft_skills: (resumeJSON.soft_skills || []).slice(0, 5),
    level: resumeJSON.experience_level || 'fresher',
    role: targetRole,
    domains: (resumeJSON.domains || []).slice(0, 5),
    projects_count: (resumeJSON.projects || []).length,
    certs_count: (resumeJSON.certifications || []).length,
  };

  // Add quiz scores only when provided (for simulation + roadmap calls)
  if (quizScores && quizScores.length > 0) {
    compressed.quiz = quizScores;
  }

  // Never send: raw_text, contact info, full experience, education details
  return compressed;
}

/**
 * Compress gap analysis output for simulation prompt
 */
function compressGapForSimulation(gapResult, resumeJSON, quizScores, targetRole) {
  return {
    validated_skills: quizScores || [],
    missing_skills: (gapResult.missing_skills || []).slice(0, 10),
    ats_score: gapResult.match_score || 0,
    overall_quiz_percent: computeOverallQuizPercent(quizScores),
    target_role: targetRole,
    experience_level: resumeJSON.experience_level || 'fresher',
  };
}

/**
 * Compute overall quiz percentage from per-skill scores
 */
function computeOverallQuizPercent(quizScores) {
  if (!quizScores || quizScores.length === 0) return 0;
  const total = quizScores.reduce((sum, s) => sum + (s.score || 0), 0);
  return Math.round(total / quizScores.length);
}

module.exports = { compressForAI, compressGapForSimulation, computeOverallQuizPercent };
