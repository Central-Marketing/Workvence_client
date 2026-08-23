import axiosFetch from "./axiosFetch";
import axios from "axios";

export interface KycRecord {
  id?: string;
  userId?: string;
  legalFullName?: string;
  dateOfBirth?: string;
  country?: string;
  documentType?: "passport" | "nid" | "driving_license" | string;
  documentNumber?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string | null;
  selfieUrl?: string;
  selfieWithNoteUrl?: string | null;
  status?: "pending" | "approved" | "rejected" | string;
  rejectionReason?: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface KycStatusResponse {
  error: boolean;
  message?: string;
  isKycVerified: boolean;
  kyc: KycRecord | null;
}

export interface CloudinarySignatureData {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  type: string;
}

export interface KycSubmitPayload {
  legalFullName: string;
  dateOfBirth: string;
  country: string;
  documentType: "passport" | "nid" | "driving_license" | string;
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl?: string | null;
  selfieUrl: string;
  selfieWithNoteUrl?: string | null;
}

export const kycService = {
  // Step 1: Check KYC status
  getKycStatus: async (): Promise<KycStatusResponse> => {
    const { data } = await axiosFetch.get("/kyc/status");
    return data;
  },

  // Step 3.1: Request direct Cloudinary authenticated upload signature
  getCloudinarySignature: async (
    folder: string = "kyc_documents",
    type: string = "authenticated"
  ): Promise<CloudinarySignatureData> => {
    const { data } = await axiosFetch.post("/storage/cloudinary-signature", {
      folder,
      type,
    });
    return data?.data || data;
  },

  // Step 3.2: Direct upload to Cloudinary authenticated storage
  uploadToCloudinary: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ public_id: string; secure_url: string }> => {
    const sigData = await kycService.getCloudinarySignature("kyc_documents", "authenticated");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sigData.apiKey);
    formData.append("timestamp", String(sigData.timestamp));
    formData.append("signature", sigData.signature);
    formData.append("folder", sigData.folder || "kyc_documents");
    formData.append("type", sigData.type || "authenticated");

    const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;

    const response = await axios.post(uploadUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return {
      public_id: response.data.public_id,
      secure_url: response.data.secure_url || response.data.url,
    };
  },

  // Step 4 & 5: Submit or Re-Submit KYC verification payload
  submitKyc: async (payload: KycSubmitPayload): Promise<{ error: boolean; message: string; kyc: KycRecord }> => {
    const { data } = await axiosFetch.post("/kyc/submit", payload);
    return data;
  },
};

export default kycService;
