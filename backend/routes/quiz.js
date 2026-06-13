const { generateQuiz } = require('../services/aiService');
const { scoreQuiz } = require('../services/skillMatcher');
const { compressForAI } = require('../services/tokenCompressor');
const { getSession, updateSession, saveQuizResult } = require('../services/dbHelper');

/**
 * Handle POST /api/quiz/generate
 */
async function handleQuizGenerate(req, res) {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    const resumeData = user.resume_data;
    const targetRole = user.target_role || user.selected_role;

    if (!targetRole) {
      return res.status(400).json({ error: 'No target role found. Please select a career role first.' });
    }

    const compressed = compressForAI(resumeData, targetRole);

    const gapAnalysis = user.gap_analysis || {};
    const matchedSkills = gapAnalysis.matched_skills || [];
    const allSkills = [
      ...(resumeData.technical_skills || []),
      ...(resumeData.tools_and_frameworks || []),
    ];

    // Pick skills to quiz: prioritize matched skills (user already has them → verify depth)
    const topSkills = [
      ...matchedSkills.slice(0, 2),
      ...allSkills.filter(s => !matchedSkills.includes(s)).slice(0, 1)
    ].slice(0, 3);

    // Fallback: use any available skill if none matched
    if (topSkills.length === 0) {
      const fallback = allSkills.slice(0, 3);
      if (fallback.length === 0) {
        return res.status(400).json({ error: 'No skills found in resume to quiz' });
      }
      topSkills.push(...fallback);
    }

    // AI quiz generation
    const quiz = await generateQuiz(compressed, topSkills);

    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      return res.status(500).json({ error: 'AI failed to generate quiz questions. Please try again.' });
    }

    // Store quiz questions server-side (correct answers hidden from client)
    // Use a FLAT structure to avoid dot-notation issues with session store
    await updateSession(session_id, {
      quiz_questions: quiz.questions,    // flat key — avoids nested dot-notation bugs
      quiz_id: quiz.quiz_id,
    });

    // Return quiz WITHOUT correct answers
    const safeQuiz = {
      quiz_id: quiz.quiz_id,
      target_role: quiz.target_role,
      experience_level: quiz.experience_level,
      questions: quiz.questions.map(q => ({
        id: q.id,
        skill: q.skill,
        difficulty: q.difficulty,
        topic: q.topic,
        question: q.question,
        options: q.options,
        has_code: q.has_code || false,
        code_snippet: q.code_snippet || "",
      }))
    };

    res.json({ success: true, quiz: safeQuiz });

  } catch (err) {
    console.error('[quiz/generate] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate quiz' });
  }
}

/**
 * Handle POST /api/quiz/submit
 */
async function handleQuizSubmit(req, res) {
  try {
    const { session_id, quiz_id, answers, time_taken_seconds } = req.body;

    if (!session_id || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'session_id and answers array are required' });
    }

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    // Check flat key first (new flow), then legacy nested key (old flow)
    const questions = user.quiz_questions || user.quiz_result?.questions;
    if (!questions || questions.length === 0) {
      return res.status(404).json({ error: 'Quiz questions not found. Please generate quiz first.' });
    }

    // Score locally — zero AI tokens
    const perSkillScores = scoreQuiz(questions, answers);
    const overallScore = Math.round(
      perSkillScores.reduce((sum, s) => sum + s.score, 0) / perSkillScores.length
    );

    // Build full review with correct answers revealed
    const review = questions.map(q => {
      const userAnswer = answers.find(a => a.questionId == q.id);
      return {
        id: q.id,
        skill: q.skill,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        user_selected: userAnswer?.selectedOption || null,
        is_correct: userAnswer?.selectedOption === q.correct,
        has_code: q.has_code || false,
        code_snippet: q.code_snippet || "",
      };
    });

    // Persist results (flat keys)
    await saveQuizResult({
      session_id,
      quiz_id: quiz_id || user.quiz_id,
      target_role: user.target_role || user.selected_role,
      experience_level: user.resume_data?.experience_level,
      per_skill_scores: perSkillScores,
      overall_score: overallScore,
      time_taken_seconds: time_taken_seconds || 0,
    });

    await updateSession(session_id, {
      quiz_per_skill_scores: perSkillScores,
      quiz_overall_score: overallScore,
      quiz_review: review,
      quiz_score: overallScore,
    });

    res.json({
      success: true,
      overall_score: overallScore,
      per_skill_scores: perSkillScores,
      review,
    });

  } catch (err) {
    console.error('[quiz/submit] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to score quiz' });
  }
}

module.exports = { handleQuizGenerate, handleQuizSubmit };
