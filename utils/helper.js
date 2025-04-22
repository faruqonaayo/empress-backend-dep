import { v2 as cloudinary } from "cloudinary";

export async function uploadImage(filePath, publicId) {
  try {
    // Configuration for cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload an image
    await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
    });

    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
    });

    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url(publicId, {
      crop: "auto",
      gravity: "auto",
      width: 500,
      height: 500,
    });
    return { optimizeUrl, autoCropUrl };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteImage(publicId) {
  try {
    // Configuration for cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Delete an image
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
  }
}