// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import toast from "react-hot-toast";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader } from "@/components";
import "./Proposals.scss";

const Proposals = () => {
  const router = useRouter();
  const params = useParams();
  const briefId = params.id;
  const user = useUserStore((state) => state.user);

  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch proposals
  const { isLoading, data: proposals = [] } = useQuery({
    queryKey: ["brief-proposals", briefId],
    queryFn: () =>
      axiosFetch
        .get(`/briefs/${briefId}/proposals`)
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.proposals)) return data.proposals;
          if (Array.isArray(data?.data)) return data.data;
          return [];
        })
        .catch(() => []),
    enabled: !!briefId,
  });

  // AI Recommendation
  const aiMutation = useMutation({
    mutationFn: () =>
      axiosFetch
        .get(`/briefs/${briefId}/ai-recommendation`)
        .then(({ data }) => data),
    onSuccess: (data) => {
      setAiResult(data);
      toast.success("AI recommendations ready!");
    },
    onError: () => {
      toast.error("Failed to get AI recommendations");
    },
  });

  // Initiate chat from proposal
  const chatMutation = useMutation({
    mutationFn: async ({ proposalId, sellerId, sellerUsername }: { proposalId: string; sellerId: string; sellerUsername?: string }) => {
      const buyerId = user?._id || user?.id;
      if (!buyerId) throw new Error("User session not found");
      if (!sellerId) throw new Error("Seller information missing");

      try {
        const res = await axiosFetch.get(`/conversations/single/${sellerId}/${buyerId}`);
        const targetId = res.data?.uuid || res.data?.conversationID || res.data?._id || res.data?.id || res.data?.data?.uuid || res.data?.data?.conversationID || res.data?.data?._id;
        if (targetId) {
          return { conversationID: targetId };
        }
      } catch (err) {
        // Conversation not found, proceed to create
      }

      const newConv = await axiosFetch.post("/conversations", {
        to: sellerId,
        from: buyerId,
        sellerID: sellerId,
        buyerID: buyerId,
        seller_username: sellerUsername || null,
        buyer_username: user?.username || null
      });
      return newConv.data;
    },
    onSuccess: (data) => {
      const convId = data?.uuid || data?.conversationID || data?.conversationId || data?._id || data?.id || data?.data?.uuid || data?.data?.conversationID || data?.data?._id;
      if (convId) {
        router.push(`/message/${convId}`);
      } else {
        toast.error("Could not resolve conversation ID");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to initiate chat");
    },
  });

  const getRankBadgeClass = (index) => {
    if (index === 0) return "gold";
    if (index === 1) return "silver";
    if (index === 2) return "bronze";
    return "";
  };

  return (
    <div className="proposals-page">
      <div className="container">
        {/* Back */}
        <Link href={`/briefs/${briefId}`} className="back-link">
          ← Back to Project
        </Link>

        {/* Header */}
        <div className="page-header-card">
          <div className="header-text">
            <h1>Proposals ({proposals.length})</h1>
            <p>Review submitted proposals and find the best seller</p>
          </div>
          {proposals.length >= 1 && (
            <button
              className="btn-ai-rank"
              onClick={() => aiMutation.mutate()}
              disabled={aiMutation.isPending}
            >
              ✨{" "}
              {aiMutation.isPending
                ? "Analyzing..."
                : "Get AI Recommendations"}
            </button>
          )}
        </div>

        {/* AI Loading */}
        {aiMutation.isPending && (
          <div className="ai-loading-card">
            <div className="sparkle">✨</div>
            <h3>Workvence AI is evaluating proposals...</h3>
            <p>Ranking sellers based on skills, experience, and fit</p>
            <div className="ai-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {/* AI Recommendation Results */}
        {aiResult && !aiMutation.isPending && (
          <div className="ai-recommendation-card">
            <div className="ai-header">
              <span className="ai-icon">🤖</span>
              <h2>AI Top 3 Recommendations</h2>
            </div>

            {aiResult.summary && (
              <div className="ai-rationale">
                <h4>Analysis Summary</h4>
                <p>{aiResult.summary}</p>
              </div>
            )}

            <div className="ai-top-picks">
              <h4>Ranked Proposals</h4>
              {(Array.isArray(aiResult)
                ? aiResult
                : aiResult.top3Recommendations || aiResult.topProposals || aiResult.recommendations || aiResult.data || []
              ).map((item, index) => {
                  const proposal = item.proposal || item;
                  const seller = typeof proposal.sellerID === 'object' && proposal.sellerID !== null 
                    ? proposal.sellerID 
                    : (typeof proposal.sellerId === 'object' && proposal.sellerId !== null 
                        ? proposal.sellerId 
                        : (typeof proposal.seller === 'object' && proposal.seller !== null ? proposal.seller : {}));
                  const targetSellerId = seller._id || seller.id || (typeof proposal.sellerID === 'string' ? proposal.sellerID : (typeof proposal.sellerId === 'string' ? proposal.sellerId : (typeof proposal.seller === 'string' ? proposal.seller : '')));
                  return (
                    <div
                      key={proposal._id || index}
                      className={`ranked-proposal ${
                        index === 0 ? "rank-1" : ""
                      }`}
                    >
                      <div
                        className={`rank-badge ${getRankBadgeClass(index)}`}
                      >
                        #{index + 1}
                      </div>
                      <div className="ranked-info">
                        <div className="seller-name flex items-center gap-2">
                          <span>{seller.username || "Seller"}</span>
                          {item.score && (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide">
                              Score: {item.score}/100
                            </span>
                          )}
                        </div>
                        <div className="ranked-meta">
                          {proposal.price && `$${proposal.price}`}
                          {proposal.deliveryTime &&
                            ` · ${proposal.deliveryTime} days`}
                          {item.summaryRationale && ` — ${item.summaryRationale}`}
                        </div>
                        
                        {(item.pros || item.cons) && (
                          <div className="ai-pros-cons mt-3 grid grid-cols-2 gap-4 text-sm">
                            {item.pros && item.pros.length > 0 && (
                              <div className="pros-list bg-green-50 p-2 rounded-md border border-green-100">
                                <span className="font-bold text-green-700 block mb-1">✅ Pros</span>
                                <ul className="list-disc pl-4 text-green-800 text-xs space-y-1">
                                  {item.pros.map((pro: string, i: number) => <li key={i}>{pro}</li>)}
                                </ul>
                              </div>
                            )}
                            {item.cons && item.cons.length > 0 && (
                              <div className="cons-list bg-red-50 p-2 rounded-md border border-red-100">
                                <span className="font-bold text-red-700 block mb-1">⚠️ Cons</span>
                                <ul className="list-disc pl-4 text-red-800 text-xs space-y-1">
                                  {item.cons.map((con: string, i: number) => <li key={i}>{con}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn-chat-sm"
                        onClick={() =>
                          chatMutation.mutate({ proposalId: proposal._id, sellerId: targetSellerId, sellerUsername: seller.username })
                        }
                        disabled={chatMutation.isPending}
                      >
                        Chat
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Proposals List */}
        {isLoading ? (
          <div className="loader">
            <Loader size={45} />
          </div>
        ) : proposals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No proposals yet</h3>
            <p>
              Sellers have not submitted proposals yet. Share your project to
              attract more sellers.
            </p>
          </div>
        ) : (
          <div className="proposals-list">
            {proposals.map((proposal) => {
              const seller = typeof proposal.sellerID === 'object' && proposal.sellerID !== null 
                ? proposal.sellerID 
                : (typeof proposal.sellerId === 'object' && proposal.sellerId !== null 
                    ? proposal.sellerId 
                    : (typeof proposal.seller === 'object' && proposal.seller !== null ? proposal.seller : {}));
              const targetSellerId = seller._id || seller.id || (typeof proposal.sellerID === 'string' ? proposal.sellerID : (typeof proposal.sellerId === 'string' ? proposal.sellerId : (typeof proposal.seller === 'string' ? proposal.seller : '')));
              
              // Check if AI recommended
              const aiList = Array.isArray(aiResult) ? aiResult : (aiResult?.top3Recommendations || aiResult?.topProposals || aiResult?.recommendations || aiResult?.data || []);
              const isRecommended = aiList.some((item) => {
                const p = item.proposal || item;
                return p._id === proposal._id;
              });

              return (
                <div 
                  key={proposal._id} 
                  className={`proposal-card relative transition-all duration-200 ${
                    isRecommended ? "border-2 border-purple-500 bg-purple-50" : ""
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 right-6 bg-gradient-to-br from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-md">
                      ✨ AI Recommended
                    </div>
                  )}
                  <div className="proposal-header">
                    <img
                      className="seller-avatar"
                      src={seller.image || "/media/noavatar.png"}
                      alt=""
                    />
                    <div className="seller-info">
                      <div
                        className="seller-name font-semibold text-lg cursor-pointer hover:text-brand-green transition-colors"
                        onClick={() =>
                          targetSellerId &&
                          router.push(`/seller/${targetSellerId}`)
                        }
                      >
                        {seller.username || "Seller"}
                      </div>
                      
                      {/* Enriched Seller Badges */}
                      <div className="seller-badges flex items-center gap-3 mt-1 mb-1 text-sm">
                        {seller.starRating !== undefined && (
                          <div className="badge flex items-center gap-1 text-amber-500 font-medium">
                            <span>⭐</span>
                            <span>{seller.starRating.toFixed(1)}</span>
                            <span className="text-gray-400">({seller.totalReviews || 0})</span>
                          </div>
                        )}
                        {seller.completedOrdersCount !== undefined && (
                          <div className="badge flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">
                            <span>🏆 {seller.completedOrdersCount} Orders Completed</span>
                          </div>
                        )}
                      </div>

                      <div className="seller-meta text-xs text-gray-500 mt-1 flex items-center gap-2">
                        {seller.country && <span>📍 {seller.country}</span>}
                        <span>·</span>
                        <span>
                          Submitted {moment(proposal.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>
                    {proposal.price && (
                      <div className="proposal-price">${proposal.price}</div>
                    )}
                  </div>

                  <div className="proposal-body">
                    <p className="cover-letter">{proposal.coverLetter}</p>
                  </div>

                  <div className="proposal-footer">
                    <div className="delivery-info">
                      {proposal.deliveryDays && (
                        <span>
                          Delivery: <strong>{proposal.deliveryDays} days</strong>
                        </span>
                      )}
                    </div>
                    <button
                      className="btn-initiate-chat"
                      onClick={() => chatMutation.mutate({ proposalId: proposal._id, sellerId: targetSellerId, sellerUsername: seller.username })}
                      disabled={chatMutation.isPending}
                    >
                      {chatMutation.isPending
                        ? "Starting..."
                        : "Initiate Chat"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProposalsPage() {
  return <Proposals />;
}
