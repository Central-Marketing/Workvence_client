"use client";

import React from "react";
import moment from "moment";
import { MessageModerationBadge } from "@/features/chat";
import { renderMessageTextWithLinks } from "@/utils/chatHelpers";
import { parseOffer, parseMeeting } from "../../utils/chatMediaHelpers";
import { MessageAttachment } from "./MessageAttachment";
import { CustomOfferCard } from "./CustomOfferCard";
import { MeetingCard } from "./MeetingCard";

interface MessageItemProps {
  msg: any;
  index: number;
  user: any;
  prevMsg?: any;
  finalRecipientUser?: any;
  partnerUsername?: string;
  contactOrders: any[];
  sellerPackages: any[];
  chatBriefs: any[];
  onImagePreview: (url: string) => void;
  onReadFullProposal: (
    offer: any,
    msgId: string,
    acceptedOrder: any,
    isOwner: boolean,
    isWithdrawn: boolean
  ) => void;
  onViewOrder: (targetOrderId?: string | null) => void;
  onAcceptOffer: (offer: any) => void;
  onWithdraw: (msgId: string) => void;
  onCopyText: (text: string, msg?: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  msg,
  index,
  user,
  prevMsg,
  finalRecipientUser,
  partnerUsername,
  contactOrders,
  sellerPackages,
  chatBriefs,
  onImagePreview,
  onReadFullProposal,
  onViewOrder,
  onAcceptOffer,
  onWithdraw,
  onCopyText,
}) => {
  const senderObj =
    (typeof msg.sender === "object" && msg.sender) ||
    (typeof msg.user === "object" && msg.user) ||
    (typeof msg.userID === "object" && msg.userID) ||
    (typeof msg.senderID === "object" && msg.senderID) ||
    msg.sender ||
    msg.user ||
    msg.senderID ||
    msg.userID;
  const senderIdStr = String(senderObj?._id || senderObj?.id || senderObj || "");
  const currentUserIdStr = String(user?._id || user?.id || "");
  const currentUsername = String(user?.username || "").toLowerCase();
  const senderUsername = String(senderObj?.username || msg.username || "").toLowerCase();
  const isOwner = Boolean(
    (currentUserIdStr && senderIdStr && currentUserIdStr === senderIdStr) ||
    (currentUsername && senderUsername && currentUsername === senderUsername)
  );

  const msgRawText = msg.description || msg.desc || msg.text || msg.message || "";
  const offer =
    msg.isCustomOffer || (typeof msgRawText === "string" && msgRawText.includes("[CUSTOM_OFFER]"))
      ? parseOffer(msg.offer || msg.customOffer || msgRawText)
      : msg.offer
      ? parseOffer(msg.offer)
      : null;
  const meeting =
    (typeof msgRawText === "string" && msgRawText.includes("[MEETING_INVITE]")) ||
    msg.meeting ||
    msg.meetingPayload
      ? parseMeeting(msg.meeting || msg.meetingPayload || msgRawText)
      : null;

  const isOfferAccepted = Boolean(msg.isOfferAccepted || msg.offerStatus === "accepted");
  const isWithdrawn = Boolean(msg.withdrawn || msg.offerStatus === "withdrawn");
  const acceptedOrder = offer
    ? contactOrders.find(
        (o: any) =>
          (msg.orderID && (o._id === msg.orderID || o.id === msg.orderID)) ||
          (o.title === offer.desc && Number(o.price) === Number(offer.price))
      )
    : null;
  const targetOrderId = msg.orderID || acceptedOrder?._id || acceptedOrder?.id;
  const isAccepted = isOfferAccepted || Boolean(acceptedOrder);
  const isModerated = Boolean(msg.moderation?.flagged);
  const bubbleModerationClass = isModerated
    ? "!rounded-[10px_10px_10px_0] !border !border-[var(--warning-500,#F00000)] !bg-[#FFF]"
    : "";

  const msgDateKey = moment(msg.createdAt).format("YYYY-MM-DD");
  const prevMsgDateKey = prevMsg ? moment(prevMsg.createdAt).format("YYYY-MM-DD") : null;
  const showDateDivider = msgDateKey !== prevMsgDateKey;
  const isToday = moment(msg.createdAt).isSame(moment(), "day");
  const dateText = isToday ? "Today" : moment(msg.createdAt).format("dddd, MMMM D");

  const renderMessageContent = () => {
    const text = msg.description || msg.desc || msg.text || msg.message || "";
    if (!text) return null;

    const matchedWord = msg.moderation?.matchedWord || "";
    if (msg.moderation?.flagged && matchedWord && matchedWord.trim().length > 0) {
      try {
        const escaped = matchedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escaped})`, "gi");
        const parts = text.split(regex);
        return (
          <p className="text-[13.5px] text-slate-900 m-0 whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word] leading-relaxed">
            {parts.map((part: string, idx: number) =>
              regex.test(part) ? (
                <mark
                  key={idx}
                  className="bg-[#FFE600] text-slate-900 px-0.5 rounded-[2px] font-medium"
                >
                  {part}
                </mark>
              ) : (
                renderMessageTextWithLinks(part)
              )
            )}
          </p>
        );
      } catch {}
    }

    return (
      <p className="text-[13.5px] text-slate-800 m-0 whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word] leading-relaxed">
        {renderMessageTextWithLinks(text)}
      </p>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {showDateDivider && (
        <div className="flex items-center justify-center gap-4 my-2 w-full before:flex-1 before:h-[1px] before:bg-slate-200 after:flex-1 after:h-[1px] after:bg-slate-200">
          <span className="text-xs text-slate-400 font-normal px-1 whitespace-nowrap">
            {dateText}
          </span>
        </div>
      )}
      <div
        className={`flex gap-3 items-end max-w-[85%] sm:max-w-[75%] [overflow-wrap:anywhere] [word-break:break-word] ${
          isOwner ? "self-end justify-end ml-auto" : "self-start mr-auto"
        } ${offer || meeting ? "!max-w-[95%] xl:!max-w-[85%]" : ""}`}
      >
        {!isOwner && (
          <img
            className="w-8 h-8 rounded-full object-cover self-end shrink-0 border border-slate-100"
            src={
              senderObj?.image ||
              finalRecipientUser?.image ||
              "/media/noavatar.png"
            }
            alt=""
          />
        )}

        {offer ? (
          <CustomOfferCard
            offer={offer}
            msg={msg}
            isOwner={isOwner}
            isWithdrawn={isWithdrawn}
            isAccepted={isAccepted}
            targetOrderId={targetOrderId}
            sellerPackages={sellerPackages}
            chatBriefs={chatBriefs}
            onReadFullProposal={onReadFullProposal}
            onViewOrder={onViewOrder}
            onAcceptOffer={onAcceptOffer}
            onWithdraw={onWithdraw}
          />
        ) : meeting ? (
          <MeetingCard
            meeting={meeting}
            finalRecipientUser={finalRecipientUser}
            partnerUsername={partnerUsername}
            onCopyText={onCopyText}
          />
        ) : (
          <>
            <div
              className={`relative px-4 py-3 min-w-[100px] max-w-full shadow-2xs [overflow-wrap:anywhere] [word-break:break-word] ${bubbleModerationClass} ${
                isOwner
                  ? "rounded-[10px_10px_10px_0] border border-[rgba(0,0,0,0.10)] bg-[var(--Foundation-White-white-300,#F5F5F5)]"
                  : "rounded-[10px_10px_10px_0] bg-[#FFF] border-0"
              }`}
            >
              <MessageAttachment msg={msg} onImagePreview={onImagePreview} />
              {renderMessageContent()}
              <span className="text-[11px] text-slate-400 block mt-1">
                {moment(msg.createdAt).format("h:mm A")}
              </span>
            </div>
            {isModerated && (
              <MessageModerationBadge
                moderation={msg.moderation}
                isOwner={isOwner}
                useFlagIcon={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
