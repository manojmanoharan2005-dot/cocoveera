import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.startsWith('mock_');

if (!isMock) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadToCloudinary = async (fileBuffer, folderName) => {
  if (isMock) {
    console.log(`[Cloudinary Mock] Simulating file upload to folder: ${folderName}`);
    return {
      secure_url: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=800&q=80',
      public_id: 'mock_public_id_' + Date.now(),
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
