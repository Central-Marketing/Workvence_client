"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  X,
  Eye,
  EyeOff,
  Check,
  Briefcase,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui";
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  defaultIsSeller?: boolean;
  onSuccess?: (user: any) => void;
  redirectUrl?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  defaultIsSeller = true,
  onSuccess,
  redirectUrl,
}) => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login Form State
  const [loginInput, setLoginInput] = useState({
    identifier: "",
    password: "",
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [registerInput, setRegisterInput] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    isSeller: defaultIsSeller,
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Sync mode whenever modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

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

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.identifier.trim() || !loginInput.password) {
      setError("Please fill in both email/username and password.");
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
      const user = data?.user || data;
      const userKey = user.id || user._id || user.username || "default";
      sessionStorage.removeItem(`kyc_prompt_dismissed_${userKey}`);
      sessionStorage.removeItem("kyc_prompt_dismissed_session");

      // Save tokens in cookies & localStorage
      const token = data?.accessToken || data?.token || user?.token || user?.accessToken;
      const refreshToken = data?.refreshToken || user?.refreshToken;
      if (token) {
        document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
        try { localStorage.setItem("accessToken", token); } catch {}
        try { localStorage.setItem("token", token); } catch {}
      }
      if (refreshToken) {
        document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; max-age=2592000; SameSite=Lax`;
        try { localStorage.setItem("refreshToken", refreshToken); } catch {}
      }

      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      toast.success(`Welcome back, ${user.username || "User"}!`);

      if (onSuccess) {
        onSuccess(user);
      }
      onClose();

      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      const isVerified = err.response?.data?.isVerified;
      const email = err.response?.data?.email;
      const msg = err.response?.data?.message || "Invalid email or password.";

      if (isVerified === false && email) {
        toast.error("Email verification required. Redirecting...");
        sessionStorage.setItem("tempLoginPassword", loginInput.password);
        sessionStorage.setItem("tempLoginUsername", loginInput.identifier);
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        onClose();
        return;
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, isSeller } = registerInput;

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
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

    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password,
        isSeller,
      };

      await axiosFetch.post("/auth/register", payload);
      toast.success("Registration successful! Please confirm your email.");

      sessionStorage.setItem("tempLoginUsername", email.trim());
      sessionStorage.setItem("tempLoginPassword", password);

      onClose();
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-[860px] max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          radius="full"
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 border-none shadow-none"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Left Pane (Desktop Branded Artwork / Benefits) */}
        <div className="hidden md:flex w-[40%] shrink-0 bg-gradient-to-br from-[#0B403F] via-[#0D6D5F] to-[#072522] p-8 text-white flex-col justify-between relative overflow-hidden">
          {/* Ambient Lighting Accents */}
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

          {/* Top Section */}
          <div className="relative z-10">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/Workvence-logo-Horizontal3.png"
                alt="Workvence"
                width={135}
                height={32}
                className="h-7 w-auto object-contain brightness-0 invert"
                priority
              />
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-md mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Join Workvence Network</span>
            </div>

            <h3 className="text-2xl font-bold font-sf-pro leading-snug tracking-tight text-white">
              Success starts here.
            </h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed mt-1.5">
              Access high-budget client projects, submit proposals, and scale your freelance career with secure milestones.
            </p>
          </div>

          {/* Value Points */}
          <div className="relative z-10 my-6 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-emerald-50">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-emerald-300" />
              </div>
              <span>Over 700 project categories</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-emerald-50">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-emerald-300" />
              </div>
              <span>Zero upfront fees — milestone escrow</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-emerald-50">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-emerald-300" />
              </div>
              <span>Direct client chat & proposal tools</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-emerald-50">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
              </div>
              <span>Verified buyers & secure payouts</span>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-emerald-100/70">
            Trusted by creators and top businesses worldwide.
          </div>
        </div>

        {/* Right Pane (Auth Form) */}
        <div className="flex-1 min-w-0 p-6 sm:p-8 flex flex-col overflow-y-auto">
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

          {/* Mode Switcher Tabs (Fiverr Style) */}
          <div className="flex items-center border-b border-gray-100 mb-5 gap-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`pb-2.5 text-sm sm:text-[15px] font-semibold transition-all relative ${
                mode === "login"
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
              className={`pb-2.5 text-sm sm:text-[15px] font-semibold transition-all relative ${
                mode === "register"
                  ? "text-[#0D6D5F] border-b-2 border-[#0D6D5F]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Join Workvence
            </button>
          </div>

          {/* Title and Description */}
          <div className="mb-4">
            <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-gray-900 font-sf-pro">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-xs sm:text-[13px] text-gray-500 mt-1">
              {mode === "login"
                ? "Sign in to submit proposals and connect with clients."
                : "Join Workvence to discover project opportunities and submit proposals."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs sm:text-[13px] font-medium flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                !
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5 flex-1">
              {/* Email / Username */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Email or Username</label>
                <input
                  type="text"
                  placeholder="Enter email address or username"
                  value={loginInput.identifier}
                  onChange={(e) =>
                    setLoginInput((prev) => ({ ...prev, identifier: e.target.value }))
                  }
                  required
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-[#F8F9FA] border border-gray-200 focus:border-[#0D6D5F] focus:bg-white rounded-xl text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">Password</label>
                  <Link
                    href="/forgot-password"
                    onClick={onClose}
                    className="text-[11px] font-medium text-[#0D6D5F] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginInput.password}
                    onChange={(e) =>
                      setLoginInput((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                    className="w-full px-3.5 py-2.5 sm:py-3 pr-10 bg-[#F8F9FA] border border-gray-200 focus:border-[#0D6D5F] focus:bg-white rounded-xl text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    radius="full"
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 !p-1 !h-auto !w-auto border-none"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="dark"
                size="md"
                fullWidth
                radius="fiverr"
                disabled={loading}
                isLoading={loading}
                className="mt-2 bg-[#0D6D5F] hover:bg-[#0B403F] text-white font-semibold shadow-sm transition-all"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>

              {/* Bottom Switch */}
              <div className="mt-4 text-center text-xs text-gray-500">
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
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 flex-1">
              {/* Role Selection (Fiverr Freelancer vs Client Toggle) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">I want to</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterInput((prev) => ({ ...prev, isSeller: true }))}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      registerInput.isSeller
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
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      !registerInput.isSeller
                        ? "bg-[#0D6D5F]/10 border-[#0D6D5F] text-[#0D6D5F]"
                        : "bg-[#F8F9FA] border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Hire as Client</span>
                  </button>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Username</label>
                <input
                  type="text"
                  placeholder="e.g. creative_dev"
                  value={registerInput.username}
                  onChange={(e) =>
                    setRegisterInput((prev) => ({ ...prev, username: e.target.value }))
                  }
                  required
                  className="w-full px-3.5 py-2 sm:py-2.5 bg-[#F8F9FA] border border-gray-200 focus:border-[#0D6D5F] focus:bg-white rounded-xl text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={registerInput.email}
                  onChange={(e) =>
                    setRegisterInput((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  className="w-full px-3.5 py-2 sm:py-2.5 bg-[#F8F9FA] border border-gray-200 focus:border-[#0D6D5F] focus:bg-white rounded-xl text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                />
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="At least 8 chars"
                      value={registerInput.password}
                      onChange={(e) =>
                        setRegisterInput((prev) => ({ ...prev, password: e.target.value }))
                      }
                      required
                      className="w-full px-3.5 py-2 sm:py-2.5 pr-8 bg-[#F8F9FA] border border-gray-200 focus:border-[#0D6D5F] focus:bg-white rounded-xl text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      radius="full"
                      className="absolute right-2 text-gray-400 hover:text-gray-600 !p-1 !h-auto !w-auto border-none"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      value={registerInput.confirmPassword}
                      onChange={(e) =>
                        setRegisterInput((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      required
                      className="w-full px-3.5 py-2 sm:py-2.5 pr-8 bg-[#F8F9FA] border border-gray-200 focus:border-[#0D6D5F] focus:bg-white rounded-xl text-xs sm:text-[13px] text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      radius="full"
                      className="absolute right-2 text-gray-400 hover:text-gray-600 !p-1 !h-auto !w-auto border-none"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Agree to Terms Checkbox */}
              <label className="flex items-start gap-2 mt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#0D6D5F] focus:ring-[#0D6D5F]"
                />
                <span className="text-[11px] text-gray-500 leading-tight">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-[#0D6D5F] underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-[#0D6D5F] underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="dark"
                size="md"
                fullWidth
                radius="fiverr"
                disabled={loading}
                isLoading={loading}
                className="mt-2 bg-[#0D6D5F] hover:bg-[#0B403F] text-white font-semibold shadow-sm transition-all"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Join Workvence
              </Button>

              {/* Bottom Switch */}
              <div className="mt-2 text-center text-xs text-gray-500">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
