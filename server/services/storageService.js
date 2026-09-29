const cloudinary = require('cloudinary').v2;

const configured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadFile(file) {
  if (!configured) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.');
  }

  if (!file || !file.path) {
    throw new Error('No file attached for upload.');
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'sakamoto',
    resource_type: 'image',
  });

  return { url: result.secure_url, publicId: result.public_id };
}

module.exports = { uploadFile };
