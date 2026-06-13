const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('[cloudinary] Service initialized with API credentials.');
} else {
  console.warn('[cloudinary] Credentials missing. Running in local fallback mode.');
}

/**
 * Uploads a buffer to Cloudinary (resource_type: raw for PDFs)
 * If not configured, returns local mock upload results.
 */
function uploadResume(fileBuffer, originalname) {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      // Simulate file upload and return local mock values
      const mockPublicId = `mock_resume_${Date.now()}`;
      const mockUrl = `https://res.cloudinary.com/demo/raw/upload/${mockPublicId}/${encodeURIComponent(originalname)}`;
      console.log('[cloudinary] Simulating file upload to Cloudinary. Mock URL:', mockUrl);
      return resolve({
        url: mockUrl,
        publicId: mockPublicId
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'skillsync_resumes',
        public_id: `${Date.now()}_${originalname.replace(/\.[^/.]+$/, "")}`
      },
      (error, result) => {
        if (error) {
          console.error('[cloudinary] Upload stream error:', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url || result.url,
          publicId: result.public_id
        });
      }
    );

    // Convert Buffer to stream and pipe to Cloudinary
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
}

module.exports = {
  uploadResume,
  isCloudinaryConfigured
};
