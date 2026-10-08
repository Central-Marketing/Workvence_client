"use client";

import React from "react";
import { Button, CustomSelect, AIPolishButton, Modal } from "@/components/ui";
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Offer"
      footer={
        <>
          <Button
            type="button"
            variant="soft"
            size="md"
            radius="fiverr"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-custom-offer-form"
            variant="dark"
            size="md"
            radius="fiverr"
            className="cursor-pointer font-bold"
          >
            Send Offer
          </Button>
        </>
      }
    >
      <form id="create-custom-offer-form" onSubmit={handleFormSubmit} className="flex flex-col gap-4 font-sf-pro">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
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
          <label className="text-xs font-semibold text-slate-700">
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
          <label className="text-xs font-semibold text-slate-700">Offer Description</label>
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
            <label className="text-xs font-semibold text-slate-700">Price (USD)</label>
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
            <label className="text-xs font-semibold text-slate-700">Delivery (Days)</label>
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
            <label className="text-xs font-semibold text-slate-700">Revisions</label>
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
      </form>
    </Modal>
  );
};
