import fs from 'fs';
import path from 'path';
import { uploadToCloudinary } from './config/cloudinary.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    const logoPath = path.resolve('../frontend/public/logo.jpg');
    if (!fs.existsSync(logoPath)) {
      console.error(`File not found: ${logoPath}`);
      return;
    }
    const buffer = fs.readFileSync(logoPath);
    console.log('Uploading logo.jpg to Cloudinary...');
    const result = await uploadToCloudinary(buffer, 'cocoveera/branding');
    console.log('Upload success! New URL:', result.secure_url);
    
    // Update .env file
    const envPath = path.resolve('.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace LOGO_URL
    const regex = /^LOGO_URL=.*$/m;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `LOGO_URL=${result.secure_url}`);
    } else {
      envContent += `\nLOGO_URL=${result.secure_url}`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log('.env file updated with new LOGO_URL!');
  } catch (error) {
    console.error('Error uploading logo:', error);
  }
};

run();
