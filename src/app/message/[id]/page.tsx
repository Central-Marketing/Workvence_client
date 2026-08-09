// @ts-nocheck
"use client";

import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  RiSearchLine,
  RiCheckboxCircleFill,
  RiStarFill,
  RiPhoneLine,
  RiMore2Fill,
  RiCheckDoubleLine,
  RiAddLine,
  RiEmotionLine,
  RiSendPlaneFill,
  RiTimeLine,
  RiRefreshLine,
  RiLineChartLine,
  RiMoneyDollarCircleLine
} from "react-icons/ri";

import axios from 'axios';
import { axiosFetch, socket } from "@/utils";
import { isConversationUnread } from '@/utils/chatHelpers';
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
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedBriefId, setSelectedBriefId] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDelivery, setOfferDelivery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [partnerUsername, setPartnerUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  // Fetch all conversations
  const { isLoading: convsLoading, data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axiosFetch.get('/conversations').then(({ data }) => Array.isArray(data) ? data : (data?.conversations || data?.data || [])).catch(() => [])
  });

  // Auto-navigate to first conversation if none selected
  useEffect(() => {
    if (!conversationID && conversations.length > 0) {
      navigate.push(`/message/${conversations[0].conversationID}`, { replace: true });
    }
  }, [conversationID, conversations, navigate]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (conversationID) {
      // 1. Update local cache immediately to clear unread dots instantly
      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        return oldConvs.map((c: any) => {
          if (c.id === conversationID || c.conversationID === conversationID || c._id === conversationID) {
            return {
              ...c,
              readBySeller: true,
              readByBuyer: true
            };
          }
          return c;
        });
      });

      // 2. Patch backend
      axiosFetch.patch(`/conversations/${conversationID}`)
        .then(() => queryClient.invalidateQueries({ queryKey: ['conversations'] }))
        .catch(console.error);
    }
  }, [conversationID, queryClient]);

  // Socket: global connection and online users
  useEffect(() => {
    if (!user?._id) return;
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('user_connected', user._id);

    const handleOnlineUsers = (users: any) => setOnlineUsers(users);
    
    // Global listener for new messages to update the sidebar/header even if in a different chat
    const handleGlobalReceiveMessage = (newMsg: any) => {
      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        return oldConvs.map((c: any) => {
          if (c.id === newMsg.conversationID || c.conversationID === newMsg.conversationID || c._id === newMsg.conversationID) {
            const isCurrentlyViewingThisChat = window.location.pathname.includes(`/message/${newMsg.conversationID}`);
            return {
              ...c,
              lastMessage: newMsg.description,
              updatedAt: new Date().toISOString(),
              readBySeller: user?.isSeller ? isCurrentlyViewingThisChat : c.readBySeller,
              readByBuyer: !user?.isSeller ? isCurrentlyViewingThisChat : c.readByBuyer
            };
          }
          return c;
        }).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    socket.on('online_users', handleOnlineUsers);
    socket.on('receive_message', handleGlobalReceiveMessage);

    return () => {
      socket.off('online_users', handleOnlineUsers);
      socket.off('receive_message', handleGlobalReceiveMessage);
    };
  }, [user?._id, queryClient]);

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

    const handleReceiveMessage = (newMsg: any) => {
      // 1. Update current chat messages
      queryClient.setQueryData(['messages', conversationID], (oldData: any = []) => {
        if (oldData.some((m: any) => m._id === newMsg._id)) return oldData;
        return [...oldData, newMsg];
      });

      // 2. Instantly update conversation sidebar and header unread badge
      queryClient.setQueryData(['conversations'], (oldConvs: any) => {
        if (!Array.isArray(oldConvs)) return oldConvs;
        return oldConvs.map((c: any) => {
          if (c.id === newMsg.conversationID || c.conversationID === newMsg.conversationID || c._id === newMsg.conversationID) {
            const isCurrentlyViewingThisChat = conversationID === newMsg.conversationID;
            return {
              ...c,
              lastMessage: newMsg.description,
              updatedAt: new Date().toISOString(),
              readBySeller: user?.isSeller ? isCurrentlyViewingThisChat : c.readBySeller,
              readByBuyer: !user?.isSeller ? isCurrentlyViewingThisChat : c.readByBuyer
            };
          }
          return c;
        }).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    };

    const handleUserTyping = (data) => {
      if (data.conversationID === conversationID) {
        setIsRecipientTyping(true);
        setPartnerUsername(data.username);
      }
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

  // Seller's packages
  const { data: sellerPackages = [] } = useQuery({
    queryKey: ['seller-packages', user?._id],
    queryFn: () => axiosFetch.get(`/gigs?userID=${user._id}`).then(({ data }) => data ?? []).catch(() => []),
    enabled: !!user?.isSeller
  });

  // Chat-linked briefs (always fetch when chat opens)
  const serverApiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:8080/api';
  const { data: chatBriefs = [] } = useQuery({
    queryKey: ['chat-briefs', conversationID, conversations.length],
    queryFn: async () => {
      const parseResponse = (data: any) => {
        if (Array.isArray(data)) return data;
        if (data?.briefs && Array.isArray(data.briefs)) return data.briefs;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (data?._id) return [data];
        if (data?.brief) return [data.brief];
        return [];
      };

      try {
        const { data } = await axiosFetch.get(`/briefs/chat-briefs/${conversationID}`);
        return parseResponse(data);
      } catch (err) {
        console.warn("Failed fetching briefs with conversationID", err);
        return [];
      }
    },
    enabled: !!conversationID
  });

  // Shared orders
  const { data: allOrders = [] } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => axiosFetch.get('/orders').then(({ data }) => data ?? []).catch(() => []),
  });

  const conversation = conversations.find((c: any) =>
    c.conversationID === conversationID || c.id === conversationID || c._id === conversationID
  );
  const recipientUser = conversation
    ? (user?.isSeller ? conversation.buyerID : conversation.sellerID)
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

  const stopTypingIndicator = () => {
    if (isTypingRef.current && conversationID && user?.username) {
      isTypingRef.current = false;
      socket.emit("typing_stop", {
        conversationID,
        username: user.username
      });
    }
  };

  const handleSend = (e: any) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    // Immediately stop typing indicator
    clearTimeout(typingTimeoutRef.current);
    stopTypingIndicator();

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
    const value = e.target.value;
    setMessageText(value);
    
    if (conversationID && user?.username) {
      // Emit 'typing_start' on first keystroke
      if (!isTypingRef.current && value.length > 0) {
        isTypingRef.current = true;
        socket.emit("typing_start", {
          conversationID,
          username: user.username
        });
      }
      
      // Reset 2-second timer on every keypress
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTypingIndicator();
      }, 2000);
    }
  };

  const handleOfferSubmit = (e: any) => {
    e.preventDefault();
    if (!selectedPackageId && !selectedBriefId) { toast.error("Select at least a Package or a Brief."); return; }
    if (!offerDesc || !offerPrice || !offerDelivery) { toast.error("Fill all fields."); return; }

    const payload: any = {
      price: Number(offerPrice),
      desc: offerDesc,
      delivery: Number(offerDelivery),
      sellerID: user._id
    };
    if (selectedPackageId) payload.packageID = selectedPackageId;
    if (selectedBriefId) payload.briefID = selectedBriefId;

    mutation.mutate({ conversationID, description: `[CUSTOM_OFFER]${JSON.stringify(payload)}` });
    setSelectedPackageId(""); setSelectedBriefId(""); setOfferDesc(""); setOfferPrice(""); setOfferDelivery("");
    setShowOfferModal(false);
    toast.success("Custom offer sent!");
  };

  const handleAcceptOffer = async (offer) => {
    try {
      const { data } = await axiosFetch.post('/orders/create-payment-intent/custom', {
        packageID: offer.packageID,
        briefID: offer.briefID,
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

  const activeConv = conversations.find((c: any) => c.conversationID === conversationID || c.id === conversationID || c._id === conversationID);
  const isReadByRecipient = user?.isSeller ? activeConv?.readByBuyer : activeConv?.readBySeller;

  return (
    <div className="message-page">
      <div className="inbox-layout">

        {/* ── LEFT: Conversation List ── */}
        <aside className="conversation-list">
          <div className="inbox-header">
            <div className="search-bar">
              <RiSearchLine className="search-icon" />
              <input type="text" placeholder="What are you looking for?" />
            </div>
            <div className="filters">
              <span className="filter-pill active">All</span>
              <span className="filter-pill">Gig inbox</span>
              <span className="filter-pill">Bid inbox</span>
              <span className="filter-pill">Unread</span>
              <span className="filter-pill">Favorites</span>
            </div>
          </div>
          <div className="conv-items">
            {convsLoading ? (
              <div className="list-loader"><Loader size={28} /></div>
            ) : conversations.length === 0 ? (
              <div className="list-empty">No conversations yet</div>
            ) : conversations.map((conv: any) => {
              const isUnread = isConversationUnread(conv, user);
              const contact = user.isSeller ? conv.buyerID : conv.sellerID;
              const lastMsg = conv.lastMessage?.startsWith('[CUSTOM_OFFER]')
                ? '📋 Custom Offer'
                : conv.lastMessage || 'No messages yet';
              const isActive = conv.conversationID === conversationID || conv.id === conversationID || conv._id === conversationID;

              return (
                <div
                  key={conv._id}
                  className={`conv-item ${isActive ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                  onClick={() => navigate.push(`/message/${conv.conversationID}`)}
                >
                  <div className="conv-avatar">
                    <img src={contact?.image || '/media/noavatar.png'} alt="" />
                  </div>
                  <div className="conv-info">
                    <div className="conv-name">
                      {contact?.username || 'User'}
                      <RiCheckboxCircleFill className="verified-badge" />
                    </div>
                    <p className="conv-preview">{lastMsg}</p>
                  </div>
                  <div className="conv-meta">
                    <span className="conv-time">{moment(conv.updatedAt).format('HH:mm')}</span>
                    <div className="conv-meta-icons">
                      <RiStarFill className="star-icon" />
                      {isUnread && <span className="unread-dot"></span>}
                    </div>
                  </div>
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
                  <>
                    <div className="head-user">
                      <div className="head-avatar">
                        <img src={recipientUser.image || '/media/noavatar.png'} alt="" />
                      </div>
                      <div className="head-info">
                        <h3>{recipientUser.username}</h3>
                        <span className="head-status">last seen 5 mins ago</span>
                      </div>
                    </div>
                    <div className="head-actions">
                      <button className="action-icon"><RiSearchLine /></button>
                      <button className="action-icon"><RiPhoneLine /></button>
                      <button className="action-icon"><RiMore2Fill /></button>
                    </div>
                  </>
                ) : <h3>Conversation</h3>}
              </div>

              {/* Messages */}
              <div className="messages-scroll">
                {msgsLoading ? (
                  <div className="scroll-loader"><Loader size={32} /></div>
                ) : messages.length === 0 ? (
                  <div className="scroll-empty">Send the first message!</div>
                ) : messages.map((msg: any, index: number) => {
                  const isOwner = user?._id && ((msg.userID?._id || msg.userID) === user._id);
                  const offer = parseOffer(msg.description);
                  const msgDate = moment(msg.createdAt).format('MMM DD');
                  const prevMsgDate = index > 0 ? moment(messages[index - 1].createdAt).format('MMM DD') : null;
                  const showDateDivider = msgDate !== prevMsgDate;

                  return (
                    <div key={msg._id} className="msg-wrapper">
                      {showDateDivider && (
                        <div className="date-separator">
                          <span className="date-pill">{msgDate === moment().format('MMM DD') ? 'Today' : msgDate}</span>
                        </div>
                      )}
                      <div className={`msg-row ${isOwner ? 'msg-owner' : 'msg-other'}`}>
                        {!isOwner && (
                          <img className="msg-avatar" src={msg.userID?.image || recipientUser?.image || '/media/noavatar.png'} alt="" />
                        )}

                        {offer ? (
                          <div className={`offer-card ${msg.withdrawn ? 'withdrawn' : ''}`}>
                            {msg.withdrawn ? (
                              <p className="withdrawn-text">↩ This offer was withdrawn by the seller.</p>
                            ) : (
                              <div className="offer-content">
                                <div className="offer-seller-info">
                                  <img src={msg.userID?.image || '/media/noavatar.png'} alt="" />
                                  <div className="offer-seller-text">
                                    <strong>{msg.userID?.username || 'Seller'} <RiCheckboxCircleFill className="verified-badge" /></strong>
                                    <span>⭐ 5.0 (42)</span>
                                  </div>
                                </div>
                                <div className="offer-details-grid">
                                  <div className="offer-stat">
                                    <span className="stat-label"><RiMoneyDollarCircleLine /> BID</span>
                                    <span className="stat-val">${offer.price}</span>
                                  </div>
                                  <div className="offer-stat">
                                    <span className="stat-label"><RiTimeLine /> DELIVERY</span>
                                    <span className="stat-val">{offer.delivery} Days</span>
                                  </div>
                                  <div className="offer-stat">
                                    <span className="stat-label"><RiRefreshLine /> REVISIONS</span>
                                    <span className="stat-val">3</span>
                                  </div>
                                  <div className="offer-stat">
                                    <span className="stat-label"><RiLineChartLine /> SUCCESS</span>
                                    <span className="stat-val">98%</span>
                                  </div>
                                </div>
                                <div className="offer-actions">
                                  {!user?.isSeller && (
                                    <button className="accept-btn" onClick={() => handleAcceptOffer(offer)}>Accept Proposal</button>
                                  )}
                                  {user?.isSeller && isOwner && (
                                    <button className="withdraw-btn" onClick={() => handleWithdraw(msg._id)}>Withdraw Offer</button>
                                  )}
                                  <button className="view-btn">View Proposal</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="msg-bubble">
                            <p>{msg.description}</p>
                            <span className="msg-time">
                              {moment(msg.createdAt).format('HH:mm')}
                              {isOwner && <RiCheckDoubleLine className={`check-icon ${isReadByRecipient ? 'read' : ''}`} />}
                            </span>
                          </div>
                        )}
                        {isOwner && (
                          <img className="msg-avatar" src={user?.image || '/media/noavatar.png'} alt="" />
                        )}
                      </div>
                    </div>
                  );
                })}
                {isRecipientTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 pl-14 italic mb-4">
                    <span className="flex gap-[3px]">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </span>
                    💬 {partnerUsername || recipientUser?.username || 'User'} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose Area */}
              <div className="compose-area">
                <form onSubmit={handleSend} className="compose-form">
                  <button type="button" className="icon-btn"><RiAddLine /></button>
                  <button type="button" className="icon-btn"><RiEmotionLine /></button>
                  <input 
                    type="text" 
                    placeholder="Message" 
                    value={messageText} 
                    onChange={handleInputChange} 
                    onKeyDown={handleKeyDown} 
                  />
                  {user?.isSeller && (
                    <button type="button" className="offer-btn-small" onClick={() => setShowOfferModal(true)}>
                      Create Offer
                    </button>
                  )}
                  <button type="submit" className="send-btn" disabled={!messageText.trim()}>
                    <RiSendPlaneFill />
                  </button>
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
                <label>Package Reference <span className="text-xs text-gray-400">(optional)</span></label>
                <select value={selectedPackageId} onChange={e => setSelectedPackageId(e.target.value)}>
                  <option value="">-- Select one of your Packages --</option>
                  {sellerPackages.map((g: any) => <option key={g._id} value={g._id}>{g.title}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Brief Reference <span className="text-xs text-gray-400">(optional)</span></label>
                <select value={selectedBriefId} onChange={e => setSelectedBriefId(e.target.value)}>
                  <option value="">-- Select a Brief --</option>
                  {chatBriefs.length === 0
                    ? <option disabled>No briefs available for this chat</option>
                    : chatBriefs.map((b: any) => <option key={b._id} value={b._id}>{b.title} — ${b.budget}</option>)
                  }
                </select>
              </div>
              {!selectedPackageId && !selectedBriefId && (
                <p className="text-amber-600 text-xs mt-1">⚠ Please select at least a Package or a Brief</p>
              )}
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