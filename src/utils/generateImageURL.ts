import axios from "axios";
import supportService from "./supportService";

export interface ImageUploadResponse {
  url: string;
}

const generateImageURL = async (
  image?: File | Blob | null,
  folder: string = "uploads"
): Promise<ImageUploadResponse> => {
  if (!image) return { url: "" };

  // Convert Blob to File if needed so Cloudinary & ImgBB receive a valid File
  const fileToUpload: File =
    image instanceof File
      ? image
      : new File([image], `upload_${Date.now()}.jpg`, {
          type: image.type || "image/jpeg",
        });

  // 1. Primary Attempt: Cloudinary CDN via supportService
  try {
    const uploaded = await supportService.uploadFileToCloudinary(fileToUpload, folder);
    const cdnUrl = uploaded?.secure_url || uploaded?.url;
    if (cdnUrl) {
      return { url: cdnUrl };
    }
  } catch (cloudErr) {
    console.warn("Cloudinary upload failed in generateImageURL, attempting ImgBB fallback:", cloudErr);
  }

  // 2. Secondary Fallback Attempt: ImgBB
  try {
    const formData = new FormData();
    formData.append("image", fileToUpload);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY || "6857715a54c637cd1d21c558202e7c9c";

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData
    );
    const fallbackUrl = response.data?.data?.url || "";
    if (fallbackUrl) {
      return { url: fallbackUrl };
    }
  } catch (error) {
    console.warn("ImgBB image upload fallback failed, proceeding without image:", error);
  }

  return { url: "" };
};

export default generateImageURL;

