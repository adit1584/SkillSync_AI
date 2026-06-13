const Groq = require('groq-sdk');
const https = require('https');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Primary models list for automatic fallback
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama-3.1-70b-versatile',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'llama-3.2-3b-instruct',
  'llama-3.2-1b-instruct'
];

/**
 * Helper to clean JSON string from Markdown code block wrappers
 */
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
  }
  return cleaned.trim();
}

/**
 * Core HTTPS requester for Gemini API (zero external dependency fallback)
 */
function callGemini(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return reject(new Error('GEMINI_API_KEY is not defined in environment variables'));
    }

    const postData = JSON.stringify({
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`Gemini API returned HTTP status ${res.statusCode}: ${body}`));
          }
          const responseJson = JSON.parse(body);
          const rawText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) return reject(new Error('Empty text response from Gemini API'));
          const cleanedText = cleanJsonResponse(rawText);
          resolve(JSON.parse(cleanedText));
        } catch (err) {
          reject(new Error(`Failed to parse Gemini response: ${err.message}`));
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(postData);
    req.end();
  });
}

/**
 * Core AI call with automatic multi-model Groq and Gemini API fallback
 */
async function callGroq(systemPrompt, userPrompt, retries = 1) {
  let lastError = null;

  // 1. Try Groq Models
  for (const model of GROQ_MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[aiService] Calling Groq model ${model} (attempt ${attempt + 1})...`);
        const completion = await groq.chat.completions.create({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4096,
          response_format: { type: 'json_object' }
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) throw new Error('Empty response from Groq');

        return JSON.parse(raw);
      } catch (err) {
        console.warn(`[aiService] Groq model ${model} attempt ${attempt + 1} failed:`, err.message);
        lastError = err;
        
        // If it's a rate limit, decommissioned model, or overload, fail quickly to try the next model
        const errMsg = err.message.toLowerCase();
        const isFallbackTrigger = errMsg.includes('429') || 
                                  errMsg.includes('rate limit') || 
                                  errMsg.includes('decommissioned') || 
                                  errMsg.includes('not supported') || 
                                  errMsg.includes('400') ||
                                  errMsg.includes('503') ||
                                  errMsg.includes('overloaded');
                                  
        if (isFallbackTrigger) {
          break; // break the attempt loop, go to the next model in GROQ_MODELS
        }
        
        if (attempt < retries) {
          await sleep(1000 * (attempt + 1));
        }
      }
    }
  }

  // 2. Try Gemini Fallback if API key exists
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('[aiService] Groq limits exceeded. Falling back to Gemini API (gemini-1.5-flash)...');
      return await callGemini(systemPrompt, userPrompt);
    } catch (err) {
      console.error('[aiService] Gemini fallback failed:', err.message);
      lastError = err;
    }
  }

  throw new Error(`AI service exhausted all fallback options. Last error: ${lastError.message}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────────────────────
// PROMPT 1 — Resume Skill Extraction
// ─────────────────────────────────────────────────────────────────
async function extractSkillsFromResume(rawResumeText) {
  const systemPrompt = `You are SkillSync AI, an intelligent career acceleration engine built for students and freshers.
You are a resume parser and skill extractor. Extract all structured information from the resume text. Be thorough and precise.
Always respond in strict JSON. Never fabricate data — only extract what is explicitly present.`;

  const userPrompt = `Resume text:
"""
${rawResumeText}
"""

Extract and return ONLY this JSON structure — no explanation, no markdown:

{
  "name": "",
  "email": "",
  "phone": "",
  "experience_level": "fresher | junior | mid | senior",
  "education": [
    { "degree": "", "institution": "", "year": "" }
  ],
  "experience": [
    { "role": "", "company": "", "duration": "", "description": "" }
  ],
  "technical_skills": [],
  "soft_skills": [],
  "tools_and_frameworks": [],
  "projects": [
    { "name": "", "tech_stack": [], "description": "" }
  ],
  "certifications": [],
  "domains": []
}`;

  return callGroq(systemPrompt, userPrompt);
}

// ─────────────────────────────────────────────────────────────────
// PROMPT 3 — Adaptive Skill Verification Quiz
// ─────────────────────────────────────────────────────────────────
async function generateQuiz(compressedProfile, topSkills) {
  const { v4: uuidv4 } = require('uuid');

  const systemPrompt = `You are SkillSync AI — an expert technical interviewer. Generate adaptive multiple-choice quizzes to verify practical knowledge of resume-listed skills.
Rules:
- Questions must test PRACTICAL understanding, not just definitions
- Scale difficulty to experience_level:
    fresher  → conceptual + basic application
    junior   → implementation + common errors
    mid      → debugging + architecture trade-offs
    senior   → system design + performance optimization
- 1 correct answer + 3 plausible wrong answers per question
- Tag every question with skill, difficulty, and topic
- Output ONLY valid JSON — no explanation, no markdown fences`;

  const userPrompt = `Skills to test: ${topSkills.slice(0, 3).join(', ')}
Target Role: ${compressedProfile.role}
Experience Level: ${compressedProfile.level}

Generate 5 questions per skill (15 questions total).

Return ONLY this JSON:
{
  "quiz_id": "${uuidv4()}",
  "target_role": "${compressedProfile.role}",
  "experience_level": "${compressedProfile.level}",
  "questions": [
    {
      "id": 1,
      "skill": "",
      "difficulty": "easy | medium | hard",
      "topic": "",
      "question": "",
      "options": { "A": "", "B": "", "C": "", "D": "" },
      "correct": "A | B | C | D",
      "explanation": ""
    }
  ]
}`;

  return callGroq(systemPrompt, userPrompt);
}

// ─────────────────────────────────────────────────────────────────
// PROMPT 4 — Career Simulation Engine
// ─────────────────────────────────────────────────────────────────
async function simulateCareer(simulationInput) {
  const systemPrompt = `You are SkillSync AI — a senior career strategist with deep expertise in tech hiring and career trajectory modeling for the Indian tech market.
Generate realistic, data-driven career simulations. Be specific: use real role titles, real timelines, real salary ranges in Indian LPA (Lakhs Per Annum).
Output ONLY valid JSON.`;

  const userPrompt = `Candidate Profile:
- Validated Skills (with quiz scores): ${JSON.stringify(simulationInput.validated_skills)}
- Missing Skills: ${simulationInput.missing_skills.join(', ')}
- ATS Match Score: ${simulationInput.ats_score}%
- Quiz Performance: ${simulationInput.overall_quiz_percent}%
- Target Role: ${simulationInput.target_role}
- Experience Level: ${simulationInput.experience_level}

Generate exactly 3 career simulation paths:
1. ACCELERATED — aggressive upskilling, 6–12 months
2. STEADY — organic growth, 1–2 years
3. PIVOT — adjacent role leveraging existing strengths

Return ONLY this JSON:
{
  "simulations": [
    {
      "path": "accelerated | steady | pivot",
      "summary": "",
      "timeline": "",
      "milestones": ["", "", ""],
      "immediate_actions": ["", ""],
      "target_roles": ["", ""],
      "skills_to_acquire": ["", ""],
      "salary_range": {
        "india_lpa": "",
        "global_usd": ""
      },
      "interview_readiness_score": 0,
      "growth_trajectory": "high | medium | moderate"
    }
  ]
}`;

  return callGroq(systemPrompt, userPrompt);
}

// ─────────────────────────────────────────────────────────────────
// PROMPT 5 — Personalized Learning Roadmap
// ─────────────────────────────────────────────────────────────────
async function generateRoadmap(roadmapInput) {
  const systemPrompt = `You are SkillSync AI — a personalized learning architect. Build structured, actionable learning roadmaps based on validated skill gaps.
Be specific: real course names, real resources, real projects. No generic advice. No placeholder text.
Output ONLY valid JSON.`;

  const userPrompt = `Skill Gaps (must learn): ${roadmapInput.gap_skills.join(', ')}
Strong Skills (already validated): ${roadmapInput.strong_skills.join(', ')}
Target Role: ${roadmapInput.target_role}
Hours Available Per Week: ${roadmapInput.hours_per_week || 10}
Target Completion Date: ${roadmapInput.target_date || '3 months from now'}

Rules:
- Prioritize skills by career ROI (highest-impact skills first)
- Each week has a focus skill, daily tasks, and a checkpoint project
- Resources must be real: course name + platform + URL if known
- Checkpoint projects must be deployable mini-projects
- Limit to 8 weeks maximum

Return ONLY this JSON:
{
  "roadmap_id": "${roadmapInput.hash}",
  "target_role": "${roadmapInput.target_role}",
  "total_weeks": 0,
  "weekly_hours": ${roadmapInput.hours_per_week || 10},
  "weeks": [
    {
      "week": 1,
      "focus_skill": "",
      "goal": "",
      "daily_tasks": ["Mon: ...", "Tue: ...", "Wed: ...", "Thu: ...", "Fri: ..."],
      "resources": [
        { "name": "", "platform": "", "url": "", "type": "course | doc | video | practice" }
      ],
      "checkpoint_project": {
        "name": "",
        "description": "",
        "tech_used": []
      }
    }
  ]
}`;

  return callGroq(systemPrompt, userPrompt);
}

// ─────────────────────────────────────────────────────────────────
// NEW — AI Mock Interview Start (Greeting & first question)
// ─────────────────────────────────────────────────────────────────
async function startInterview(targetRole, experienceLevel, skills) {
  const systemPrompt = `You are SkillSync AI — an expert technical interviewer at a tier-1 tech company.
Conduct a professional technical interview.
You will start by greeting the candidate, introducing yourself, and posing a first specific technical question relating to the target role and their skills.
Output ONLY a JSON object containing the fields below. Do not wrap in markdown or backticks.`;

  const userPrompt = `Target Role: ${targetRole}
Experience Level: ${experienceLevel}
Candidate Skills: ${skills.join(', ')}

Return ONLY this JSON:
{
  "message": "The interviewer's greeting and first question",
  "history": [
    { "role": "assistant", "content": "The interviewer's greeting and first question" }
  ]
}`;

  const response = await callGroq(systemPrompt, userPrompt);
  if (!response) {
    throw new Error('AI service returned an empty response');
  }
  const sanitized = {
    message: response.message || response.response || response.content || response.text || "Welcome to your technical interview. Let's start with a question about your skills.",
    history: Array.isArray(response.history) ? response.history : []
  };
  if (sanitized.history.length === 0) {
    sanitized.history = [
      { role: 'assistant', content: sanitized.message }
    ];
  }
  return sanitized;
}

// ─────────────────────────────────────────────────────────────────
// NEW — AI Mock Interview Chat (Continue conversation)
// ─────────────────────────────────────────────────────────────────
async function chatInterview(history, userMessage, targetRole, experienceLevel) {
  const systemPrompt = `You are SkillSync AI — an expert technical interviewer.
Continue the technical interview. Analyze the candidate's last answer, give a brief implicit feedback if needed, and ask the next technical question.
Keep the conversation professional, challenging, and focused.
If the history has more than 8 messages, you can conclude the interview.
Output ONLY a JSON object containing the fields below. Do not wrap in markdown or backticks.`;

  const userPrompt = `Target Role: ${targetRole}
Experience Level: ${experienceLevel}
User Message: "${userMessage}"
Conversation History so far: ${JSON.stringify(history)}

Return ONLY this JSON:
{
  "message": "The interviewer's response and next question (or conclusion)",
  "history": [
    ...previousHistoryPlusNewExchange
  ],
  "concluded": true | false
}`;

  // Build the message history structure for the AI
  const formattedHistory = [
    ...history,
    { role: 'user', content: userMessage }
  ];

  // System instructions instruct model on returning next message + history update
  const systemPromptParsed = `${systemPrompt}\n\nUpdate the history array to include the user's latest response and your new response.`;

  const response = await callGroq(systemPromptParsed, JSON.stringify({
    targetRole,
    experienceLevel,
    history: formattedHistory
  }));

  if (!response) {
    throw new Error('AI service returned an empty response');
  }

  const sanitized = {
    message: response.message || response.response || response.content || response.text || "Let's proceed with the interview.",
    history: Array.isArray(response.history) ? response.history : [],
    concluded: response.concluded !== undefined ? !!response.concluded : false
  };

  if (sanitized.history.length === 0) {
    sanitized.history = [
      ...formattedHistory,
      { role: 'assistant', content: sanitized.message }
    ];
  }
  return sanitized;
}

// ─────────────────────────────────────────────────────────────────
// NEW — AI Mock Interview Final Scorecard
// ─────────────────────────────────────────────────────────────────
async function evaluateInterview(history, targetRole) {
  const systemPrompt = `You are SkillSync AI — a senior technical evaluator.
Review the complete technical interview chat history and produce a detailed scorecard.
Be constructive, honest, and precise.
Output ONLY a JSON object containing the fields below. Do not wrap in markdown or backticks.`;

  const userPrompt = `Target Role: ${targetRole}
Interview History: ${JSON.stringify(history)}

Return ONLY this JSON:
{
  "overall_score": 0,
  "technical_depth_score": 0,
  "communication_score": 0,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "feedback_summary": "Overall constructive review of the candidate's performance."
}`;

  const response = await callGroq(systemPrompt, userPrompt);
  if (!response) {
    throw new Error('AI service returned an empty scorecard response');
  }

  return {
    overall_score: response.overall_score !== undefined ? Number(response.overall_score) : 70,
    technical_depth_score: response.technical_depth_score !== undefined ? Number(response.technical_depth_score) : 70,
    communication_score: response.communication_score !== undefined ? Number(response.communication_score) : 70,
    strengths: Array.isArray(response.strengths) ? response.strengths : [],
    improvements: Array.isArray(response.improvements) ? response.improvements : [],
    feedback_summary: response.feedback_summary || response.feedback || "Thank you for completing the interview."
  };
}

// ─────────────────────────────────────────────────────────────────
// NEW — AI Resume Optimizer (Suggestions)
// ─────────────────────────────────────────────────────────────────
async function generateOptimizeSuggestions(targetRole, missingSkills, currentResumeData) {
  const systemPrompt = `You are SkillSync AI — a professional resume writer and ATS optimization expert.
Analyze the target role and missing skills vs. the candidate's current profile, and generate concrete, high-impact resume bullet points that incorporate the missing skills.
Ensure the bullet points are tailored, use active verbs, and show impact.
Output ONLY a JSON object containing the fields below. Do not wrap in markdown or backticks.`;

  const userPrompt = `Target Role: ${targetRole}
Missing Skills to target: ${missingSkills.join(', ')}
Current Profile: ${JSON.stringify(currentResumeData)}

Return ONLY this JSON:
{
  "suggestions": [
    {
      "skill": "React",
      "original_bullet_suggestion": "Built features using JavaScript",
      "optimized_bullet_suggestion": "Designed and deployed dynamic, responsive UI components using React.js, improving load times by 25% and modularizing core product features",
      "impact_metric": "25% load time improvement"
    }
  ]
}`;

  return callGroq(systemPrompt, userPrompt);
}

// ─────────────────────────────────────────────────────────────────
// NEW — AI Course Recommender System
// ─────────────────────────────────────────────────────────────────
async function generateCourseRecommendations(targetRole, missingSkills, weakSkills) {
  const systemPrompt = `You are SkillSync AI — a career upskilling strategist.
Analyze the target role, missing skills, and weak skills (where the user scored poorly on the technical quiz), and generate a list of highly targeted online course recommendations.
For each recommended course, suggest a title, platform (e.g. Udemy, Coursera, YouTube, edX, MDN), estimated duration, appropriate difficulty level (Beginner, Intermediate, Advanced), a brief value-add description, and a realistic placeholder URL or real documentation link.
Categorize each course with the skill it addresses, and mark the reason as "missing" or "weak".
Output ONLY a JSON object. Do not wrap in markdown fences or backticks.`;

  const userPrompt = `Target Role: ${targetRole}
Missing Skills (from gap analysis): ${missingSkills.join(', ') || 'None'}
Weak Skills (scored low in quiz): ${weakSkills.join(', ') || 'None'}

Return ONLY this JSON structure:
{
  "recommendations": [
    {
      "skill": "TypeScript",
      "reason": "missing | weak",
      "course_title": "TypeScript Complete Guide",
      "platform": "Udemy",
      "url": "https://www.udemy.com/topic/typescript/",
      "duration": "15 hours",
      "level": "Beginner to Intermediate",
      "description": "Master TypeScript, including compiler options, interfaces, classes, and how to use it with React."
    }
  ]
}`;

  return callGroq(systemPrompt, userPrompt);
}

module.exports = {
  extractSkillsFromResume,
  generateQuiz,
  simulateCareer,
  generateRoadmap,
  startInterview,
  chatInterview,
  evaluateInterview,
  generateOptimizeSuggestions,
  generateCourseRecommendations
};

