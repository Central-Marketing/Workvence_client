"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { RiCloseLine } from "react-icons/ri";
import { Button, Skeleton } from "@/components";
import { formatFileSize } from "@/lib";
import { formatFileNameWithExtension, isImageFile } from "../../utils/chatMediaHelpers";
import { MediaFileItem } from "../../types";
import { ContactProfileTab } from "./ContactProfileTab";
import { ContactMediaTab } from "./ContactMediaTab";

interface ContactSidebarProps {
  isValidId: boolean;
  isRightSideOpen: boolean;
  onCloseRightSide: () => void;
  finalRecipientUser: any;
  isFetchingTargetUser: boolean;
  activeConversation: any;
  conversationID: string;
  isRecipientOnline: boolean;
  contactOrders: any[];
  messages: any[];
  user: any;
  onOpenOfferModal: () => void;
  onOpenMeetingModal: () => void;
  onNavigateToProfile: (id: string) => void;
  onNavigateToOrder: (id?: string) => void;
  onNavigateToAllOrders: () => void;
  onImagePreview: (url: string) => void;
}

export const ContactSidebar: React.FC<ContactSidebarProps> = ({
  isValidId,
  isRightSideOpen,
  onCloseRightSide,
  finalRecipientUser,
  isFetchingTargetUser,
  activeConversation,
  conversationID,
  isRecipientOnline,
  contactOrders,
  messages,
  user,
  onOpenOfferModal,
  onOpenMeetingModal,
  onNavigateToProfile,
  onNavigateToOrder,
  onNavigateToAllOrders,
  onImagePreview,
}) => {
  const [contactSidebarTab, setContactSidebarTab] = useState<"profile" | "media">("profile");
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(true);

  const conversationMediaFiles = useMemo<MediaFileItem[]>(() => {
    return (messages || []).flatMap((m: any) => {
      const items: MediaFileItem[] = [];
      const parseItem = (item: any) => {
        if (!item) return;
        if (typeof item === "string" && item.trim().length > 0) {
          const rawName =
            m.attachment?.name ||
            m.fileName ||
            m.name ||
            m.originalName ||
            item.split("/").pop()?.split("?")[0] ||
            "Attachment";
          const fileName = formatFileNameWithExtension(rawName, item, null, m);
          const rawSize = m.fileSize || m.size || m.bytes || m.attachment?.size;
          items.push({
            name: fileName,
            sizeText: formatFileSize(rawSize),
            url: item,
          });
        } else if (typeof item === "object" && (item.url || item.file || item.secure_url)) {
          const url = item.url || item.file || item.secure_url;
          if (typeof url === "string" && url.trim().length > 0) {
            const rawName =
              item.name ||
              item.fileName ||
              item.original_filename ||
              m.attachment?.name ||
              m.fileName ||
              m.name ||
              url.split("/").pop()?.split("?")[0] ||
              "Attachment";
            const fileName = formatFileNameWithExtension(rawName, url, item, m);
            const rawSize =
              item.sizeText || item.size || item.bytes || m.fileSize || m.size || m.attachment?.size;
            items.push({
              name: fileName,
              sizeText: formatFileSize(rawSize),
              url,
            });
          }
        }
      };
      if (m.file) parseItem(m.file);
      if (m.attachment && m.attachment.url && m.attachment.url !== m.file) parseItem(m.attachment);
      if (Array.isArray(m.attachments)) m.attachments.forEach(parseItem);
      return items;
    });
  }, [messages]);

  const handlePreviewMedia = (file: MediaFileItem) => {
    if (!file.url || file.url === "#") {
      toast.error("File URL is not available");
      return;
    }
    if (isImageFile(file)) {
      onImagePreview(file.url);
    } else {
      window.open(file.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownloadMedia = async (file: MediaFileItem) => {
    if (file.url && file.url !== "#") {
      try {
        const res = await fetch(file.url);
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          return;
        }
      } catch {
        // Fallback to direct anchor if fetch blocked by CORS
      }
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.success(`Downloading ${file.name}`);
    }
  };

  if (!isValidId) return null;

  if (!finalRecipientUser && isFetchingTargetUser) {
    return (
      <aside
        className={`w-[320px] min-w-[280px] xl:w-[340px] xl:min-w-[320px] h-full max-h-full min-h-0 border-l border-[rgba(0, 0, 0, 0.10)] bg-[#F8F8F8] overflow-y-auto overflow-x-hidden p-4 xl:p-5 flex flex-col shrink-0 box-border max-xl:fixed max-xl:top-0 max-xl:bottom-0 max-xl:right-0 max-xl:z-50 max-xl:shadow-2xl max-xl:h-full max-xl:flex max-xl:transform max-xl:transition-transform max-xl:duration-300 max-xl:ease-in-out max-sm:w-[85vw] max-sm:max-w-[340px] ${
          isRightSideOpen ? "max-xl:translate-x-0" : "max-xl:translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-4">
          <Skeleton className="w-full h-44 rounded-[6px]" />
          <Skeleton className="w-full h-36 rounded-[6px]" />
        </div>
      </aside>
    );
  }

  if (!finalRecipientUser) return null;

  return (
    <>
      <div
        className={`xl:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity duration-300 ease-in-out ${
          isRightSideOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseRightSide}
      />

      <aside
        className={`w-[320px] min-w-[280px] xl:w-[340px] xl:min-w-[320px] h-full max-h-full min-h-0 border-l border-[rgba(0, 0, 0, 0.10)] bg-[#F8F8F8] overflow-y-auto overflow-x-hidden p-4 xl:p-5 flex flex-col shrink-0 box-border [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full max-xl:fixed max-xl:top-0 max-xl:bottom-0 max-xl:right-0 max-xl:z-50 max-xl:shadow-2xl max-xl:h-full max-xl:flex max-xl:transform max-xl:transition-transform max-xl:duration-300 max-xl:ease-in-out max-sm:w-[85vw] max-sm:max-w-[340px] ${
          isRightSideOpen ? "max-xl:translate-x-0" : "max-xl:translate-x-full"
        }`}
      >
        <div className="w-full flex flex-col gap-4 pb-20">
          {/* Mobile Drawer Top Bar */}
          <div className="xl:hidden flex items-center justify-between pb-3 border-b border-slate-200/80 -mt-1">
            <span className="font-bold text-slate-900 text-base">Contact Details</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              radius="full"
              className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
              onClick={onCloseRightSide}
              aria-label="Close sidebar"
              icon={<RiCloseLine className="w-5 h-5" />}
            />
          </div>

          {/* Top Segmented Controls: Profile | Media (Sticky header shield) */}
          <div className="sticky -top-4 xl:-top-5 -mt-4 xl:-mt-5 pt-4 xl:pt-5 pb-2 bg-[#F8F8F8] z-10">
            <div className="bg-[#f0f2f5] p-1 rounded-[6px] flex items-center border border-slate-200/70 shadow-xs">
              <Button
                type="button"
                variant={contactSidebarTab === "profile" ? "dark" : "ghost"}
                size="sm"
                radius="xl"
                onClick={() => setContactSidebarTab("profile")}
                className={`flex-1 py-2 text-sm font-semibold text-center ${
                  contactSidebarTab === "profile"
                    ? "!bg-[#0e3834] !text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Profile
              </Button>
              <Button
                type="button"
                variant={contactSidebarTab === "media" ? "dark" : "ghost"}
                size="sm"
                radius="xl"
                onClick={() => setContactSidebarTab("media")}
                className={`flex-1 py-2 text-sm font-semibold text-center ${
                  contactSidebarTab === "media"
                    ? "!bg-[#0e3834] !text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Media
              </Button>
            </div>
          </div>

          {contactSidebarTab === "profile" ? (
            <ContactProfileTab
              user={user}
              finalRecipientUser={finalRecipientUser}
              activeConversation={activeConversation}
              conversationID={conversationID}
              isRecipientOnline={isRecipientOnline}
              contactOrders={contactOrders}
              isOrdersExpanded={isOrdersExpanded}
              setIsOrdersExpanded={setIsOrdersExpanded}
              onOpenOfferModal={onOpenOfferModal}
              onOpenMeetingModal={onOpenMeetingModal}
              onCloseRightSide={onCloseRightSide}
              onNavigateToProfile={onNavigateToProfile}
              onNavigateToOrder={onNavigateToOrder}
              onNavigateToAllOrders={onNavigateToAllOrders}
            />
          ) : (
            <ContactMediaTab
              conversationMediaFiles={conversationMediaFiles}
              onPreviewMedia={handlePreviewMedia}
              onDownloadMedia={handleDownloadMedia}
            />
          )}
        </div>
      </aside>
    </>
  );
};
