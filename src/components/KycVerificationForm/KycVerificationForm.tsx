"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  FileText, 
  User, 
  Calendar, 
  Globe, 
  CreditCard, 
  Camera, 
  RefreshCw, 
  Check, 
  ChevronRight, 
  Info,
  ExternalLink,
  Lock,
  Eye,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import kycService, { KycRecord, KycSubmitPayload } from "@/utils/kycService";
import countriesFlags from "@/utils/countriesFlags";
import { Loader } from "@/components";

interface KycVerificationFormProps {
  initialKycData?: KycRecord | null;
  onSuccess?: () => void;
  isCompact?: boolean;
}

const DOCUMENT_TYPES = [
  { id: "passport", label: "Passport", desc: "Government issued international passport", needBack: false },
  { id: "nid", label: "National ID (NID)", desc: "National identity or citizen card", needBack: true },
  { id: "driving_license", label: "Driver's License", desc: "Official driver's permit / license", needBack: true },
];

export const KycVerificationForm: React.FC<KycVerificationFormProps> = ({
  onSuccess,
  isCompact = false,
}) => {
  const queryClient = useQueryClient();

  // Fetch status
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: () => kycService.getKycStatus(),
    staleTime: 30000,
  });

  const kyc = statusData?.kyc;
  const isKycVerified = statusData?.isKycVerified || kyc?.status === "approved";

  // Form State
  const [legalFullName, setLegalFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [documentType, setDocumentType] = useState<"passport" | "nid" | "driving_license">("passport");
  const [documentNumber, setDocumentNumber] = useState("");

  // Photos State (Public IDs or URLs)
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>("");
  const [frontUrl, setFrontUrl] = useState<string>("");
  const [frontUploading, setFrontUploading] = useState(false);
  const [frontProgress, setFrontProgress] = useState(0);

  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string>("");
  const [backUrl, setBackUrl] = useState<string>("");
  const [backUploading, setBackUploading] = useState(false);
  const [backProgress, setBackProgress] = useState(0);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string>("");
  const [selfieUrl, setSelfieUrl] = useState<string>("");
  const [selfieUploading, setSelfieUploading] = useState(false);
  const [selfieProgress, setSelfieProgress] = useState(0);

  const [selfieWithNoteFile, setSelfieWithNoteFile] = useState<File | null>(null);
  const [selfieWithNotePreview, setSelfieWithNotePreview] = useState<string>("");
  const [selfieWithNoteUrl, setSelfieWithNoteUrl] = useState<string>("");
  const [noteUploading, setNoteUploading] = useState(false);
  const [noteProgress, setNoteProgress] = useState(0);

  const [isReSubmitting, setIsReSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Pre-fill values if available from previous submission or rejection
  useEffect(() => {
    if (kyc) {
      if (kyc.legalFullName) setLegalFullName(kyc.legalFullName);
      if (kyc.dateOfBirth) {
        // Format to YYYY-MM-DD
        const formatted = moment(kyc.dateOfBirth).format("YYYY-MM-DD");
        setDateOfBirth(formatted);
      }
      if (kyc.country) setCountry(kyc.country);
      if (kyc.documentType && ["passport", "nid", "driving_license"].includes(kyc.documentType)) {
        setDocumentType(kyc.documentType as any);
      }
      if (kyc.documentNumber) setDocumentNumber(kyc.documentNumber);
      if (kyc.documentFrontUrl) setFrontUrl(kyc.documentFrontUrl);
      if (kyc.documentBackUrl) setBackUrl(kyc.documentBackUrl);
      if (kyc.selfieUrl) setSelfieUrl(kyc.selfieUrl);
      if (kyc.selfieWithNoteUrl) setSelfieWithNoteUrl(kyc.selfieWithNoteUrl);
    }
  }, [kyc]);

  // Upload handler wrapper
  const handleUploadFile = async (
    file: File,
    type: "front" | "back" | "selfie" | "note"
  ) => {
    if (!file) return;

    try {
      if (type === "front") {
        setFrontUploading(true);
        setFrontProgress(10);
        const res = await kycService.uploadToCloudinary(file, (p) => setFrontProgress(p));
        setFrontUrl(res.public_id || res.secure_url);
        setFrontUploading(false);
        toast.success("ID Front uploaded securely");
      } else if (type === "back") {
        setBackUploading(true);
        setBackProgress(10);
        const res = await kycService.uploadToCloudinary(file, (p) => setBackProgress(p));
        setBackUrl(res.public_id || res.secure_url);
        setBackUploading(false);
        toast.success("ID Back uploaded securely");
      } else if (type === "selfie") {
        setSelfieUploading(true);
        setSelfieProgress(10);
        const res = await kycService.uploadToCloudinary(file, (p) => setSelfieProgress(p));
        setSelfieUrl(res.public_id || res.secure_url);
        setSelfieUploading(false);
        toast.success("Selfie uploaded securely");
      } else if (type === "note") {
        setNoteUploading(true);
        setNoteProgress(10);
        const res = await kycService.uploadToCloudinary(file, (p) => setNoteProgress(p));
        setSelfieWithNoteUrl(res.public_id || res.secure_url);
        setNoteUploading(false);
        toast.success("Note selfie uploaded securely");
      }
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      toast.error(err?.response?.data?.message || "Failed to upload document. Please try again.");
      if (type === "front") setFrontUploading(false);
      if (type === "back") setBackUploading(false);
      if (type === "selfie") setSelfieUploading(false);
      if (type === "note") setNoteUploading(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: (payload: KycSubmitPayload) => kycService.submitKyc(payload),
    onSuccess: (data) => {
      toast.success(data.message || "KYC submitted successfully!");
      setIsReSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ["kyc-status"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit KYC. Please check your inputs.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!legalFullName.trim()) {
      toast.error("Please provide your full legal name as it appears on your ID.");
      setActiveStep(1);
      return;
    }
    if (!dateOfBirth) {
      toast.error("Please select your date of birth.");
      setActiveStep(1);
      return;
    }
    if (!country) {
      toast.error("Please select the issuing country of your document.");
      setActiveStep(1);
      return;
    }
    if (!documentNumber.trim()) {
      toast.error("Please enter your government ID or document number.");
      setActiveStep(2);
      return;
    }
    if (!frontUrl) {
      toast.error("Please upload the front photo of your ID.");
      setActiveStep(3);
      return;
    }
    if (documentType !== "passport" && !backUrl) {
      toast.error("Please upload the back photo of your ID.");
      setActiveStep(3);
      return;
    }
    if (!selfieUrl) {
      toast.error("Please upload a clear selfie photo for facial verification.");
      setActiveStep(3);
      return;
    }

    const payload: KycSubmitPayload = {
      legalFullName: legalFullName.trim(),
      dateOfBirth,
      country,
      documentType,
      documentNumber: documentNumber.trim(),
      documentFrontUrl: frontUrl,
      documentBackUrl: documentType !== "passport" ? backUrl : null,
      selfieUrl: selfieUrl,
      selfieWithNoteUrl: selfieWithNoteUrl || null,
    };

    submitMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 min-h-[350px]">
        <Loader size={40} />
        <p className="mt-4 text-sm font-medium text-gray-500">Checking verification status...</p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // STATE D: APPROVED
  // ══════════════════════════════════════════════════════════
  if (isKycVerified && !isReSubmitting) {
    const docTypeLabel = DOCUMENT_TYPES.find((d) => d.id === kyc?.documentType)?.label || "ID Document";
    const lastDigits = kyc?.documentNumber ? kyc.documentNumber.slice(-4) : "••••";
    const verifiedDate = kyc?.reviewedAt || kyc?.updatedAt || kyc?.createdAt;

    return (
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
              <ShieldCheck size={32} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">Identity Verified</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Active 🛡️
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {verifiedDate ? `Verified on ${moment(verifiedDate).format("MMMM D, YYYY")}` : "Identity verified by Workvence Compliance"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Legal Name</span>
            <span className="text-base font-semibold text-gray-900 mt-1 block">{kyc?.legalFullName || "Verified Seller"}</span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Verified Document</span>
            <span className="text-base font-semibold text-gray-900 mt-1 block">
              {docTypeLabel} •••• {lastDigits}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">Issuing Country</span>
            <span className="text-base font-semibold text-gray-900 mt-1 block">{kyc?.country || "International"}</span>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Full Seller Privileges Active</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Your account has full seller privileges with instant payout access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // STATE B: UNDER REVIEW (PENDING)
  // ══════════════════════════════════════════════════════════
  if (kyc?.status === "pending" && !isReSubmitting) {
    const submittedDate = kyc?.createdAt ? moment(kyc.createdAt).format("MMM D, YYYY [at] h:mm A") : "Recently";

    return (
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4 pb-6 border-b border-amber-50">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={30} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">Verification In Progress</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Pending Review
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Our compliance team is currently reviewing your submitted identity documents.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="my-8 max-w-xl mx-auto">
          <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {/* Step 1 */}
            <div className="relative flex items-start group">
              <div className="absolute -left-8 top-0 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-xs">
                <Check size={14} strokeWidth={3} />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full">
                <p className="text-sm font-bold text-gray-900">Step 1: Documents Submitted</p>
                <p className="text-xs text-gray-500 mt-0.5">Submitted on {submittedDate}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start group">
              <div className="absolute -left-8 top-0 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-xs animate-pulse">
                ⏳
              </div>
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 w-full">
                <p className="text-sm font-bold text-amber-900">Step 2: In Review by Compliance Team</p>
                <p className="text-xs text-amber-700 mt-0.5">Typically reviewed within 24–48 hours</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start group opacity-60">
              <div className="absolute -left-8 top-0 w-7 h-7 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold ring-4 ring-white">
                3
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 w-full">
                <p className="text-sm font-semibold text-gray-700">Step 3: Verification Complete</p>
                <p className="text-xs text-gray-500 mt-0.5">Instant payout activation & verified badge</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50/70 border border-blue-200 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-blue-600 shrink-0" />
            <p className="text-xs sm:text-sm text-blue-900 font-medium">
              Submissions are locked during review to prevent duplication. You will receive an email once approved.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg bg-blue-100/80 hover:bg-blue-100 transition-colors"
          >
            <RefreshCw size={13} />
            Check Status
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // STATE C: REJECTED & STATE A: UNVERIFIED / FIRST-TIME / RE-SUBMIT
  // ══════════════════════════════════════════════════════════
  const isRejectedState = kyc?.status === "rejected";
  const countriesList = Object.keys(countriesFlags || {}).sort();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Banner for State C (Rejected) */}
      {isRejectedState && !isReSubmitting && (
        <div className="p-6 bg-red-50/90 border-b border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-2xs">
              <ShieldAlert size={26} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-red-900">Verification Unsuccessful</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-200 text-red-900">
                  Action Required
                </span>
              </div>
              <p className="text-sm font-medium text-red-800 mt-1">
                Reason from compliance team:
              </p>
              <div className="mt-2 p-3 bg-white/90 rounded-xl border border-red-200 text-sm text-red-950 font-mono">
                &ldquo;{kyc.rejectionReason || "ID photo was blurry or expiration date was unreadable. Please upload clearer photos."}&rdquo;
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsReSubmitting(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Update & Re-Submit Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form for State A (First Time) or Re-Submission Mode */}
      {(!isRejectedState || isReSubmitting) && (
        <div>
          {/* Header */}
          <div className="px-6 py-6 sm:px-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="text-brand-green" size={24} />
                Seller Identity Verification (KYC)
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Complete a one-time verification to unlock seller payouts and build client trust.
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 self-start sm:self-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${activeStep === 1 ? "bg-brand-green text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                1. Personal
              </button>
              <ChevronRight size={14} className="text-gray-300" />
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${activeStep === 2 ? "bg-brand-green text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                2. ID Type
              </button>
              <ChevronRight size={14} className="text-gray-300" />
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${activeStep === 3 ? "bg-brand-green text-white" : "text-gray-600 hover:bg-gray-100"}`}
              >
                3. Photos
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* STEP 1: Personal Details */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Step 1: Personal Details</h3>
                  <p className="text-xs text-gray-500">Enter your details exactly as they appear on your government document.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Legal Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={legalFullName}
                        onChange={(e) => setLegalFullName(e.target.value)}
                        placeholder="e.g. John Alex Doe"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-brand-green rounded-xl text-sm font-medium text-gray-900 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                        max={moment().subtract(18, "years").format("YYYY-MM-DD")}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-brand-green rounded-xl text-sm font-medium text-gray-900 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Must be at least 18 years old.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Country of Issuance <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-brand-green rounded-xl text-sm font-medium text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select country...</option>
                        {countriesList.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!legalFullName.trim() || !dateOfBirth || !country) {
                        toast.error("Please complete all personal details before proceeding.");
                        return;
                      }
                      setActiveStep(2);
                    }}
                    className="px-6 py-3 bg-brand-green hover:bg-[#389115] text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    Next: Select Document Type
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Document Selection */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Step 2: Document Type & Number</h3>
                  <p className="text-xs text-gray-500">Choose the government-issued photo ID you want to verify.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {DOCUMENT_TYPES.map((type) => {
                    const isSelected = documentType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setDocumentType(type.id as any)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand-green bg-emerald-50/40 shadow-sm ring-1 ring-brand-green"
                            : "border-gray-200 hover:border-gray-300 bg-gray-50/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <CreditCard className={isSelected ? "text-brand-green" : "text-gray-400"} size={24} />
                          {isSelected && <CheckCircle2 className="text-brand-green" size={20} />}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">{type.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    {documentType === "passport" ? "Passport Number" : documentType === "nid" ? "National ID Number" : "Driver's License Number"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="e.g. P987654321 or ID12345678"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 focus:border-brand-green rounded-xl text-sm font-medium text-gray-900 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!documentNumber.trim()) {
                        toast.error("Please enter your document number.");
                        return;
                      }
                      setActiveStep(3);
                    }}
                    className="px-6 py-3 bg-brand-green hover:bg-[#389115] text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    Next: Upload Photos
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Authenticated Document Uploads */}
            {activeStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold text-gray-900">Step 3: Document Photos & Selfie</h3>
                  <p className="text-xs text-gray-500">
                    Uploaded directly to encrypted storage. High quality, non-glare photos ensure swift approval.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Front */}
                  <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Front of {DOCUMENT_TYPES.find((d) => d.id === documentType)?.label} <span className="text-red-500">*</span>
                        </span>
                        {frontUrl && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check size={14} /> Ready</span>}
                      </div>
                      <p className="text-xs text-gray-500 mb-4">Clear photo of the front side with text and portrait clearly visible.</p>

                      {frontPreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 h-40 bg-black/5 flex items-center justify-center mb-3">
                          <img src={frontPreview} alt="Front Preview" className="h-full w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => {
                              setFrontFile(null);
                              setFrontPreview("");
                              setFrontUrl("");
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : frontUrl ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 mb-3">
                          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-emerald-900">Front ID Uploaded</p>
                            <p className="text-[11px] text-emerald-700 truncate font-mono">{frontUrl}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <input
                        type="file"
                        id="kyc-front"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFrontFile(file);
                            setFrontPreview(URL.createObjectURL(file));
                            handleUploadFile(file, "front");
                          }
                        }}
                      />
                      <label
                        htmlFor="kyc-front"
                        className={`w-full py-2.5 px-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
                          frontUploading
                            ? "bg-gray-100 border-gray-300 text-gray-400 pointer-events-none"
                            : frontUrl
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-gray-300 hover:border-brand-green bg-white hover:bg-emerald-50/20 text-gray-700 hover:text-brand-green"
                        }`}
                      >
                        {frontUploading ? (
                          <>
                            <RefreshCw size={15} className="animate-spin text-brand-green" />
                            Uploading to Secure Storage... {frontProgress}%
                          </>
                        ) : (
                          <>
                            <Upload size={15} />
                            {frontUrl ? "Change Front Photo" : "Upload Front Photo"}
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* ID Back (if applicable) */}
                  {documentType !== "passport" && (
                    <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                            Back of {DOCUMENT_TYPES.find((d) => d.id === documentType)?.label} <span className="text-red-500">*</span>
                          </span>
                          {backUrl && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check size={14} /> Ready</span>}
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Clear photo of the reverse side including barcode/magnetic strip.</p>

                        {backPreview ? (
                          <div className="relative rounded-xl overflow-hidden border border-gray-200 h-40 bg-black/5 flex items-center justify-center mb-3">
                            <img src={backPreview} alt="Back Preview" className="h-full w-full object-contain" />
                            <button
                              type="button"
                              onClick={() => {
                                setBackFile(null);
                                setBackPreview("");
                                setBackUrl("");
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : backUrl ? (
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 mb-3">
                            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-emerald-900">Back ID Uploaded</p>
                              <p className="text-[11px] text-emerald-700 truncate font-mono">{backUrl}</p>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <input
                          type="file"
                          id="kyc-back"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBackFile(file);
                              setBackPreview(URL.createObjectURL(file));
                              handleUploadFile(file, "back");
                            }
                          }}
                        />
                        <label
                          htmlFor="kyc-back"
                          className={`w-full py-2.5 px-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
                            backUploading
                              ? "bg-gray-100 border-gray-300 text-gray-400 pointer-events-none"
                              : backUrl
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-gray-300 hover:border-brand-green bg-white hover:bg-emerald-50/20 text-gray-700 hover:text-brand-green"
                          }`}
                        >
                          {backUploading ? (
                            <>
                              <RefreshCw size={15} className="animate-spin text-brand-green" />
                              Uploading to Secure Storage... {backProgress}%
                            </>
                          ) : (
                            <>
                              <Upload size={15} />
                              {backUrl ? "Change Back Photo" : "Upload Back Photo"}
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Selfie Photo */}
                  <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Selfie Photo <span className="text-red-500">*</span>
                        </span>
                        {selfieUrl && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check size={14} /> Ready</span>}
                      </div>
                      <p className="text-xs text-gray-500 mb-4">A direct headshot of your face in good lighting (no hats or sunglasses).</p>

                      {selfiePreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 h-40 bg-black/5 flex items-center justify-center mb-3">
                          <img src={selfiePreview} alt="Selfie Preview" className="h-full w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => {
                              setSelfieFile(null);
                              setSelfiePreview("");
                              setSelfieUrl("");
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : selfieUrl ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 mb-3">
                          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-emerald-900">Selfie Uploaded</p>
                            <p className="text-[11px] text-emerald-700 truncate font-mono">{selfieUrl}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <input
                        type="file"
                        id="kyc-selfie"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelfieFile(file);
                            setSelfiePreview(URL.createObjectURL(file));
                            handleUploadFile(file, "selfie");
                          }
                        }}
                      />
                      <label
                        htmlFor="kyc-selfie"
                        className={`w-full py-2.5 px-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
                          selfieUploading
                            ? "bg-gray-100 border-gray-300 text-gray-400 pointer-events-none"
                            : selfieUrl
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-gray-300 hover:border-brand-green bg-white hover:bg-emerald-50/20 text-gray-700 hover:text-brand-green"
                        }`}
                      >
                        {selfieUploading ? (
                          <>
                            <RefreshCw size={15} className="animate-spin text-brand-green" />
                            Uploading to Secure Storage... {selfieProgress}%
                          </>
                        ) : (
                          <>
                            <Camera size={15} />
                            {selfieUrl ? "Change Selfie Photo" : "Upload Selfie Photo"}
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Optional Selfie with Note */}
                  <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                          Selfie with Note <span className="text-gray-400 font-normal">(Optional)</span>
                        </span>
                        {selfieWithNoteUrl && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Check size={14} /> Ready</span>}
                      </div>
                      <p className="text-xs text-gray-500 mb-4">Holding a handwritten paper note stating &quot;Workvence&quot; with today&apos;s date.</p>

                      {selfieWithNotePreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 h-40 bg-black/5 flex items-center justify-center mb-3">
                          <img src={selfieWithNotePreview} alt="Note Preview" className="h-full w-full object-contain" />
                          <button
                            type="button"
                            onClick={() => {
                              setSelfieWithNoteFile(null);
                              setSelfieWithNotePreview("");
                              setSelfieWithNoteUrl("");
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : selfieWithNoteUrl ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 mb-3">
                          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-emerald-900">Note Selfie Uploaded</p>
                            <p className="text-[11px] text-emerald-700 truncate font-mono">{selfieWithNoteUrl}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <input
                        type="file"
                        id="kyc-note"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelfieWithNoteFile(file);
                            setSelfieWithNotePreview(URL.createObjectURL(file));
                            handleUploadFile(file, "note");
                          }
                        }}
                      />
                      <label
                        htmlFor="kyc-note"
                        className={`w-full py-2.5 px-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
                          noteUploading
                            ? "bg-gray-100 border-gray-300 text-gray-400 pointer-events-none"
                            : selfieWithNoteUrl
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-gray-300 hover:border-brand-green bg-white hover:bg-emerald-50/20 text-gray-700 hover:text-brand-green"
                        }`}
                      >
                        {noteUploading ? (
                          <>
                            <RefreshCw size={15} className="animate-spin text-brand-green" />
                            Uploading to Secure Storage... {noteProgress}%
                          </>
                        ) : (
                          <>
                            <Camera size={15} />
                            {selfieWithNoteUrl ? "Change Note Selfie" : "Upload Note Selfie"}
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending || frontUploading || backUploading || selfieUploading || noteUploading}
                    className="px-8 py-3.5 bg-brand-green hover:bg-[#389115] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <Check size={18} strokeWidth={2.5} />
                        Submit Verification
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default KycVerificationForm;
