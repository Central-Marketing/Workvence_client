"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  X,
  Eye,
  EyeOff,
  Briefcase,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Mail,
  Lock,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { Button } from "@/components/ui";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { useSocialAuth } from "@/hooks/useSocialAuth";

export type AuthModalMode = "login" | "register" | "forgot" | "reset" | "verify";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
  initialEmail?: string;
  defaultIsSeller?: boolean;
  onSuccess?: (user: any) => void;
  redirectUrl?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  initialEmail = "",
  defaultIsSeller = false,
  onSuccess,
  redirectUrl,
}) => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Social Auth
  const {
    loadingProvider,
    handleGoogleLogin,
    handleAppleLogin,
    renderGoogleButton,
  } = useSocialAuth();

  const loginGoogleBtnRef = useRef<HTMLDivElement>(null);
  const registerGoogleBtnRef = useRef<HTMLDivElement>(null);

  // Form States
  const [loginInput, setLoginInput] = useState({
    identifier: initialEmail,
    password: "",
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerInput, setRegisterInput] = useState({
    email: initialEmail,
    password: "",
    confirmPassword: "",
    isSeller: defaultIsSeller,
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState(initialEmail);

  // Reset Password State
  const [resetEmail, setResetEmail] = useState(initialEmail);
  const [resetOtp, setResetOtp] = useState(["", "", "", "", "", ""]);
  const [resetPasswords, setResetPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Email Verification State
  const [verifyEmail, setVerifyEmail] = useState(initialEmail);
  const [verifyOtp, setVerifyOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);

  // Sync state on modal open or prop change
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      if (initialEmail) {
        setLoginInput((prev) => ({ ...prev, identifier: initialEmail }));
        setRegisterInput((prev) => ({ ...prev, email: initialEmail }));
        setForgotEmail(initialEmail);
        setResetEmail(initialEmail);
        setVerifyEmail(initialEmail);
      }
      setRegisterInput((prev) => ({ ...prev, isSeller: defaultIsSeller }));
    }
  }, [isOpen, initialMode, initialEmail, defaultIsSeller]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Resend Countdown Timer for Verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && mode === "verify" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, mode, resendTimer]);

  // Social Auth Callback Helper
  const handleSocialSuccess = useCallback(
    (u: any) => {
      onSuccess?.(u);
      onClose();
      if (u?.isSeller && !u?.onboardingCompleted) {
        router.push("/seller/onboarding");
        return;
      }
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (u?.isSeller) {
        router.push("/dashboard/seller");
      }
    },
    [onSuccess, onClose, redirectUrl, router]
  );

  // Mount Google GIS Button for Login Mode
  useEffect(() => {
    if (isOpen && mode === "login" && loginGoogleBtnRef.current) {
      renderGoogleButton(loginGoogleBtnRef.current, {
        onSuccess: handleSocialSuccess,
        redirectUrl,
        isSeller: defaultIsSeller,
      });
    }
  }, [isOpen, mode, renderGoogleButton, handleSocialSuccess, redirectUrl, defaultIsSeller]);

  // Mount Google GIS Button for Register Mode
  useEffect(() => {
    if (isOpen && mode === "register" && registerGoogleBtnRef.current) {
      renderGoogleButton(registerGoogleBtnRef.current, {
        onSuccess: handleSocialSuccess,
        redirectUrl,
        isSeller: registerInput.isSeller,
      });
    }
  }, [isOpen, mode, renderGoogleButton, handleSocialSuccess, redirectUrl, registerInput.isSeller]);

  const onSocialAuthClick = (provider: "google" | "apple", isSellerChoice?: boolean) => {
    const options = {
      onSuccess: handleSocialSuccess,
      redirectUrl,
      isSeller: isSellerChoice ?? defaultIsSeller,
    };
    if (provider === "google") {
      handleGoogleLogin(options);
    } else {
      handleAppleLogin(options);
    }
  };

  // Helper to safely store authenticated session
  const saveAuthSession = (data: any) => {
    const user = data?.user || data;
    const userKey = user.id || user._id || user.username || "default";
    sessionStorage.removeItem(`kyc_prompt_dismissed_${userKey}`);
    sessionStorage.removeItem("kyc_prompt_dismissed_session");

    const token = data?.accessToken || data?.token || user?.token || user?.accessToken;
    const refreshToken = data?.refreshToken || user?.refreshToken;
    if (token) {
      document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
      try { localStorage.setItem("accessToken", token); } catch { }
      try { localStorage.setItem("token", token); } catch { }
    }
    if (refreshToken) {
      document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; max-age=2592000; SameSite=Lax`;
      try { localStorage.setItem("refreshToken", refreshToken); } catch { }
    }

    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  // 1. Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.identifier.trim() || !loginInput.password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      email: loginInput.identifier.trim(),
      password: loginInput.password,
    };

    try {
      const { data } = await axiosFetch.post("/auth/login", payload);
      const user = saveAuthSession(data);
      toast.success(`Welcome back, ${user.username || user.name || "User"}!`);

      if (onSuccess) {
        onSuccess(user);
      }
      onClose();

      if (user?.isSeller && !user?.onboardingCompleted) {
        router.push("/seller/onboarding");
        return;
      }

      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (user?.isSeller) {
        router.push("/dashboard/seller");
      }
    } catch (err: any) {
      const isVerified = err.response?.data?.isVerified;
      const unverifiedEmail = err.response?.data?.email || loginInput.identifier.trim();
      const msg = err.response?.data?.message || "Invalid email or password.";

      if (isVerified === false) {
        toast.error("Email verification required. Please verify your OTP.");
        sessionStorage.setItem("tempLoginPassword", loginInput.password);
        sessionStorage.setItem("tempLoginUsername", unverifiedEmail);
        setVerifyEmail(unverifiedEmail);
        setVerifyOtp(["", "", "", "", "", ""]);
        setResendTimer(60);
        setMode("verify");
        return;
      }

      setError(msg);
      const isLocked = msg?.toLowerCase().includes("account locked");
      toast.error(isLocked ? "Account locked" : msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Register Submit (No Username Required in UI)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, confirmPassword, isSeller } = registerInput;
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError(null);

    // Auto-derive clean, unique fallback username from email to satisfy NestJS DTO
    const emailPrefix = (trimmedEmail.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 15);
    const cleanPrefix = emailPrefix.length >= 3 ? emailPrefix : `user_${emailPrefix}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const derivedUsername = `${cleanPrefix}_${randomSuffix}`;

    try {
      const payload = {
        username: derivedUsername,
        email: trimmedEmail,
        password,
        isSeller,
      };

      await axiosFetch.post("/auth/register", payload);
      toast.success("Account created! Please enter the 6-digit code sent to your email.");

      sessionStorage.setItem("tempLoginUsername", trimmedEmail);
      sessionStorage.setItem("tempLoginPassword", password);

      setVerifyEmail(trimmedEmail);
      setVerifyOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      setMode("verify");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosFetch.post("/auth/forgot-password", { email: forgotEmail.trim() });
      toast.success("Password reset OTP sent to your email!");
      setResetEmail(forgotEmail.trim());
      setResetOtp(["", "", "", "", "", ""]);
      setMode("reset");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send reset link.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = resetOtp.join("");

    if (otpValue.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    if (!resetPasswords.newPassword || !resetPasswords.confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (resetPasswords.newPassword !== resetPasswords.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (resetPasswords.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosFetch.post("/auth/reset-password", {
        email: resetEmail.trim(),
        otp: otpValue,
        newPassword: resetPasswords.newPassword,
      });

      toast.success("Password reset successfully! Please sign in with your new password.");
      setLoginInput({
        identifier: resetEmail.trim(),
        password: "",
      });
      setMode("login");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to reset password.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle OTP Verification Submit
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = verifyOtp.join("");

    if (otpValue.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    if (!verifyEmail) {
      setError("Email address is missing. Please sign up or log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosFetch.post("/auth/verify-otp", {
        email: verifyEmail.trim(),
        otp: otpValue,
      });

      const loginUsername = verifyEmail.trim() || sessionStorage.getItem("tempLoginUsername");
      const loginPassword = sessionStorage.getItem("tempLoginPassword");

      // Auto-Login if temporary credentials exist
      if (loginPassword && loginUsername) {
        try {
          const { data } = await axiosFetch.post("/auth/login", {
            email: loginUsername,
            username: loginUsername,
            password: loginPassword,
          });

          const user = saveAuthSession(data);
          sessionStorage.removeItem("tempLoginUsername");
          sessionStorage.removeItem("tempLoginPassword");

          toast.success("Email verified! Welcome to Workvence.");
          if (onSuccess) {
            onSuccess(user);
          }
          onClose();

          if (user?.isSeller && !user?.onboardingCompleted) {
            router.push("/seller/onboarding");
            return;
          }

          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (user?.isSeller) {
            router.push("/dashboard/seller");
          }
          return;
        } catch {
          // If auto-login fails, switch cleanly to login mode
        }
      }

      toast.success("Email verified successfully! You can now sign in.");
      setLoginInput({
        identifier: verifyEmail.trim(),
        password: "",
      });
      setMode("login");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid or expired verification code.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Verification OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || !verifyEmail) return;
    try {
      await axiosFetch.post("/auth/resend-otp", { email: verifyEmail.trim() });
      setVerifyOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      toast.success("A new verification code has been sent to your email.");
      const firstInput = document.getElementById("auth-modal-verify-otp-0");
      if (firstInput) firstInput.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  // OTP Input Change Handlers
  const handleOtpInput = (
    index: number,
    value: string,
    state: string[],
    setState: (val: string[]) => void,
    prefix: string
  ) => {
    if (isNaN(Number(value))) return;
    const nextState = [...state];
    nextState[index] = value.substring(value.length - 1);
    setState(nextState);

    if (value && index < 5) {
      const nextInput = document.getElementById(`${prefix}-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    state: string[],
    prefix: string
  ) => {
    if (e.key === "Backspace" && !state[index] && index > 0) {
      const prevInput = document.getElementById(`${prefix}-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    setState: (val: string[]) => void,
    prefix: string
  ) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    const numbersOnly = pasted.replace(/\D/g, "").slice(0, 6);
    if (!numbersOnly) return;

    const nextState = ["", "", "", "", "", ""];
    for (let i = 0; i < numbersOnly.length; i++) {
      nextState[i] = numbersOnly[i];
    }
    setState(nextState);

    const targetIndex = Math.min(numbersOnly.length, 5);
    const targetInput = document.getElementById(`${prefix}-${targetIndex}`);
    if (targetInput) targetInput.focus();
  };

  if (!isOpen) return null;

  // Visual Pane Image & Taglines matched to auth pages
  const getVisualPaneConfig = () => {
    switch (mode) {
      case "register":
        return {
          image: "/images/auth/registerImage.png",
          tag: "Join Workvence",
          title: "Your creative journey starts here.",
          subtitle:
            "Join thousands of top freelancers and businesses collaborating with secure milestone payments.",
        };
      case "verify":
        return {
          image: "/images/auth/verifyImage.png",
          tag: "Account Security",
          title: "Confirm your email.",
          subtitle:
            "Email verification ensures trusted collaboration, dispute protection, and instant access to client briefs.",
        };
      case "forgot":
      case "reset":
        return {
          image: "/images/auth/loginImage.png",
          tag: "Account Recovery",
          title: "Seamless security recovery.",
          subtitle:
            "Safely regain access to your account, ongoing client orders, and project delivery workspaces.",
        };
      case "login":
      default:
        return {
          image: "/images/auth/loginImage.png",
          tag: "Welcome Back",
          title: "Build, scale & collaborate.",
          subtitle:
            "Access high-budget client projects, submit proposals, and scale your freelance career with secure milestones.",
        };
    }
  };

  const visualConfig = getVisualPaneConfig();

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-[900px] h-[640px] max-h-[92vh] bg-white rounded-[6px] sm:rounded-[6px] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          radius="full"
          className="absolute top-3.5 right-3.5 z-30 w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 border-none shadow-none cursor-pointer"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* ── LEFT PANE: Auth Page Imagery & Branded Backdrop (50% Split) ── */}
        <div className="hidden md:flex w-1/2 h-full shrink-0 relative overflow-hidden bg-[#0a0f1d] text-white flex-col justify-between px-6 sm:px-8 py-6">
          {/* Dynamic Image from /images/auth/ */}
          <Image
            key={visualConfig.image}
            src={visualConfig.image}
            alt="Workvence"
            fill
            priority
            className="object-cover transition-opacity duration-300"
            sizes="50vw"
          />

          {/* Dark Gradient Vignette for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

          {/* Top Spacing Container */}
          <div className="relative z-10" />

          {/* Bottom Statement / Testimonial Overlay with Crisp White Text */}
          <div className="relative z-10 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-sm">
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>{visualConfig.tag}</span>
            </div>

            <h3 className="text-xl lg:text-[22px] font-bold font-sf-pro leading-snug tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {visualConfig.title}
            </h3>

            <p className="text-xs text-white leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {visualConfig.subtitle}
            </p>

            <div className="pt-3 border-t border-white/20 text-[11px] text-white flex items-center justify-between drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              <span className="font-normal text-white">Trusted worldwide</span>
              <span className="font-semibold text-white">Workvence Secure</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANE: Auth Forms & State Machine (50% Split) ── */}
        <div className="w-full md:w-1/2 min-w-0 h-full px-6 sm:px-8 py-5 sm:py-6 flex flex-col overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="my-auto w-full flex flex-col justify-center py-2">
          {/* Mobile Brand Header */}
          <div className="flex md:hidden items-center justify-between mb-4">
            <Image
              src="/Workvence-logo-Horizontal3.png"
              alt="Workvence"
              width={120}
              height={28}
              className="h-6 w-auto object-contain"
            />
          </div>

          {/* Mode Switcher Tabs for Login & Register */}
          {mode === "login" || mode === "register" ? (
            <div className="flex items-center border-b border-gray-100 mb-3.5 gap-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`pb-2.5 text-sm sm:text-[15px] font-semibold transition-all relative cursor-pointer ${mode === "login"
                  ? "text-[#0D6D5F] border-b-2 border-[#0D6D5F]"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`pb-2.5 text-sm sm:text-[15px] font-semibold transition-all relative cursor-pointer ${mode === "register"
                  ? "text-[#0D6D5F] border-b-2 border-[#0D6D5F]"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Join Workvence
              </button>
            </div>
          ) : (
            /* Sub-mode Breadcrumb Back Navigation */
            <div className="mb-3.5">
              <button
                type="button"
                onClick={() => {
                  if (mode === "verify") {
                    setMode("register");
                  } else {
                    setMode("login");
                  }
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#0D6D5F] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          )}

          {/* Title & Subtitle for non-verify modes */}
          {mode !== "verify" && (
            <div className="mb-3">
              <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 font-sf-pro">
                {mode === "login" && "Sign in to your account"}
                {mode === "register" && "Create an account"}
                {mode === "forgot" && "Forgot your password?"}
                {mode === "reset" && "Reset your password"}
              </h2>
              <p className="text-xs sm:text-[13px] text-gray-500 mt-0.5">
                {mode === "login" && "Welcome back! Enter your credentials to continue."}
                {mode === "register" && "Join Workvence to discover client projects and submit proposals."}
                {mode === "forgot" && "Enter your email address and we'll send you a 6-digit reset code."}
                {mode === "reset" && `Enter the 6-digit code sent to ${resetEmail || "your email"} and a new password.`}
              </p>
            </div>
          )}

          {/* Inline Error Banner */}
          {error && (
            <div
              className="mb-3 p-2.5 rounded-[6px] bg-red-50 border border-red-200/80 text-red-600 text-xs sm:text-[13px] font-medium flex items-center gap-2 cursor-help"
              title={error}
            >
              <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                !
              </span>
              <span className="truncate" title={error}>
                {error.toLowerCase().includes("account locked") ? "Account locked" : error}
              </span>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              MODE 1: SIGN IN (LOGIN)
          ───────────────────────────────────────────────────────────── */}
          {mode === "login" && (
            <div className="flex flex-col w-full">
              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-2.5 w-full mb-3">
                <div className="relative">
                  <button
                    data-testid="modal-login-google-btn"
                    type="button"
                    onClick={() => onSocialAuthClick("google")}
                    disabled={loading || !!loadingProvider}
                    className="w-full h-10 px-2 border border-gray-200/90 rounded-[6px] bg-white hover:bg-gray-50/80 transition-colors flex items-center justify-center gap-2 text-xs font-medium text-[#1f2937] shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingProvider === "google" ? (
                      <span className="inline-block w-3.5 h-3.5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                    ) : (
                      <FcGoogle className="text-base shrink-0" />
                    )}
                    <span className="truncate">Google</span>
                  </button>
                  <div
                    ref={loginGoogleBtnRef}
                    className="absolute inset-0 overflow-hidden opacity-[0.0001] cursor-pointer pointer-events-auto [&>div]:!w-full [&>div]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!scale-150"
                  />
                </div>

                <button
                  data-testid="modal-login-apple-btn"
                  type="button"
                  onClick={() => onSocialAuthClick("apple")}
                  disabled={true}
                  className="w-full h-10 px-2 border border-gray-200/90 rounded-[6px] bg-white hover:bg-gray-50/80 transition-colors flex items-center justify-center gap-2 text-xs font-medium text-[#1f2937] shadow-2xs cursor-not-allowed opacity-60"
                  title="Apple Sign-In coming soon"
                >
                  <FaApple className="text-base text-black shrink-0" />
                  <span className="truncate">Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center w-full mb-4">
                <div className="w-full border-t border-gray-200/80" />
                <span className="absolute px-3 bg-white text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                  or with email
                </span>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5 w-full">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-[13px] font-medium text-gray-700">Email Address</label>
                  <input
                    data-testid="modal-login-email-input"
                    type="text"
                    placeholder="name@email.com"
                    value={loginInput.identifier}
                    onChange={(e) =>
                      setLoginInput((prev) => ({ ...prev, identifier: e.target.value }))
                    }
                    required
                    className="w-full h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-[13px] font-medium text-gray-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginInput.identifier);
                        setMode("forgot");
                        setError(null);
                      }}
                      className="text-xs text-gray-500 hover:text-[#0D6D5F] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      data-testid="modal-login-password-input"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={loginInput.password}
                      onChange={(e) =>
                        setLoginInput((prev) => ({ ...prev, password: e.target.value }))
                      }
                      required
                      className="w-full h-10 px-3.5 pr-10 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  data-testid="modal-login-submit-btn"
                  type="submit"
                  variant="dark"
                  size="md"
                  fullWidth
                  radius="fiverr"
                  disabled={loading}
                  isLoading={loading}
                  className="mt-2 bg-black hover:bg-gray-900 text-white font-medium shadow-sm transition-all"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign in
                </Button>

                <div className="mt-2 text-center text-xs text-gray-500">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="text-[#0D6D5F] font-semibold hover:underline cursor-pointer"
                  >
                    Join now
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              MODE 2: CREATE ACCOUNT (REGISTER - NO USERNAME INPUT!)
          ───────────────────────────────────────────────────────────── */}
          {mode === "register" && (
            <div className="flex flex-col w-full">
              {/* Role Toggle */}
              <div className="space-y-1 mb-2.5">
                <label className="text-xs font-semibold text-gray-700">I want to</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterInput((prev) => ({ ...prev, isSeller: true }))}
                    className={`flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 rounded-[6px] text-xs font-semibold border transition-all cursor-pointer ${registerInput.isSeller
                      ? "bg-[#0D6D5F]/10 border-[#0D6D5F] text-[#0D6D5F]"
                      : "bg-[#F8F9FA] border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Work as Freelancer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterInput((prev) => ({ ...prev, isSeller: false }))}
                    className={`flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 rounded-[6px] text-xs font-semibold border transition-all cursor-pointer ${!registerInput.isSeller
                      ? "bg-[#0D6D5F]/10 border-[#0D6D5F] text-[#0D6D5F]"
                      : "bg-[#F8F9FA] border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Hire as Client</span>
                  </button>
                </div>
              </div>

              {/* Social Sign Up Buttons */}
              <div className="grid grid-cols-2 gap-2.5 w-full mb-2.5">
                <div className="relative">
                  <button
                    data-testid="modal-register-google-btn"
                    type="button"
                    onClick={() => onSocialAuthClick("google", registerInput.isSeller)}
                    disabled={loading || !!loadingProvider}
                    className="w-full h-9 sm:h-10 px-2 border border-gray-200/90 rounded-[6px] bg-white hover:bg-gray-50/80 transition-colors flex items-center justify-center gap-2 text-xs font-medium text-[#1f2937] shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingProvider === "google" ? (
                      <span className="inline-block w-3.5 h-3.5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                    ) : (
                      <FcGoogle className="text-base shrink-0" />
                    )}
                    <span className="truncate">Sign up with Google</span>
                  </button>
                  <div
                    ref={registerGoogleBtnRef}
                    className="absolute inset-0 overflow-hidden opacity-[0.0001] cursor-pointer pointer-events-auto [&>div]:!w-full [&>div]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!scale-150"
                  />
                </div>

                <button
                  data-testid="modal-register-apple-btn"
                  type="button"
                  onClick={() => onSocialAuthClick("apple", registerInput.isSeller)}
                  disabled={true}
                  className="w-full h-9 sm:h-10 px-2 border border-gray-200/90 rounded-[6px] bg-white hover:bg-gray-50/80 transition-colors flex items-center justify-center gap-2 text-xs font-medium text-[#1f2937] shadow-2xs cursor-not-allowed opacity-60"
                  title="Apple Sign-Up coming soon"
                >
                  <FaApple className="text-base text-black shrink-0" />
                  <span className="truncate">Sign up with Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center w-full mb-2.5">
                <div className="w-full border-t border-gray-200/80" />
                <span className="absolute px-3 bg-white text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                  or continue with email
                </span>
              </div>

              {/* Register Form (No Username Field!) */}
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-2.5 w-full">
                {/* Email Address */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-[13px] font-medium text-gray-700">Email Address</label>
                  <input
                    data-testid="modal-register-email-input"
                    type="email"
                    placeholder="name@example.com"
                    value={registerInput.email}
                    onChange={(e) =>
                      setRegisterInput((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                    className="w-full h-9 sm:h-10 px-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                  />
                </div>

                {/* Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs sm:text-[13px] font-medium text-gray-700">Password</label>
                    <div className="relative flex items-center">
                      <input
                        data-testid="modal-register-password-input"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="At least 8 chars"
                        value={registerInput.password}
                        onChange={(e) =>
                          setRegisterInput((prev) => ({ ...prev, password: e.target.value }))
                        }
                        required
                        className="w-full h-9 sm:h-10 px-3.5 pr-10 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                      >
                        {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs sm:text-[13px] font-medium text-gray-700">Confirm Password</label>
                    <div className="relative flex items-center">
                      <input
                        data-testid="modal-register-confirm-password-input"
                        type={showRegisterConfirmPassword ? "text" : "password"}
                        placeholder="Repeat password"
                        value={registerInput.confirmPassword}
                        onChange={(e) =>
                          setRegisterInput((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        required
                        className="w-full h-9 sm:h-10 px-3.5 pr-10 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                        onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                        aria-label={showRegisterConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showRegisterConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Agree to Terms */}
                <label className="flex items-start gap-2 mt-0.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-0.5 rounded text-[#0D6D5F] focus:ring-[#0D6D5F]"
                  />
                  <span className="text-[11px] text-gray-500 leading-tight">
                    I agree to the{" "}
                    <Link href="/trust-safety" target="_blank" className="text-[#0D6D5F] underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/trust-safety" target="_blank" className="text-[#0D6D5F] underline font-medium">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                {/* Submit Button */}
                <Button
                  data-testid="modal-register-submit-btn"
                  type="submit"
                  variant="brand"
                  size="md"
                  fullWidth
                  radius="fiverr"
                  disabled={loading}
                  isLoading={loading}
                  className="mt-0.5 bg-[#0D6D5F] hover:bg-[#0B403F] text-white font-semibold shadow-sm transition-all"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Join Workvence
                </Button>

                <div className="mt-0.5 text-center text-xs text-gray-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="text-[#0D6D5F] font-semibold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              MODE 3: FORGOT PASSWORD
          ───────────────────────────────────────────────────────────── */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700">Account Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full h-10 pl-10 pr-3.5 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                size="md"
                fullWidth
                radius="fiverr"
                disabled={loading}
                isLoading={loading}
                className="mt-2 bg-[#0D6D5F] hover:bg-[#0B403F] text-white font-semibold shadow-sm transition-all"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Code
              </Button>

              <div className="text-center text-xs text-gray-500 mt-2">
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-[#0D6D5F] font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              MODE 4: RESET PASSWORD
          ───────────────────────────────────────────────────────────── */}
          {mode === "reset" && (
            <form onSubmit={handleResetSubmit} className="flex flex-col gap-3.5 w-full">
              {/* 6-box OTP Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700">6-Digit Reset Code</label>
                <div className="flex gap-2 sm:gap-2.5 justify-center w-full my-1">
                  {resetOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`auth-modal-reset-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpInput(
                          idx,
                          e.target.value,
                          resetOtp,
                          setResetOtp,
                          "auth-modal-reset-otp"
                        )
                      }
                      onKeyDown={(e) =>
                        handleOtpKeyDown(idx, e, resetOtp, "auth-modal-reset-otp")
                      }
                      onPaste={(e) =>
                        handleOtpPaste(e, setResetOtp, "auth-modal-reset-otp")
                      }
                      className="w-10 sm:w-11 h-12 text-center text-lg sm:text-xl font-bold border border-gray-200 rounded-[6px] bg-[#F9FAFB] focus:bg-white focus:border-[#0D6D5F] focus:ring-1 focus:ring-[#0D6D5F] outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type={showResetPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={resetPasswords.newPassword}
                    onChange={(e) =>
                      setResetPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    required
                    className="w-full h-10 pl-10 pr-10 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                  >
                    {showResetPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-[13px] font-medium text-gray-700">Confirm New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type={showResetConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={resetPasswords.confirmPassword}
                    onChange={(e) =>
                      setResetPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    required
                    className="w-full h-10 pl-10 pr-10 bg-[#F0F0F0] border border-[rgba(0,0,0,0.10)] focus:border-gray-300 focus:bg-white rounded-[6px] text-sm text-gray-900 placeholder:text-[#868686] placeholder:font-normal transition-colors outline-none"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center cursor-pointer"
                    onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                  >
                    {showResetConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                size="md"
                fullWidth
                radius="fiverr"
                disabled={loading}
                isLoading={loading}
                className="mt-2 bg-[#0D6D5F] hover:bg-[#0B403F] text-white font-semibold shadow-sm transition-all"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Reset Password
              </Button>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              MODE 5: EMAIL OTP VERIFICATION (Confirm your email)
          ───────────────────────────────────────────────────────────── */}
          {mode === "verify" && (
            <div className="my-auto flex flex-col w-full py-2">
              <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 font-sf-pro mb-5">
                Confirm your email
              </h2>

              <form onSubmit={handleVerifySubmit} className="flex flex-col w-full">
                <div className="flex gap-2 sm:gap-2.5 justify-start w-full mb-4">
                  {verifyOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`auth-modal-verify-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      placeholder="0"
                      value={digit}
                      onChange={(e) =>
                        handleOtpInput(
                          idx,
                          e.target.value,
                          verifyOtp,
                          setVerifyOtp,
                          "auth-modal-verify-otp"
                        )
                      }
                      onKeyDown={(e) =>
                        handleOtpKeyDown(idx, e, verifyOtp, "auth-modal-verify-otp")
                      }
                      onPaste={(e) =>
                        handleOtpPaste(e, setVerifyOtp, "auth-modal-verify-otp")
                      }
                      className="flex-1 min-w-0 max-w-[56px] aspect-square text-center text-xl sm:text-2xl font-bold border border-gray-200 rounded-[6px] bg-[#f9fafb] text-gray-900 placeholder:text-[#868686] placeholder:font-normal placeholder:text-[24px] placeholder:leading-none placeholder:tracking-[0px] font-['SF_Pro',-apple-system,BlinkMacSystemFont,sans-serif] focus:bg-white focus:outline-none focus:border-[#0D6D5F] focus:ring-1 focus:ring-[#0D6D5F] transition-all"
                    />
                  ))}
                </div>

                {/* Resend OTP Bar */}
                <div className="text-left w-full text-xs sm:text-[13px] text-[#6b7280] mb-5">
                  <span>Didn’t receive the email?</span>{" "}
                  {resendTimer > 0 ? (
                    <span className="text-gray-900 font-semibold">
                      Retry in <strong className="font-bold">{resendTimer}</strong> seconds
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-bold text-gray-900 hover:text-[#0D6D5F] transition-colors cursor-pointer"
                    >
                      Retry
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="brand"
                  size="md"
                  fullWidth
                  radius="fiverr"
                  disabled={loading || verifyOtp.join("").length < 6}
                  isLoading={loading}
                  className="mt-1 bg-[#0D6D5F] hover:bg-[#0B403F] text-white font-semibold shadow-sm transition-all"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Submit
                </Button>

                <div className="text-center text-xs text-gray-500 mt-3">
                  Wrong email address?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="text-[#0D6D5F] font-semibold hover:underline cursor-pointer"
                  >
                    Change email
                  </button>
                </div>
              </form>
            </div>
          )}
          </div>

          {/* Bottom Copyright & Terms Disclaimer */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
            <span>© 2026 Workvence. All rights reserved.</span>
            <Link href="/trust-safety" className="hover:text-gray-600 transition-colors">
              Privacy & Safety
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
