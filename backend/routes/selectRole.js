const { analyzeSkillGap } = require('../services/skillMatcher');
const { compressForAI } = require('../services/tokenCompressor');
const { getSession, updateSession } = require('../services/dbHelper');

/**
 * Handle POST /api/select-role
 * User has picked a recommended role. Run local skill gap analysis and store selection.
 */
async function handleSelectRole(req, res) {
  try {
    const { session_id, selected_role } = req.body;

    if (!session_id || !selected_role) {
      return res.status(400).json({ error: 'session_id and selected_role are required' });
    }

    const user = await getSession(session_id);
    if (!user) return res.status(404).json({ error: 'Session not found. Please re-upload your resume.' });

    const resumeData = user.resume_data;
    if (!resumeData) return res.status(400).json({ error: 'Resume data not found in session.' });

    console.log(`[select-role] Session ${session_id} selected role: ${selected_role}`);

    // Collect all user skills for local gap analysis
    const allUserSkills = [
      ...(resumeData.technical_skills || []),
      ...(resumeData.tools_and_frameworks || []),
    ];

    // Local skill gap analysis — ZERO tokens
    let gapAnalysis;
    try {
      gapAnalysis = analyzeSkillGap(allUserSkills, selected_role);
    } catch (matchErr) {
      // Role not found in local dataset — use AI recommendation data as fallback
      const recData = (user.recommended_roles || []).find(r => r.role === selected_role);
      const matchScore = recData ? recData.match_score : 70;
      gapAnalysis = {
        target_role: selected_role,
        match_score: matchScore,
        ats_score: matchScore,
        matched_skills: recData ? recData.strengths : [],
        missing_skills: recData ? recData.missing_skills : [],
        nice_to_have_gaps: [],
        nice_to_have_matched: [],
        total_required: (recData ? recData.strengths.length + recData.missing_skills.length : 10),
        readiness_level: matchScore >= 80 ? 'High' : matchScore >= 60 ? 'Medium' : matchScore >= 40 ? 'Low' : 'Very Low',
        role_info: { description: '', top_companies: [], interview_topics: [], avg_salary_lpa: {}, avg_salary_usd: {} },
      };
      console.warn(`[select-role] Role "${selected_role}" not in local dataset — using AI recommendation data as fallback`);
    }

    // Compress the profile for future AI calls using the selected role
    const compressed = compressForAI(resumeData, selected_role);

    // Persist selected role, gap analysis, and compressed profile
    await updateSession(session_id, {
      selected_role,
      target_role: selected_role,
      gap_analysis: gapAnalysis,
    });

    res.json({
      success: true,
      selected_role,
      gap_analysis: gapAnalysis,
      compressed_profile: compressed,
    });

  } catch (err) {
    console.error('[select-role] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to select role' });
  }
}

module.exports = { handleSelectRole };
