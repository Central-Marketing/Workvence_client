"use client";

import moment from 'moment';
import React, { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Conversation } from "@/types";

import { Loader, Skeleton } from "@/components";

const Messages = () => {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const navigate = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isLoading, error, data = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () =>
      axiosFetch.get('/conversations')
        .then(({ data }) => Array.isArray(data) ? data : (data?.conversations || data?.data || []))
        .catch((err) => {
          console.log(err?.response || err);
          return [];
        }),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const mutation = useMutation({
    mutationFn: (id: string) =>
      axiosFetch.patch(`/conversations/${id}/mark-read`).catch(() => axiosFetch.patch(`/conversations/${id}`)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
  });

  const handleMessageRead = (id: string) => {
    mutation.mutate(id);
  };

  if (!user) {
    return (
      <div className="flex justify-center bg-[#f8fafc] py-10 min-h-[80vh]">
        <div className="w-[90%] max-w-[1200px] flex flex-col gap-[30px]">
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-sm overflow-hidden p-[60px_20px] text-center">
            <h2 className="text-xl font-semibold text-[#0f172a]">Please log in to view your messages</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-[#f8fafc] py-10 min-h-[80vh]">
      <div className="w-[90%] max-w-[1200px] flex flex-col gap-[30px]">
        {
          isLoading
            ? (
              <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-sm overflow-hidden space-y-4 p-6">
                <Skeleton className="w-48 h-8" />
                <Skeleton className="w-64 h-4 mb-6" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <Skeleton className="w-32 h-4" />
                    </div>
                    <Skeleton className="w-48 h-4 hidden md:block" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                ))}
              </div>
            )
            : error
              ? <div className="text-red-500 font-medium">Something went wrong!</div>
              : <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-sm overflow-hidden">
                <div className="p-6 sm:px-[30px] border-b border-[#e2e8f0] bg-white">
                  <h1 className="text-[24px] font-bold text-[#0f172a] mb-1.5">Conversations</h1>
                  <p className="text-[14px] text-[#64748b]">Interact with your active buyers and sellers</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr>
                        <th className="px-5 py-4 text-[#64748b] font-semibold text-[13px] uppercase border-b border-[#f1f5f9] bg-[#f8fafc]">
                          {user?.isSeller ? 'Buyer' : 'Seller'}
                        </th>
                        <th className="px-5 py-4 text-[#64748b] font-semibold text-[13px] uppercase border-b border-[#f1f5f9] bg-[#f8fafc]">
                          Last Message
                        </th>
                        <th className="px-5 py-4 text-[#64748b] font-semibold text-[13px] uppercase border-b border-[#f1f5f9] bg-[#f8fafc]">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        data.map((conv) => {
                          const targetId = conv.uuid || conv.conversationID || conv._id;
                          const isUnread = (user?.isSeller && !conv.readBySeller) || (!user?.isSeller && !conv.readByBuyer);
                          return (
                            <tr
                              key={conv._id || targetId}
                              onClick={() => {
                                if (targetId && targetId !== 'undefined') {
                                  navigate.push(`/message/${targetId}`);
                                }
                              }}
                              className={`cursor-pointer transition-colors duration-200 hover:bg-[#f8fafc] ${isUnread ? "!bg-[#f0fdf4]" : ""}`}
                            >
                              <td className={`p-5 border-b border-[#f1f5f9] align-middle text-[14px] text-[#1e293b] ${isUnread ? "!font-semibold !text-[#0f172a]" : "font-semibold"}`}>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={((user?.isSeller ? (conv.buyerID as any)?.image : (conv.sellerID as any)?.image) || (user?.isSeller ? (conv.buyerID as any)?.img : (conv.sellerID as any)?.img)) || "/media/noavatar.png"}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <span>{user?.isSeller ? (conv.buyerID as any)?.username : (conv.sellerID as any)?.username}</span>
                                </div>
                              </td>
                              <td className={`p-5 border-b border-[#f1f5f9] align-middle text-[14px] max-w-[400px] ${isUnread ? "!font-semibold !text-[#0f172a]" : ""}`}>
                                <span className="text-[#475569] block overflow-hidden text-ellipsis whitespace-nowrap">
                                  {(() => {
                                    const msg = conv?.lastMessage;
                                    if (!msg) return "No messages yet";
                                    if (msg.startsWith('[CUSTOM_OFFER]')) {
                                      try {
                                        const offer = JSON.parse(msg.replace('[CUSTOM_OFFER]', ''));
                                        return `✉ Custom Offer Proposal - $${offer.price}: ${offer.desc}`;
                                      } catch (err) {
                                        return "✉ Custom Offer Proposal";
                                      }
                                    }
                                    if (msg.startsWith('[MEETING_INVITE]')) {
                                      try {
                                        const meet = JSON.parse(msg.replace('[MEETING_INVITE]', ''));
                                        return `📹 Video Meeting: ${meet.title || 'Freelancer Job Discussion'}`;
                                      } catch (err) {
                                        return "📹 Video Meeting Invitation";
                                      }
                                    }
                                    return msg;
                                  })()}
                                </span>
                              </td>
                              <td className={`p-5 border-b border-[#f1f5f9] align-middle text-[14px] text-[#64748b] ${isUnread ? "!font-semibold !text-[#0f172a]" : ""}`}>
                                {moment(conv.updatedAt).fromNow()}
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
        }
      </div>
    </div>
  )
}

export default Messages;