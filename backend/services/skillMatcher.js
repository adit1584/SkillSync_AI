const roleDatasets = require('../data/roleDatasets.json');

/**
 * Local Skill Matching Engine — ZERO AI cost
 * Compares user skills against predefined role datasets
 */

/**
 * Normalize a skill string for comparison (lowercase, trim, remove special chars)
 */
function normalizeSkill(skill) {
  return skill.toLowerCase().trim().replace(/[.\-_]/g, '').replace(/\s+/g, ' ');
}

/**
 * Check if a user skill matches a required skill (fuzzy-friendly)
 */
function skillMatches(userSkill, requiredSkill) {
  const u = normalizeSkill(userSkill);
  const r = normalizeSkill(requiredSkill);

  // Exact match
  if (u === r) return true;

  // Substring match (e.g. "React.js" matches "React", "PyTorch" matches "pytorch")
  if (u.includes(r) || r.includes(u)) return true;

  // Common aliases
  const aliases = {
    'js': 'javascript',
    'javascript': 'js',
    'ts': 'typescript',
    'typescript': 'ts',
    'py': 'python',
    'python': 'py',
    'reactjs': 'react',
    'react': 'reactjs',
    'nodejs': 'node',
    'node': 'nodejs',
    'postgres': 'postgresql',
    'postgresql': 'postgres',
    'ml': 'machine learning',
    'machine learning': 'ml',
    'ai': 'artificial intelligence',
  };

  if (aliases[u] === r || aliases[r] === u) return true;

  return false;
}

/**
 * Main skill gap analysis — runs locally
 * @param {Array} userSkills - Array of user skill strings
 * @param {string} targetRole - Target role name (must exist in roleDatasets.json)
 * @returns {Object} Gap analysis result
 */
function analyzeSkillGap(userSkills, targetRole) {
  let roleData = roleDatasets[targetRole];
  
  if (!roleData && targetRole) {
    const normalized = targetRole.toLowerCase();
    for (const key of Object.keys(roleDatasets)) {
      if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
        roleData = roleDatasets[key];
        break;
      }
    }
  }

  if (!roleData) {
    roleData = {
      required_skills: ['Problem Solving', 'Git', 'System Design', 'Communication', 'Agile', 'APIs'],
      nice_to_have: ['Docker', 'CI/CD', 'Cloud Platforms', 'Unit Testing'],
      description: `Professional focused on ${targetRole || 'Target Role'} technologies.`,
      avg_salary_lpa: { fresher: '5-9', junior: '9-16', mid: '16-32', senior: '32-65' },
      avg_salary_usd: { fresher: '55k-80k', junior: '80k-110k', mid: '110k-150k', senior: '150k-220k' },
      top_companies: ['Google', 'Amazon', 'Microsoft', 'Atlassian'],
      interview_topics: ['Architecture', 'Design', 'Collaboration', 'Testing']
    };
  }

  const required = roleData.required_skills;
  const niceToHave = roleData.nice_to_have;

  const matched = required.filter(req =>
    userSkills.some(userSkill => skillMatches(userSkill, req))
  );

  const missing = required.filter(req =>
    !userSkills.some(userSkill => skillMatches(userSkill, req))
  );

  const niceToHaveGaps = niceToHave.filter(nice =>
    !userSkills.some(userSkill => skillMatches(userSkill, nice))
  );

  const matchScore = Math.round((matched.length / required.length) * 100);

  // ATS score: weighted match (required skills weighted 70%, nice-to-have 30%)
  const niceMatched = niceToHave.filter(nice =>
    userSkills.some(userSkill => skillMatches(userSkill, nice))
  );
  const atsScore = Math.round(
    (matched.length / required.length) * 70 +
    (niceMatched.length / Math.max(niceToHave.length, 1)) * 30
  );

  return {
    target_role: targetRole,
    match_score: matchScore,
    ats_score: atsScore,
    matched_skills: matched,
    missing_skills: missing,
    nice_to_have_gaps: niceToHaveGaps,
    nice_to_have_matched: niceMatched,
    total_required: required.length,
    readiness_level: getReadinessLevel(matchScore),
    role_info: {
      description: roleData.description,
      top_companies: roleData.top_companies,
      interview_topics: roleData.interview_topics,
      avg_salary_lpa: roleData.avg_salary_lpa,
      avg_salary_usd: roleData.avg_salary_usd,
    }
  };
}

/**
 * Score quiz answers locally — no AI needed
 * @param {Array} questions - Quiz questions with correct answers
 * @param {Array} userAnswers - Array of { questionId, selectedOption }
 * @returns {Array} Per-skill scores
 */
function scoreQuiz(questions, userAnswers) {
  const answerMap = {};
  userAnswers.forEach(a => {
    answerMap[a.questionId] = a.selectedOption;
  });

  // Group by skill
  const skillScores = {};
  questions.forEach(q => {
    const skill = q.skill;
    if (!skillScores[skill]) skillScores[skill] = { correct: 0, total: 0 };
    skillScores[skill].total++;
    if (answerMap[q.id] === q.correct) {
      skillScores[skill].correct++;
    }
  });

  return Object.entries(skillScores).map(([skill, data]) => ({
    skill,
    score: Math.round((data.correct / data.total) * 100),
    correct: data.correct,
    total: data.total,
    proficiency: getProficiencyLabel(Math.round((data.correct / data.total) * 100))
  }));
}

function getReadinessLevel(score) {
  if (score >= 80) return 'High';
  if (score >= 60) return 'Medium';
  if (score >= 40) return 'Low';
  return 'Very Low';
}

function getProficiencyLabel(score) {
  if (score >= 80) return 'Expert';
  if (score >= 60) return 'Proficient';
  if (score >= 40) return 'Beginner';
  return 'Needs Work';
}

module.exports = { analyzeSkillGap, scoreQuiz, normalizeSkill };
