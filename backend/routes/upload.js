const { parsePDF, cleanResumeText } = require('../services/pdfParser');
const { extractSkillsFromResume } = require('../services/aiService');
const { analyzeSkillGap } = require('../services/skillMatcher');
const { compressForAI } = require('../services/tokenCompressor');
const { createSession } = require('../services/dbHelper');
const { v4: uuidv4 } = require('uuid');

/**
 * Handle POST /api/upload
 */
async function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded. Please select a PDF file.' });
    }

    console.log(`[upload] File: ${req.file.originalname} | Size: ${req.file.size} bytes | MIME: ${req.file.mimetype}`);

    const targetRole = req.body.target_role;
    const validRoles = ['Frontend Developer', 'AI Engineer', 'Data Analyst', 'Cloud Engineer'];
    if (!targetRole || !validRoles.includes(targetRole)) {
      return res.status(400).json({ error: 'Invalid target role. Choose from: ' + validRoles.join(', ') });
    }

    // Step 1: Parse PDF → raw text
    const fileBuffer = Buffer.isBuffer(req.file.buffer)
      ? req.file.buffer
      : Buffer.from(req.file.buffer);

    const rawText = await parsePDF(fileBuffer);
    const cleanText = cleanResumeText(rawText);

    // Step 2: AI Prompt 1 — Extract structured skills from resume
    const resumeData = await extractSkillsFromResume(cleanText);

    // Collect all skills for matching
    const allUserSkills = [
      ...(resumeData.technical_skills || []),
      ...(resumeData.tools_and_frameworks || []),
    ];

    // Step 3: Local skill gap analysis — zero tokens
    const gapAnalysis = analyzeSkillGap(allUserSkills, targetRole);

    // Step 4: Compress for future AI calls
    const compressed = compressForAI(resumeData, targetRole);

    // Generate session ID
    const sessionId = uuidv4();

    // Save session (MongoDB or in-memory fallback)
    await createSession(sessionId, {
      resume_data: resumeData,
      target_role: targetRole,
      gap_analysis: gapAnalysis,
    });

    res.json({
      success: true,
      session_id: sessionId,
      resume: resumeData,
      gap_analysis: gapAnalysis,
      compressed_profile: compressed,
    });

  } catch (err) {
    console.error('[upload] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to process resume' });
  }
}

module.exports = { handleUpload };
