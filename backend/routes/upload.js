const { parsePDF, cleanResumeText } = require('../services/pdfParser');
const { extractSkillsFromResume } = require('../services/aiService');
const { createSession } = require('../services/dbHelper');
const { v4: uuidv4 } = require('uuid');

/**
 * Handle POST /api/upload
 * Step 1: Parse PDF + Extract skills. Does NOT require a target role.
 * Role selection happens after AI recommendations are shown.
 */
async function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded. Please select a PDF file.' });
    }

    console.log(`[upload] File: ${req.file.originalname} | Size: ${req.file.size} bytes | MIME: ${req.file.mimetype}`);

    // Step 1: Parse PDF → raw text
    const fileBuffer = Buffer.isBuffer(req.file.buffer)
      ? req.file.buffer
      : Buffer.from(req.file.buffer);

    const rawText = await parsePDF(fileBuffer);
    const cleanText = cleanResumeText(rawText);

    // Step 2: AI — Extract structured skills from resume
    const resumeData = await extractSkillsFromResume(cleanText);

    // Generate session ID and save session (no role yet)
    const sessionId = uuidv4();

    await createSession(sessionId, {
      resume_data: resumeData,
      target_role: null,
      selected_role: null,
      recommended_roles: null,
      gap_analysis: null,
    });

    res.json({
      success: true,
      session_id: sessionId,
      resume: resumeData,
    });

  } catch (err) {
    console.error('[upload] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to process resume' });
  }
}

module.exports = { handleUpload };
