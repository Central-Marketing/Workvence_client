"use client";

import React from "react";
import moment from "moment";
import { toast } from "sonner";
import { RiStarFill, RiArrowDownSLine } from "react-icons/ri";
import { Button, AiGradientButton } from "@/components";
import { Tag } from "@/components/ui";
import { getAvatarUrl } from "@/utils";
import { ConversationTagsManager } from "@/features/chat/ConversationTags";

interface ContactProfileTabProps {
  user: any;
  finalRecipientUser: any;
  activeConversation: any;
  conversationID: string;
  isRecipientOnline: boolean;
  contactOrders: any[];
  isOrdersExpanded: boolean;
  setIsOrdersExpanded: (expanded: boolean) => void;
  onOpenOfferModal: () => void;
  onOpenMeetingModal: () => void;
  onCloseRightSide: () => void;
  onNavigateToProfile: (targetId: string) => void;
  onNavigateToOrder: (orderId?: string) => void;
  onNavigateToAllOrders: () => void;
}

export const ContactProfileTab: React.FC<ContactProfileTabProps> = ({
  user,
  finalRecipientUser,
  activeConversation,
  conversationID,
  isRecipientOnline,
  contactOrders,
  isOrdersExpanded,
  setIsOrdersExpanded,
  onOpenOfferModal,
  onOpenMeetingModal,
  onCloseRightSide,
  onNavigateToProfile,
  onNavigateToOrder,
  onNavigateToAllOrders,
}) => {
  const displayedOrders = contactOrders.slice(0, 8);

  const formattedLanguages =
    Array.isArray(finalRecipientUser?.languages) && finalRecipientUser.languages.length > 0
      ? finalRecipientUser.languages
          .map((item: any) =>
            typeof item === "string" ? item : item?.language || item?.lang || item?.name
          )
          .filter(Boolean)
          .join(", ")
      : "";

  const renderOrderStatusBadge = (status: string) => {
    const rawStatus = (status || "").toLowerCase().trim();
    const normalized = rawStatus.replace(/[\s_-]/g, "");
    const variant =
      normalized === "inprogress" || normalized === "active"
        ? "in_progress"
        : normalized === "revision" || normalized === "inrevision"
        ? "in_revision"
        : rawStatus || "in_progress";

    return (
      <Tag
        variant={variant}
        size="sm"
        className="shrink-0 text-[11px] px-2.5 py-0.5 font-medium leading-none"
      />
    );
  };

  return (
    <>
      {/* Quick Actions (Mobile Drawer Only) */}
      <div className="flex xl:hidden bg-white rounded-[6px] p-4 border border-slate-200/80 shadow-xs flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-base sm:text-[17px] font-bold text-slate-800 tracking-tight">
            Quick Actions
          </span>
        </div>

        {user?.isSeller && (
          <Button
            type="button"
            variant="brand"
            size="md"
            radius="fiverr"
            fullWidth
            onClick={() => {
              onCloseRightSide();
              onOpenOfferModal();
            }}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            }
            className="font-bold shadow-xs justify-center gap-2"
          >
            Create an Offer
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="md"
          radius="fiverr"
          fullWidth
          onClick={() => {
            onCloseRightSide();
            onOpenMeetingModal();
          }}
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 4H10C13.3 4 15 4 16 5C17 6 17 7.7 17 11V13C17 16.3 17 18 16 19C15 20 13.3 20 10 20H9C5.7 20 4 20 3 19C2 18 2 16.3 2 13V11C2 7.7 2 6 3 5C4 4 5.7 4 9 4Z" />
              <path d="M17 8.9L17.13 8.8C19.24 7.06 20.3 6.18 21.15 6.6C22 7.03 22 8.42 22 11.22V12.78C22 15.58 22 16.97 21.15 17.4C20.3 17.82 19.24 16.94 17.13 15.2L17 15.1" />
            </svg>
          }
          className="font-semibold text-slate-700 hover:text-slate-900 justify-center shadow-2xs"
        >
          Start Video Meeting
        </Button>
      </div>

      {/* Private Tags Card */}
      <ConversationTagsManager
        conversationId={String(
          activeConversation?.uuid ||
            activeConversation?.conversationID ||
            activeConversation?._id ||
            conversationID
        )}
        tags={activeConversation?.tags || []}
        mode="card"
      />

      {/* Card 1: About Contact */}
      <div className="bg-white rounded-[6px] p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3 relative">
        <h3 className="text-base sm:text-[17px] font-bold text-slate-800 tracking-tight">
          About{" "}
          {(
            finalRecipientUser?.isSeller !== undefined
              ? finalRecipientUser.isSeller
              : finalRecipientUser?.role
              ? finalRecipientUser.role === "seller"
              : !user?.isSeller
          )
            ? "Seller"
            : "Buyer"}
        </h3>

        {/* Avatar & Contact Info */}
        <div className="flex items-center gap-3 pt-1">
          <div className="relative shrink-0">
            <img
              src={getAvatarUrl(
                finalRecipientUser?.image ||
                  finalRecipientUser?.img ||
                  finalRecipientUser?.avatar ||
                  "/media/noavatar.png"
              )}
              alt={finalRecipientUser.username || "Contact"}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border border-slate-100 shadow-xs"
            />
            {isRecipientOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                {finalRecipientUser.name || finalRecipientUser.username || "User"}
              </span>
              <span className="bg-[#4c1d95] text-white text-[10px] font-bold px-2 py-1 rounded-[6px] leading-none tracking-wide">
                {finalRecipientUser.badge || (finalRecipientUser.isSeller ? "Seller" : "Buyer")}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              @{finalRecipientUser.username}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 flex-wrap">
              {(finalRecipientUser.shortTitle ||
                finalRecipientUser.occupation ||
                finalRecipientUser.title) && (
                <span className="font-medium text-slate-600">
                  {finalRecipientUser.shortTitle ||
                    finalRecipientUser.occupation ||
                    finalRecipientUser.title}
                </span>
              )}
              {finalRecipientUser.rating || finalRecipientUser.sellerRating ? (
                <>
                  <span className="font-bold text-slate-900 ml-1">
                    {finalRecipientUser.rating || finalRecipientUser.sellerRating}
                  </span>
                  <RiStarFill className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0 -mt-0.5" />
                  <span className="text-slate-400 font-normal">
                    ({finalRecipientUser.reviewCount || finalRecipientUser.totalReviews || 0})
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {finalRecipientUser.createdAt && (
          <>
            <div className="border-t border-slate-100 my-1" />
            <div className="text-xs text-slate-500 font-normal">
              Member Since,{" "}
              <span className="font-bold text-slate-900">
                {moment(finalRecipientUser.createdAt).format("MMM YYYY")}
              </span>
            </div>
          </>
        )}

        <div className="border-t border-slate-100 my-0.5" />

        {/* Details: Status, From & Language */}
        <div className="flex flex-col gap-2 text-xs">
          <div className="grid grid-cols-[75px_1fr] items-center">
            <span className="text-slate-500">From</span>
            <span className="text-slate-800 font-medium">
              {finalRecipientUser.country || "Not specified"}
            </span>
          </div>
          <div className="grid grid-cols-[75px_1fr] items-start">
            <span className="text-slate-500">Language</span>
            <span className="text-slate-800 font-medium leading-relaxed">
              {formattedLanguages || "Not specified"}
            </span>
          </div>
        </div>

        {/* Analysis Seller Profile CTA */}
        <div className="pt-2">
          <AiGradientButton
            onClick={() => {
              const targetId = finalRecipientUser._id || finalRecipientUser.id;
              if (targetId) {
                onNavigateToProfile(targetId);
              } else {
                toast.success("AI Profile Analysis: Verified user profile.");
              }
            }}
            className="w-full text-[16px] font-semibold py-3 rounded-[6px] shadow-xs"
            text="View Profile"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="w-4.5 h-4.5 sm:w-5 sm:h-5 aspect-square shrink-0"
              >
                <path
                  d="M19.5 3.9375V5.5M19.5 5.5V7.0625M19.5 5.5H18.25M19.5 5.5H20.75M22 5.5L20.9156 5.13852C20.4179 4.97263 20.0274 4.58211 19.8615 4.08443L19.5 3L19.1385 4.08443C18.9726 4.58211 18.5821 4.97263 18.0844 5.13852L17 5.5L18.0844 5.86148C18.5821 6.02737 18.9726 6.41789 19.1385 6.91557L19.5 8L19.8615 6.91557C20.0274 6.41789 20.4179 6.02737 20.9156 5.86148L22 5.5Z"
                  stroke="#292929"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12.8598C4.81875 10.0939 11.44 4.44198 13.275 6.40609C15.5938 8.888 3.40937 15.1646 5.28854 17.93C7.2734 20.851 14.2146 10.5543 16.5635 12.3982C18.9125 14.2422 10.926 18.391 12.8052 20.696C13.5569 21.6179 15.6239 20.235 16.5635 19.313"
                  stroke="#292929"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </div>
      </div>

      {/* Card 2: Order History */}
      <div className="bg-white rounded-[6px] p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}
        >
          <h3 className="text-base sm:text-[17px] font-bold text-slate-800">Order History</h3>
          <RiArrowDownSLine
            className={`w-5 h-5 text-slate-600 transition-transform duration-200 ${
              isOrdersExpanded ? "" : "-rotate-90"
            }`}
          />
        </div>

        {isOrdersExpanded && (
          <>
            {displayedOrders.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No order history yet</div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100 pt-1">
                {displayedOrders.map((order: any, idx: number) => (
                  <div
                    key={order._id || idx}
                    className="flex items-center justify-between py-2.5 gap-2 cursor-pointer hover:bg-slate-50/80 rounded-[6px] px-1 transition-colors group"
                    onClick={() => {
                      if (order._id) {
                        onNavigateToOrder(order._id);
                      } else {
                        onNavigateToOrder();
                      }
                    }}
                  >
                    <span
                      className="text-xs text-slate-600 font-normal truncate flex-1 group-hover:text-slate-900 transition-colors"
                      title={order.title}
                    >
                      {order.title || `Order #${String(order._id || idx).substring(0, 8)}`}
                    </span>
                    {renderOrderStatusBadge(order.status)}
                  </div>
                ))}
              </div>
            )}

            {displayedOrders.length > 0 && (
              <Button
                type="button"
                variant="soft"
                size="sm"
                radius="xl"
                fullWidth
                className="mt-2 py-2.5 bg-[#f1f3f5] hover:bg-[#e4e7eb] text-[#292929] font-semibold text-[16px] text-center"
                onClick={onNavigateToAllOrders}
              >
                View all
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
};
