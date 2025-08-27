import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const uploadToCloudinary = async (file) => {
  try {
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "social-media-posts",
      resource_type: "image",
      transformation: [
        { width: 800, height: 600, crop: "limit" }, // max 800x600
        { quality: "auto" }, // auto compress
        { fetch_format: "auto" }, // auto webp/jpg/png (better than format)
      ],
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to upload on Cloudinary:", error);
    throw error;
  }
};
