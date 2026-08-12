// @ts-nocheck
"use client";

import moment from 'moment';
import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";


import { Loader } from "@/components";
import './Messages.scss';

const Messages = () => {
  const user = useUserStore((state: any) => state.user);
  const queryClient = useQueryClient();
  const navigate = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { isLoading, error, data = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () =>
      axiosFetch.get('/conversations')
        .then(({ data }) => Array.isArray(data) ? data : (data?.conversations || data?.data || []))
        .catch((err) => {
          console.log(err?.response || err);
          return [];
        })
  })

  const mutation = useMutation({
    mutationFn: (id) =>
      axiosFetch.patch(`/conversations/${id}`)
    ,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
  })

  const handleMessageRead = (id) => {
    mutation.mutate(id);
  }

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
            ? <div className='loader'> <Loader size={45} /> </div>
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
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        data.map((conv) => {
                          const isUnread = (user?.isSeller && !conv.readBySeller) || (!user?.isSeller && !conv.readByBuyer);
                          return (
                            <tr
                              key={conv._id}
                              onClick={() => navigate.push(`/message/${conv.conversationID}`)}
                              className={`clickable-row ${isUnread ? "unread-row" : ""}`}
                            >
                              <td className="user-cell">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={(user?.isSeller ? conv.buyerID?.image : conv.sellerID?.image) || "/media/noavatar.png"}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <span>{user?.isSeller ? conv.buyerID?.username : conv.sellerID?.username}</span>
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
                                    return msg;
                                  })()}
                                </span>
                              </td>
                              <td className="date-cell">{moment(conv.updatedAt).fromNow()}</td>
                              <td>
                                {
                                  isUnread && (
                                    <button
                                      className="read-btn"
                                      onClick={(e: any) => {
                                        e.stopPropagation();
                                        handleMessageRead(conv.conversationID);
                                      }}
                                    >
                                      Mark as read
                                    </button>
                                  )
                                }
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