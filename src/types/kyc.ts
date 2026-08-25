export interface KycRecord {
  id?: string;
  _id?: string;
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
