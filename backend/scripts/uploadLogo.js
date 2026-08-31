import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async () => {
  try {
    const res = await cloudinary.uploader.upload(path.resolve(__dirname, '../../frontend/public/logo.webp'), {
      folder: 'cocoveera_assets',
      public_id: 'logo',
      format: 'png' // Convert to PNG for better email compatibility!
    });
    console.log("Uploaded URL:", res.secure_url);
  } catch(err) {
    console.error(err);
  }
}
uploadImage();
