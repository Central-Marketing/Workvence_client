"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Gift,
  Share2,
  Copy,
  Check,
  Mail,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";

const referralFaqs = [
  {
    q: "How does the Give $25, Get $25 program work?",
    a: "When your friend registers using your unique referral link, they immediately receive $25 in credits toward their first project. Once they complete their first order or earn their first payout, you automatically receive $25 credited to your Workvence wallet."
  },
  {
    q: "Is there a limit to how many friends I can invite?",
    a: "No limit! You can invite as many friends, colleagues, and creators as you wish and accumulate unlimited reward credits."
  },
  {
    q: "How can I spend my referral credits?",
    a: "Referral credits can be applied directly at checkout toward any marketplace package or withdrawn as cash after reaching $100 in accumulated bonus earnings."
  }
];

export default function InviteAFriendPage() {
  const [copied, setCopied] = useState(false);
  const [emails, setEmails] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const referralLink = "https://workvence.com/join?ref=WV-FRIEND25";

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvites = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emails.trim()) {
      toast.error("Please enter at least one friend's email address.");
      return;
    }
    toast.success("Invitations sent successfully with $25 bonus coupon attached!");
    setEmails("");
  };

  const handleSocialShare = (platform: string) => {
    const text = encodeURIComponent("Join Workvence and get $25 off your first project! " + referralLink);
    let url = "";
    if (platform === "twitter") url = `https://twitter.com/intent/tweet?text=${text}`;
    if (platform === "linkedin") url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
    if (platform === "whatsapp") url = `https://api.whatsapp.com/send?text=${text}`;
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-white text-[#112131] font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f2fbf6] via-[#f7fdf9] to-white border-b border-gray-100 py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#327C73] text-xs font-semibold">
              <Gift className="w-4 h-4 text-[#10b981]" />
              <span>Workvence Referral Rewards</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-tight">
              Give $25, Get $25 for <br className="hidden sm:inline" />
              <span className="text-[#327C73]">Every Friend You Invite</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal">
              Introduce colleagues, founders, and talented creators to Workvence. They get $25 off their first project, and you get $25 in credits when they complete an order.
            </p>
          </div>
        </div>
      </section>

      {/* Share Box Container */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-12">
          
          {/* Main Referral Generator Card */}
          <div className="bg-[#f8fafc] border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8">
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-bold text-[#0f172a]">Your Unique Referral Link</h3>
              <p className="text-xs text-gray-500">Share this link anywhere online to automatically track your bonuses.</p>
            </div>

            {/* Link Copy Input */}
            <div className="flex items-center bg-white border border-gray-300 rounded-2xl p-2 focus-within:border-[#327C73] shadow-xs">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full px-3 text-xs sm:text-sm font-mono text-gray-800 bg-transparent outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-5 py-2.5 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>

            {/* 1-Click Social Sharing */}
            <div className="space-y-3 text-center pt-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Or share instantly via:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleSocialShare("whatsapp")}
                  className="px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-semibold transition cursor-pointer"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleSocialShare("twitter")}
                  className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold transition hover:bg-gray-800 cursor-pointer"
                >
                  X (Twitter)
                </button>
                <button
                  onClick={() => handleSocialShare("linkedin")}
                  className="px-4 py-2.5 rounded-xl bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#0077b5] text-xs font-semibold transition cursor-pointer"
                >
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Direct Email Invites Form */}
            <div className="border-t border-gray-200/80 pt-6 space-y-4">
              <h4 className="text-sm font-bold text-[#0f172a]">Invite by Email</h4>
              <form onSubmit={handleSendInvites} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Enter Email Addresses (Separated by commas)
                  </label>
                  <textarea
                    rows={2}
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    placeholder="friend1@example.com, colleague@startup.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs focus:border-[#327C73] outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0f172a] hover:bg-black text-white font-semibold text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send $25 Gift Invitations</span>
                </button>
              </form>
            </div>

          </div>

          {/* Referral FAQ */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#0f172a] text-center">Referral Program FAQ</h3>
            <div className="space-y-3">
              {referralFaqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-[#f8fafc] border border-gray-200/90 rounded-2xl p-5 cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#0f172a]">{faq.q}</h4>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        openFaq === i ? "rotate-180 text-[#327C73]" : ""
                      }`}
                    />
                  </div>
                  {openFaq === i && (
                    <p className="text-xs text-gray-600 pt-3 mt-3 border-t border-gray-200 leading-relaxed font-normal">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
