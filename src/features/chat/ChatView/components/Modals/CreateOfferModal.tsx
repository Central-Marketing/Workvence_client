"use client";

import React from "react";
import { Button } from "@/components";
import { CustomSelect, AIPolishButton } from "@/components/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerPackages: any[];
  chatBriefs: any[];
  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
  selectedBriefId: string;
  setSelectedBriefId: (id: string) => void;
  offerDesc: string;
  setOfferDesc: (val: string) => void;
  offerPrice: string;
  setOfferPrice: (val: string) => void;
  offerDelivery: string;
  setOfferDelivery: (val: string) => void;
  offerRevisions: number | string;
  setOfferRevisions: (val: number | string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  isOpen,
  onClose,
  sellerPackages,
  chatBriefs,
  selectedPackageId,
  setSelectedPackageId,
  selectedBriefId,
  setSelectedBriefId,
  offerDesc,
  setOfferDesc,
  offerPrice,
  setOfferPrice,
  offerDelivery,
  setOfferDelivery,
  offerRevisions,
  setOfferRevisions,
  onSubmit,
}) => {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setHasAttemptedSubmit(false);
    }
  }, [isOpen]);

  const handleFormSubmit = (e: React.FormEvent) => {
    setHasAttemptedSubmit(true);
    if (!selectedPackageId && !selectedBriefId) {
      e.preventDefault();
      return;
    }
    onSubmit(e);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white w-[92%] max-w-[460px] max-h-[calc(100vh-40px)] flex flex-col overflow-hidden rounded-[6px] shadow-2xl border border-slate-100 max-md:w-[96%] max-md:max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <h3 className="text-[15px] font-bold text-slate-900 m-0">Create Custom Offer</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            radius="full"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 text-2xl leading-none p-1"
            aria-label="Close modal"
          >
            &times;
          </Button>
        </div>
        <form onSubmit={handleFormSubmit} className="p-5 flex flex-col gap-3.5 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">
              Package Reference{" "}
              <span className="text-xs text-slate-400 font-normal">(optional)</span>
            </label>
            <CustomSelect
              size="md"
              options={[
                { value: "", label: "-- Select one of your Packages --" },
                ...sellerPackages.map((g: any) => ({
                  value: g._id || g.id,
                  label: g.title,
                })),
              ]}
              value={selectedPackageId}
              onChange={(val) => setSelectedPackageId(String(val))}
              placeholder="-- Select one of your Packages --"
              ariaLabel="Package Reference"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">
              Project Reference{" "}
              <span className="text-xs text-slate-400 font-normal">(optional)</span>
            </label>
            <CustomSelect
              size="md"
              options={[
                { value: "", label: "-- Select a Project --" },
                ...chatBriefs.map((b: any) => ({
                  value: b._id,
                  label: `${b.title} — $${b.budget}`,
                })),
              ]}
              value={selectedBriefId}
              onChange={(val) => setSelectedBriefId(String(val))}
              placeholder={
                chatBriefs.length === 0
                  ? "No projects available for this chat"
                  : "-- Select a Project --"
              }
              disabled={chatBriefs.length === 0}
              ariaLabel="Project Reference"
            />
          </div>
          {!selectedPackageId && !selectedBriefId && (
            <div className="mt-0.5">
              {hasAttemptedSubmit ? (
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium animate-in fade-in duration-150">
                  <HugeiconsIcon
                    icon={Alert01Icon}
                    size={16}
                    className="shrink-0 text-amber-600"
                  />
                  <span>Please select at least a Package or a Project</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    size={16}
                    className="shrink-0 text-slate-400"
                  />
                  <span>Please select at least a Package or a Project</span>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Offer Description</label>
            <div className="relative">
              <textarea
                placeholder="Describe the service…"
                value={offerDesc}
                onChange={(e) => setOfferDesc(e.target.value)}
                rows={3}
                required
                className="w-full px-3 py-2 pb-8 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white resize-none transition-colors"
              />
              <div className="absolute right-1.5 bottom-1.5 flex items-center">
                <AIPolishButton
                  text={offerDesc}
                  onSuccess={(polishedText) => setOfferDesc(polishedText)}
                  className="p-1 hover:bg-slate-100 rounded-full"
                  tooltip="Polish offer description with AI"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Price (USD)</label>
              <input
                type="number"
                placeholder="150"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                required
                min="1"
                className="px-3 py-2 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Delivery (Days)</label>
              <input
                type="number"
                placeholder="3"
                value={offerDelivery}
                onChange={(e) => setOfferDelivery(e.target.value)}
                required
                min="1"
                className="px-3 py-2 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Revisions</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={offerRevisions}
                onChange={(e) => setOfferRevisions(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-[6px] text-sm text-slate-800 outline-none focus:border-brand-green bg-white transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2.5 mt-2">
            <Button
              type="submit"
              variant="dark"
              size="md"
              radius="fiverr"
              className="flex-1 font-bold"
            >
              Send Offer
            </Button>
            <Button
              type="button"
              variant="soft"
              size="md"
              radius="fiverr"
              className="flex-1 font-semibold border border-slate-200"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
