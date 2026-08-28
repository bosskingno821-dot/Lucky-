// uploadToCloud.js
// Ye file processed clips ko Cloudinary (free cloud storage) pe upload karti hai
// taaki user unhe download/preview kar sake

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Local video file ko Cloudinary pe upload karta hai
 * @param {string} filePath - local file path
 * @returns {string} public URL jahan se clip dekh/download kar sakte hain
 */
export async function uploadClip(filePath) {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "clipcraft-clips",
  });
  return result.secure_url;
}
