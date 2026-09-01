"use client";

import moment from 'moment';
import React, { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Conversation } from "@/types";

import { Loader, Skeleton } from "@/components";
import './Messages.scss';

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
        })
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
      <div className='messages'>
        <div className="container">
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h2>Please log in to view your messages</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='messages'>
      <div className="container">
        {
          isLoading
            ? (
              <div className="card space-y-4 p-6">
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
              ? <div className="error-message">Something went wrong!</div>
              : <div className="card">
                <div className="card-header">
                  <h1>Conversations</h1>
                  <p>Interact with your active buyers and sellers</p>
                </div>

                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>{user?.isSeller ? 'Buyer' : 'Seller'}</th>
                        <th>Last Message</th>
                        <th>Date</th>
                        {/* <th>Action</th> */}
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
                              className={`clickable-row ${isUnread ? "unread-row" : ""}`}
                            >
                              <td className="user-cell">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={((user?.isSeller ? (conv.buyerID as any)?.image : (conv.sellerID as any)?.image) || (user?.isSeller ? (conv.buyerID as any)?.img : (conv.sellerID as any)?.img)) || "/media/noavatar.png"}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <span>{user?.isSeller ? (conv.buyerID as any)?.username : (conv.sellerID as any)?.username}</span>
                                </div>
                              </td>
                              <td className="msg-cell">
                                <span className="last-msg">
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
                              <td className="date-cell">{moment(conv.updatedAt).fromNow()}</td>
                              {/* <td>
                                {
                                  isUnread && targetId && (
                                    <button
                                      className="read-btn"
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        handleMessageRead(targetId);
                                      }}
                                    >
                                      Mark as read
                                    </button>
                                  )
                                }
                              </td> */}
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