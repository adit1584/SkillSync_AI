const { parsePDF, cleanResumeText } = require('../services/pdfParser');
const { extractSkillsFromResume } = require('../services/aiService');
const { uploadResume } = require('../services/cloudinaryService');
const { verifyToken } = require('../middleware/authMiddleware');
const Resume = require('../models/Resume');
const { isDbConnected } = require('../services/dbHelper');

/**
 * Handle POST /api/upload
 * Step 1: Verify user identity via JWT token.
 * Step 2: Upload PDF to Cloudinary (or mock fallback).
 * Step 3: Parse PDF → raw text & clean.
 * Step 4: AI — Extract structured skills from resume.
 * Step 5: Save to Resume database model.
 */
async function handleUpload(req, res) {
  // Verify JWT token
  const userId = verifyToken(req, res);
  if (!userId) return; // Response already sent by verifyToken

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded. Please select a PDF file.' });
    }

    console.log(`[upload] File: ${req.file.originalname} | Size: ${req.file.size} bytes | User: ${userId}`);

    // Step 1: Upload to Cloudinary (or local mock fallback)
    const fileBuffer = Buffer.isBuffer(req.file.buffer)
      ? req.file.buffer
      : Buffer.from(req.file.buffer);
    
    const uploadResult = await uploadResume(fileBuffer, req.file.originalname);

    // Step 2: Parse PDF → raw text
    const rawText = await parsePDF(fileBuffer);
    const cleanText = cleanResumeText(rawText);

    // Step 3: AI — Extract structured skills from resume
    const resumeData = await extractSkillsFromResume(cleanText);

    // Step 4: Save to database/in-memory fallback
    const resumeFields = {
      user_id: userId,
      cloudinary_url: uploadResult.url,
      public_id: uploadResult.publicId,
      parsed_text: cleanText,
      extracted_skills: resumeData.technical_skills || [],
      extracted_projects: resumeData.projects || [],
      extracted_experience: resumeData.experience || [],
      extracted_education: resumeData.education || [],
      extracted_certifications: resumeData.certifications || []
    };

    let savedResume;
    if (isDbConnected()) {
      // Overwrite previous resume or create new
      savedResume = await Resume.findOneAndUpdate(
        { user_id: userId },
        { $set: resumeFields },
        { new: true, upsert: true }
      );
    } else {
      // Fallback: save in session storage cache
      const { createSession } = require('../services/dbHelper');
      await createSession(userId, {
        resume_data: resumeData,
        cloudinary_url: uploadResult.url,
        parsed_text: cleanText
      });
      savedResume = resumeFields;
    }

    res.json({
      success: true,
      session_id: userId,
      resume: {
        id: savedResume._id ? savedResume._id.toString() : 'mock_resume_id',
        cloudinaryUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        parsedContent: cleanText,
        extractedSkills: resumeData.technical_skills || [],
        extractedProjects: resumeData.projects || [],
        extractedExperience: resumeData.experience || [],
        extractedEducation: resumeData.education || [],
        extractedCertifications: resumeData.certifications || []
      }
    });

  } catch (err) {
    console.error('[upload] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to process resume' });
  }
}

module.exports = { handleUpload };
