"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";

export default function IpClaimForm() {
  const [claimForm, setClaimForm] = useState({
    claimantName: "",
    rightsHolder: "",
    email: "",
    phone: "",
    infringingUrl: "",
    originalWorkUrl: "",
    description: "",
    statementGoodFaith: false,
    statementAccuracy: false,
    signature: ""
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.claimantName || !claimForm.email || !claimForm.infringingUrl || !claimForm.signature) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }
    if (!claimForm.statementGoodFaith || !claimForm.statementAccuracy) {
      toast.error("You must agree to the legal statements under penalty of perjury.");
      return;
    }
    toast.success("Intellectual Property Claim submitted. Notice ID: WV-IP-" + Math.floor(100000 + Math.random() * 900000) + ". Our legal team will review within 24-48 hours.");
    setClaimForm({
      claimantName: "",
      rightsHolder: "",
      email: "",
      phone: "",
      infringingUrl: "",
      originalWorkUrl: "",
      description: "",
      statementGoodFaith: false,
      statementAccuracy: false,
      signature: ""
    });
  };

  return (
    <div className="lg:col-span-7">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-[#0f172a]">Submit Notice of Infringement</h3>
          <p className="text-xs text-gray-500">
            Submit this form to notify Workvence of an alleged IP or copyright infringement.
          </p>
        </div>

        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Your Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={claimForm.claimantName}
                onChange={(e) => setClaimForm({ ...claimForm, claimantName: e.target.value })}
                placeholder="e.g. Robert Vance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Copyright / Rights Owner *
              </label>
              <input
                type="text"
                required
                value={claimForm.rightsHolder}
                onChange={(e) => setClaimForm({ ...claimForm, rightsHolder: e.target.value })}
                placeholder="Self or Company Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={claimForm.email}
                onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                placeholder="legal@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={claimForm.phone}
                onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Infringing Workvence URL(s) *
            </label>
            <input
              type="url"
              required
              value={claimForm.infringingUrl}
              onChange={(e) => setClaimForm({ ...claimForm, infringingUrl: e.target.value })}
              placeholder="https://workvence.com/package/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Original Authorized Work Reference / URL
            </label>
            <input
              type="url"
              value={claimForm.originalWorkUrl}
              onChange={(e) => setClaimForm({ ...claimForm, originalWorkUrl: e.target.value })}
              placeholder="https://yourwebsite.com/original-art..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description of Infringement *
            </label>
            <textarea
              rows={3}
              required
              value={claimForm.description}
              onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
              placeholder="Describe the copyrighted elements that have been copied without permission..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none resize-none"
            />
          </div>

          {/* Legal Attestations Checkboxes */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600">
              <input
                type="checkbox"
                required
                checked={claimForm.statementGoodFaith}
                onChange={(e) => setClaimForm({ ...claimForm, statementGoodFaith: e.target.checked })}
                className="mt-0.5 rounded text-[#327C73] focus:ring-[#327C73]"
              />
              <span>
                I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600">
              <input
                type="checkbox"
                required
                checked={claimForm.statementAccuracy}
                onChange={(e) => setClaimForm({ ...claimForm, statementAccuracy: e.target.checked })}
                className="mt-0.5 rounded text-[#327C73] focus:ring-[#327C73]"
              />
              <span>
                Under penalty of perjury, the information in this notification is accurate and I am authorized to act on behalf of the copyright owner.
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Electronic Signature (Type Your Full Legal Name) *
            </label>
            <input
              type="text"
              required
              value={claimForm.signature}
              onChange={(e) => setClaimForm({ ...claimForm, signature: e.target.value })}
              placeholder="/s/ Full Legal Name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:border-[#327C73] outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#327C73] hover:bg-[#28635c] text-white font-semibold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit DMCA Takedown Notice</span>
          </button>
        </form>
      </div>
    </div>
  );
}
