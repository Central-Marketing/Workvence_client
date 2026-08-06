// @ts-nocheck
"use client";

import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


import { axiosFetch, socket } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import moment from 'moment';
import "./Message.scss";

const Message = () => {
  const user = useUserStore((state: any) => state.user);
  const params = useParams();
  const conversationID = (params?.id || params?.conversationID) as string;
  const queryClient = useQueryClient();
  const navigate = useRouter();
  const messagesEndRef = useRef(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedGigId, setSelectedGigId] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDelivery, setOfferDelivery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  // Fetch all conversations
  const { isLoading: convsLoading, data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axiosFetch.get('/conversations').then(({ data }) => data ?? []).catch(() => [])
  });

  // Auto-navigate to first conversation if none selected
  useEffect(() => {
    if (!conversationID && conversations.length > 0) {
      navigate.push(`/message/${conversations[0].conversationID}`, { replace: true });
    }
  }, [conversationID, conversations, navigate]);

  // Socket: global connection and online users
  useEffect(() => {
    if (!user?._id) return;
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('user_connected', user._id);

    const handleOnlineUsers = (users) => setOnlineUsers(users);
    socket.on('online_users', handleOnlineUsers);

    return () => {
      socket.off('online_users', handleOnlineUsers);
    };
  }, [user?._id]);

  // Fetch messages for active conversation
  const { isLoading: msgsLoading, data: messages = [] } = useQuery({
    queryKey: ['messages', conversationID],
    queryFn: () =>
      axiosFetch.get(`/messages/${conversationID}`)
        .then(({ data }) => Array.isArray(data) ? data : (data?.messages || []))
        .catch(() => []),
    enabled: !!conversationID,
    refetchInterval: 3000
  });

  // Manage room subscription & realtime events for active conversation
  useEffect(() => {
    if (!conversationID) return;

    socket.emit('join_conversation', conversationID);
    setIsRecipientTyping(false);

    const handleReceiveMessage = (newMsg) => {
      queryClient.setQueryData(['messages', conversationID], (oldData = []) => {
        if (oldData.some(m => m._id === newMsg._id)) return oldData;
        return [...oldData, newMsg];
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleUserTyping = (data) => {
      if (data.conversationID === conversationID) setIsRecipientTyping(true);
    };

    const handleUserStoppedTyping = (data) => {
      if (data.conversationID === conversationID) setIsRecipientTyping(false);
    };

    const handleOfferWithdrawn = () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationID] });
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);
    socket.on('offer_withdrawn', handleOfferWithdrawn);

    return () => {
      socket.emit('leave_conversation', conversationID);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      socket.off('offer_withdrawn', handleOfferWithdrawn);
    };
  }, [conversationID, queryClient]);

  // Seller's gigs
  const { data: sellerGigs = [] } = useQuery({
    queryKey: ['seller-gigs', user?._id],
    queryFn: () => axiosFetch.get(`/gigs?userID=${user._id}`).then(({ data }) => data ?? []).catch(() => []),
    enabled: !!user?.isSeller
  });

  // Shared orders
  const { data: allOrders = [] } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => axiosFetch.get('/orders').then(({ data }) => data ?? []).catch(() => []),
  });

  const conversation = conversations.find((c: any) => c.conversationID === conversationID);
  const recipientUser = conversation
    ? (user.isSeller ? conversation.buyerID : conversation.sellerID)
    : null;

  const contactOrders = allOrders.filter((o: any) => {
    const sId = o.sellerID?._id || o.sellerID;
    const bId = o.buyerID?._id || o.buyerID;
    return (sId === user._id || bId === user._id) &&
      (sId === recipientUser?._id || bId === recipientUser?._id);
  });

  const mutation = useMutation({
    mutationFn: (msg) => axiosFetch.post('/messages', msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationID] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    if (conversationID && user?.username) {
      socket.emit('typing_stop', { conversationID, username: user.username });
    }
    mutation.mutate({ conversationID, description: messageText });
    setMessageText("");
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleInputChange = (e: any) => {
    setMessageText(e.target.value);
    if (conversationID && user?.username) {
      socket.emit('typing_start', { conversationID, username: user.username });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationID, username: user.username });
      }, 2000);
    }
  };

  const handleOfferSubmit = (e: any) => {
    e.preventDefault();
    if (!selectedGigId) { toast.error("Select a gig first."); return; }
    if (!offerDesc || !offerPrice || !offerDelivery) { toast.error("Fill all fields."); return; }

    const payload = {
      gigID: selectedGigId,
      price: Number(offerPrice),
      desc: offerDesc,
      delivery: Number(offerDelivery),
      sellerID: user._id
    };
    mutation.mutate({ conversationID, description: `[CUSTOM_OFFER]${JSON.stringify(payload)}` });
    setSelectedGigId(""); setOfferDesc(""); setOfferPrice(""); setOfferDelivery("");
    setShowOfferModal(false);
    toast.success("Custom offer sent!");
  };

  const handleAcceptOffer = async (offer) => {
    try {
      const { data } = await axiosFetch.post('/orders/create-payment-intent/custom', {
        gigID: offer.gigID,
        customPrice: offer.price,
        customTitle: offer.desc,
        sellerID: offer.sellerID,
        delivery: offer.delivery
      });
      if (data.url) window.location.href = data.url;
    } catch { toast.error("Failed to initiate payment."); }
  };

  const handleWithdraw = async (msgId) => {
    try {
      await axiosFetch.patch(`/messages/withdraw/${msgId}`);
      toast.success("Offer withdrawn.");
      queryClient.invalidateQueries({ queryKey: ['messages', conversationID] });
    } catch { toast.error("Failed to withdraw."); }
  };

  const parseOffer = (desc) => {
    if (desc?.startsWith('[CUSTOM_OFFER]')) {
      try { return JSON.parse(desc.replace('[CUSTOM_OFFER]', '')); } catch { return null; }
    }
    return null;
  };

  const fmt = (d) => moment(d).format('MMM DD, HH:mm');

  return (
    <div className="message-page">
      <div className="inbox-layout">

        {/* ── LEFT: Conversation List ── */}
        <aside className="conversation-list">
          <div className="inbox-header">
            <h2>Inbox</h2>
            <span className="inbox-count">{conversations.length}</span>
          </div>
          <div className="conv-items">
            {convsLoading ? (
              <div className="list-loader"><Loader size={28} /></div>
            ) : conversations.length === 0 ? (
              <div className="list-empty">No conversations yet</div>
            ) : conversations.map((conv: any) => {
              const isUnread = (user.isSeller && !conv.readBySeller) || (!user.isSeller && !conv.readByBuyer);
              const contact = user.isSeller ? conv.buyerID : conv.sellerID;
              const lastMsg = conv.lastMessage?.startsWith('[CUSTOM_OFFER]')
                ? '📋 Custom Offer'
                : conv.lastMessage || 'No messages yet';
              const isActive = conv.conversationID === conversationID;

              return (
                <div
                  key={conv._id}
                  className={`conv-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                  onClick={() => navigate.push(`/message/${conv.conversationID}`)}
                >
                  <div className="conv-avatar">
                    <img src={contact?.image || '/media/noavatar.png'} alt="" />
                    <span className="online-dot" />
                  </div>
                  <div className="conv-info">
                    <div className="conv-meta">
                      <span className="conv-name">{contact?.username || 'User'}</span>
                      <span className="conv-time">{moment(conv.updatedAt).fromNow()}</span>
                    </div>
                    <p className="conv-preview">{lastMsg}</p>
                  </div>
                  {isUnread && <span className="unread-dot" />}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── CENTER: Chat Window ── */}
        <main className="chat-window">
          {!conversationID ? (
            <div className="chat-empty-state">
              <div className="empty-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose from your inbox on the left to start chatting</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="chat-head">
                {recipientUser ? (
                  <div className="head-user">
                    <div className="head-avatar">
                      <img src={recipientUser.image || '/media/noavatar.png'} alt="" />
                      <span className="online-dot" />
                    </div>
                    <div>
                      <h3>{recipientUser.username}</h3>
                      <span className="head-country">{recipientUser.country || 'United States'}</span>
                    </div>
                  </div>
                ) : <h3>Conversation</h3>}
              </div>

              {/* Messages */}
              <div className="messages-scroll">
                {msgsLoading ? (
                  <div className="scroll-loader"><Loader size={32} /></div>
                ) : messages.length === 0 ? (
                  <div className="scroll-empty">Send the first message!</div>
                ) : messages.map((msg: any) => {
                  const isOwner = user?._id && ((msg.userID?._id || msg.userID) === user._id);
                  const offer = parseOffer(msg.description);

                  return (
                    <div key={msg._id} className={`msg-row ${isOwner ? 'msg-owner' : 'msg-other'}`}>
                      {!isOwner && (
                        <img className="msg-avatar" src={msg.userID?.image || '/media/noavatar.png'} alt="" />
                      )}

                      {offer ? (
                        <div className={`offer-card ${msg.withdrawn ? 'withdrawn' : ''}`}>
                          {msg.withdrawn ? (
                            <p className="withdrawn-text">↩ This offer was withdrawn by the seller.</p>
                          ) : (
                            <>
                              <div className="offer-head">
                                <div className="offer-head-left">
                                  <span className="offer-label">Here's your Custom Offer</span>
                                  <h4>{offer.desc}</h4>
                                </div>
                                <span className="offer-price">US${offer.price}</span>
                              </div>
                              <hr />
                              <div className="offer-meta">
                                <span>🕐 {offer.delivery} Days Delivery</span>
                              </div>
                              <p className="offer-sent">Sent {fmt(msg.createdAt)}</p>
                              {!user?.isSeller && (
                                <button className="accept-btn" onClick={() => handleAcceptOffer(offer)}>
                                  Accept &amp; Pay Offer
                                </button>
                              )}
                              {user?.isSeller && isOwner && (
                                <button className="withdraw-btn" onClick={() => handleWithdraw(msg._id)}>
                                  Withdraw Offer
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="msg-bubble">
                          <p>{msg.description}</p>
                          <span className="msg-time">{fmt(msg.createdAt)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose — pinned to bottom */}
              <div className="compose-area">
                <form onSubmit={handleSend}>
                  <textarea
                    placeholder="Write a message…"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    maxLength={2500}
                  />
                  <div className="compose-footer">
                    <span className="char-count">{messageText.length}/2500</span>
                    <div className="compose-btns">
                      {user.isSeller && (
                        <button type="button" className="offer-btn" onClick={() => setShowOfferModal(true)}>
                          Create an Offer
                        </button>
                      )}
                      <button type="submit" className="send-btn" disabled={!messageText.trim()}>
                        Send ↗
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}
        </main>

        {/* ── RIGHT: About This Contact ── */}
        {recipientUser && (
          <aside className="contact-sidebar">
            <div className="sidebar-user">
              <img src={recipientUser.image || '/media/noavatar.png'} alt="" />
              <h4>{recipientUser.username}</h4>
              <span>{recipientUser.country || 'United States'}</span>
            </div>
            <hr />
            <div className="sidebar-section">
              <h5>About</h5>
              {recipientUser.description && (
                <p className="contact-bio">{recipientUser.description}</p>
              )}
              <div className="detail-row">
                <span>Member since</span>
                <span>{moment(recipientUser.createdAt).format('MMM YYYY')}</span>
              </div>
            </div>
            {contactOrders.length > 0 && (
              <>
                <hr />
                <div className="sidebar-section">
                  <h5>Orders together <em>({contactOrders.length})</em></h5>
                  {contactOrders.slice(0, 3).map((o: any) => (
                    <div key={o._id} className="sidebar-order" onClick={() => navigate.push(`/orders/${o._id}`)}>
                      <img src={o.image || '/media/noavatar.png'} alt="" />
                      <div>
                        <p>{o.title}</p>
                        <span className={`mini-pill ${o.status || 'paid'}`}>
                          {o.status === 'completed' ? 'Completed' : o.status === 'delivered' ? 'Delivered' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </aside>
        )}
      </div>

      {/* Custom Offer Modal */}
      {showOfferModal && (
        <div className="modal-backdrop" onClick={() => setShowOfferModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Create Custom Offer</h3>
              <button onClick={() => setShowOfferModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleOfferSubmit} className="offer-form">
              <div className="fg">
                <label>Gig Reference</label>
                <select value={selectedGigId} onChange={e => setSelectedGigId(e.target.value)} required>
                  <option value="">-- Select one of your Gigs --</option>
                  {sellerGigs.map((g: any) => <option key={g._id} value={g._id}>{g.title}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Offer Description</label>
                <textarea placeholder="Describe the service…" value={offerDesc} onChange={e => setOfferDesc(e.target.value)} rows={3} required />
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label>Price (USD)</label>
                  <input type="number" placeholder="150" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} required min="1" />
                </div>
                <div className="fg">
                  <label>Delivery (Days)</label>
                  <input type="number" placeholder="3" value={offerDelivery} onChange={e => setOfferDelivery(e.target.value)} required min="1" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit">Send Offer</button>
                <button type="button" className="cancel" onClick={() => setShowOfferModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;