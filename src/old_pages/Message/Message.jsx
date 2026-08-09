import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilValue } from "recoil";
import { userState } from "../../atoms";
import { axiosFetch, socket } from '../../utils';
import { Loader } from '../../components';
import moment from 'moment';
import "./Message.scss";

const Message = () => {
  const user = useRecoilValue(userState);
  const { conversationID } = useParams(); // undefined when at /messages
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDelivery, setOfferDelivery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    if (!user?._id) return;
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit('user_connected', user._id);

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on('online_users', handleOnlineUsers);

    return () => {
      socket.off('online_users', handleOnlineUsers);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!conversationID) return;

    socket.emit('join_conversation', conversationID);
    setIsRecipientTyping(false);

    const handleReceiveMessage = (newMsg) => {
      queryClient.setQueryData(['messages', conversationID], (oldData = []) => {
        if (oldData.some(m => m._id === newMsg._id)) return oldData;
        return [...oldData, newMsg];
      });
      queryClient.invalidateQueries(['conversations']);
    };

    const handleUserTyping = (data) => {
      if (data.conversationID === conversationID) {
        setIsRecipientTyping(true);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.conversationID === conversationID) {
        setIsRecipientTyping(false);
      }
    };

    const handleOfferWithdrawn = () => {
      queryClient.invalidateQueries(['messages', conversationID]);
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

  const { isLoading: convsLoading, data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => axiosFetch.get('/conversations').then(({ data }) => data ?? []).catch(() => [])
  });

  useEffect(() => {
    if (!conversationID && conversations.length > 0) {
      navigate(`/message/${conversations[0].conversationID}`, { replace: true });
    }
  }, [conversationID, conversations, navigate]);

  const { isLoading: msgsLoading, data: messages = [] } = useQuery({
    queryKey: ['messages', conversationID],
    queryFn: () =>
      axiosFetch.get(`/messages/${conversationID}`)
        .then(({ data }) => data)
        .catch(() => []),
    enabled: !!conversationID,
    staleTime: 60000,
    refetchInterval: false
  });

  const { data: sellerPackages = [] } = useQuery({
    queryKey: ['seller-packages', user?._id],
    queryFn: () => axiosFetch.get(`/gigs?userID=${user._id}`).then(({ data }) => data),
    enabled: !!user?.isSeller
  });

  const { data: allOrders = [] } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => axiosFetch.get('/orders').then(({ data }) => data),
  });

  const conversation = conversations.find(c => c.conversationID === conversationID);
  const recipientUser = conversation
    ? (user.isSeller ? conversation.buyerID : conversation.sellerID)
    : null;

  const contactOrders = allOrders.filter(o => {
    const sId = o.sellerID?._id || o.sellerID;
    const bId = o.buyerID?._id || o.buyerID;
    return (sId === user._id || bId === user._id) &&
      (sId === recipientUser?._id || bId === recipientUser?._id);
  });

  const mutation = useMutation({
    mutationFn: (msg) => axiosFetch.post('/messages', msg),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', conversationID]);
      queryClient.invalidateQueries(['conversations']);
    }
  });

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    if (conversationID && user?.username) {
      socket.emit('typing_start', { conversationID, username: user.username });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationID, username: user.username });
      }, 2000);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    if (conversationID && user?.username) {
      socket.emit('typing_stop', { conversationID, username: user.username });
    }
    mutation.mutate({ conversationID, description: messageText });
    setMessageText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    if (!selectedPackageId) { toast.error("Select a package first."); return; }
    if (!offerDesc || !offerPrice || !offerDelivery) { toast.error("Fill all fields."); return; }

    const payload = {
      packageID: selectedPackageId,
      price: Number(offerPrice),
      desc: offerDesc,
      delivery: Number(offerDelivery),
      sellerID: user._id
    };
    mutation.mutate({ conversationID, description: `[CUSTOM_OFFER]${JSON.stringify(payload)}` });
    setSelectedPackageId(""); setOfferDesc(""); setOfferPrice(""); setOfferDelivery("");
    setShowOfferModal(false);
    toast.success("Custom offer sent!");
  };

  const handleAcceptOffer = async (offer) => {
    try {
      const { data } = await axiosFetch.post('/orders/create-payment-intent/custom', {
        packageID: offer.packageID,
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
      queryClient.invalidateQueries(['messages', conversationID]);
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
    <div className="message-page">{/* UI omitted for brevity in this example; reuse your existing markup */}
      <div className="inbox-layout">{/* ... */}</div>
    </div>
  );
};

export default Message;
