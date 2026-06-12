const pdfParse = require('pdf-parse');

/**
 * Parse a PDF buffer and extract raw text.
 * Uses pdf-parse v1.1.1: pdfParse(buffer) → { text, numpages, info }
 */
async function parsePDF(buffer) {
  let data;

  // Ensure we have a proper Buffer
  if (!Buffer.isBuffer(buffer)) {
    buffer = Buffer.from(buffer);
  }

  try {
    data = await pdfParse(buffer, {
      // Do not run test files
      max: 0,
    });
  } catch (err) {
    console.error('[pdfParser] pdfParse() threw:', err.message);
    throw new Error(
      'Failed to read the PDF file. It may be corrupted, password-protected, or not a valid PDF.'
    );
  }

  const text = (data.text || '').trim();

  console.log(`[pdfParser] Extracted ${text.length} chars from ${data.numpages} page(s)`);

  // Very lenient check — even a 1-page resume with minimal text is OK
  if (text.length < 20) {
    throw new Error(
      'The PDF appears to be empty or image-only (scanned). ' +
      'Please use a digitally-created PDF resume (exported from Word, Google Docs, etc.).'
    );
  }

  return text;
}

/**
 * Clean raw resume text — remove excess whitespace, page numbers, headers/footers
 */
function cleanResumeText(raw) {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')        // max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, ' ')        // collapse multiple spaces/tabs
    .replace(/^\s+|\s+$/gm, '')        // trim each line
    .replace(/Page \d+ of \d+/gi, '')  // remove "Page 1 of 3" markers
    .replace(/^\d+\s*$/gm, '')         // remove lone page numbers
    .trim();
}

module.exports = { parsePDF, cleanResumeText };
