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
import { FiCheck, FiAlertTriangle, FiStar } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

const Proposals = () => {
  const router = useRouter();
  const params = useParams();
  const briefId = params.id;
  const user = useUserStore((state) => state.user);

  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch proposals
  const { isLoading, data: proposals = [] } = useQuery<any[]>({
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

  const getRankBadgeClasses = (index: number) => {
    if (index === 0) return "bg-[#0D6D5F] text-white shadow-xs";
    if (index === 1) return "bg-slate-700 text-white shadow-xs";
    if (index === 2) return "bg-slate-500 text-white shadow-xs";
    return "bg-slate-200 text-slate-700";
  };

  return (
    <div className="flex justify-center bg-slate-50 py-10 min-h-[80vh] px-4">
      <div className="w-full max-w-[1000px] flex flex-col gap-6 mx-auto">
        {/* Back */}
        <Link href={`/briefs/${briefId}`} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-500 font-semibold text-sm transition-colors">
          ← Back to Project
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-7 md:px-8 rounded-xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Proposals ({proposals.length})</h1>
            <p className="text-slate-400 text-sm">Review submitted proposals and find the best seller</p>
          </div>
          {proposals.length >= 1 && (
            <button
              type="button"
              className="py-2.5 px-5 rounded-xl font-semibold text-sm bg-[#0D6D5F] hover:bg-[#0b5c50] text-white border-none transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => aiMutation.mutate()}
              disabled={aiMutation.isPending}
            >
              <HiSparkles className="text-base text-amber-300" />
              <span>{aiMutation.isPending ? "Analyzing..." : "Get AI Recommendations"}</span>
            </button>
          )}
        </div>

        {/* AI Loading */}
        {aiMutation.isPending && (
          <div className="bg-white border-2 border-[#0D6D5F]/20 rounded-xl p-10 sm:p-12 text-center flex flex-col items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#0D6D5F]/10 text-[#0D6D5F] flex items-center justify-center text-2xl animate-pulse">
              <HiSparkles />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Workvence AI is evaluating proposals...</h3>
            <p className="text-slate-500 text-sm">Ranking sellers based on skills, experience, and fit</p>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0D6D5F] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#0D6D5F] animate-bounce [animation-delay:0.16s]" />
              <span className="w-2 h-2 rounded-full bg-[#0D6D5F] animate-bounce [animation-delay:0.32s]" />
            </div>
          </div>
        )}

        {/* AI Recommendation Results */}
        {aiResult && !aiMutation.isPending && (
          <div className="bg-white border border-[#0D6D5F]/25 rounded-2xl shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#0D6D5F]/10 via-[#0D6D5F]/5 to-transparent p-5 px-6 sm:px-8 border-b border-[#0D6D5F]/15 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0D6D5F]/15 flex items-center justify-center text-[#0D6D5F]">
                  <HiSparkles className="text-lg" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">AI Top Recommendations</h2>
              </div>
              {(aiResult.totalProposalsEvaluated || (Array.isArray(aiResult?.top3Recommendations) && aiResult.top3Recommendations.length > 0)) && (
                <span className="text-xs font-semibold bg-white text-[#0D6D5F] border border-[#0D6D5F]/20 px-3 py-1 rounded-full shadow-2xs">
                  {aiResult.totalProposalsEvaluated || aiResult.top3Recommendations?.length} Proposals Evaluated
                </span>
              )}
            </div>

            {(aiResult.summary || aiResult.recommendation?.summary) && (
              <div className="p-5 px-6 sm:px-8 border-b border-slate-100 bg-[#0D6D5F]/[0.02]">
                <h4 className="text-xs font-bold text-[#0D6D5F] uppercase tracking-wider mb-2">Analysis Summary</h4>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">{aiResult.summary || aiResult.recommendation?.summary}</p>
              </div>
            )}

            <div className="p-5 px-6 sm:px-8 flex flex-col gap-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ranked Proposals</h4>
              {(Array.isArray(aiResult)
                ? aiResult
                : (aiResult?.top3Recommendations || aiResult?.recommendation?.top3 || aiResult?.topProposals || aiResult?.recommendations || aiResult?.data || [])
              ).map((item: any, index: number) => {
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
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border transition-all ${
                        index === 0 ? "border-[#0D6D5F]/40 ring-2 ring-[#0D6D5F]/10 bg-white" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${getRankBadgeClasses(index)}`}
                      >
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-bold text-slate-900 mb-0.5 flex items-center gap-2">
                          <span>{seller.username || "Seller"}</span>
                          {item.score !== undefined && item.score !== null && (
                            <span className="bg-emerald-50 text-[#0D6D5F] border border-[#0D6D5F]/20 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide">
                              Score: {item.score}/100
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {proposal.price && `$${Number(proposal.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                          {proposal.deliveryTime &&
                            ` · ${proposal.deliveryTime} days`}
                          {item.summaryRationale && ` — ${item.summaryRationale}`}
                        </div>
                        
                        {(item.pros?.length > 0 || item.cons?.length > 0) && (
                          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {item.pros && item.pros.length > 0 && (
                              <div className="bg-[#0D6D5F]/5 p-3 rounded-xl border border-[#0D6D5F]/20">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="w-4 h-4 rounded-full bg-[#0D6D5F]/15 flex items-center justify-center text-[#0D6D5F] shrink-0">
                                    <FiCheck className="text-[10px] stroke-[2.5]" />
                                  </div>
                                  <span className="font-bold text-[#0D6D5F] text-xs uppercase tracking-wide">Pros</span>
                                </div>
                                <ul className="space-y-1 text-slate-700 text-xs">
                                  {item.pros.map((pro: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                                      <span className="text-[#0D6D5F] font-bold text-xs shrink-0">✓</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.cons && item.cons.length > 0 && (
                              <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200/70">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <div className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                                    <FiAlertTriangle className="text-[10px] stroke-[2.5]" />
                                  </div>
                                  <span className="font-bold text-rose-700 text-xs uppercase tracking-wide">Cons</span>
                                </div>
                                <ul className="space-y-1 text-slate-700 text-xs">
                                  {item.cons.map((con: string, i: number) => (
                                    <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                                      <span className="text-rose-500 font-bold text-xs shrink-0">✕</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="py-2.5 px-5 rounded-xl text-xs font-semibold bg-[#0D6D5F] hover:bg-[#0b5c50] text-white transition-colors cursor-pointer whitespace-nowrap shadow-xs disabled:opacity-50 disabled:cursor-not-allowed self-end sm:self-center"
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
          <div className="w-full flex justify-center items-center py-20">
            <Loader size={45} />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No proposals yet</h3>
            <p className="text-slate-500 text-sm max-w-md">
              Sellers have not submitted proposals yet. Share your project to
              attract more sellers.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {proposals.map((proposal: any) => {
              const seller = typeof proposal.sellerID === 'object' && proposal.sellerID !== null 
                ? proposal.sellerID 
                : (typeof proposal.sellerId === 'object' && proposal.sellerId !== null 
                    ? proposal.sellerId 
                    : (typeof proposal.seller === 'object' && proposal.seller !== null ? proposal.seller : {}));
              const targetSellerId = seller._id || seller.id || (typeof proposal.sellerID === 'string' ? proposal.sellerID : (typeof proposal.sellerId === 'string' ? proposal.sellerId : (typeof proposal.seller === 'string' ? proposal.seller : '')));
              
              // Check if AI recommended
              const aiList = Array.isArray(aiResult) ? aiResult : (aiResult?.top3Recommendations || aiResult?.topProposals || aiResult?.recommendations || aiResult?.data || []);
              const isRecommended = aiList.some((item: any) => {
                const p = item.proposal || item;
                return p._id === proposal._id;
              });

              return (
                <div 
                  key={proposal._id} 
                  className={`bg-white rounded-xl p-5 sm:p-6 transition-all shadow-xs hover:shadow-md relative overflow-hidden ${
                    isRecommended ? "border-2 border-indigo-400 bg-indigo-50/20" : "border border-slate-200 hover:border-emerald-500/30"
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute top-3 right-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-xs">
                      ✨ AI Recommended
                    </div>
                  )}
                  <div className="flex items-start sm:items-center gap-3.5 pb-4 border-b border-slate-100">
                    <img
                      className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 shrink-0"
                      src={seller.image || "/media/noavatar.png"}
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold text-base text-slate-900 cursor-pointer hover:text-emerald-500 transition-colors truncate"
                        onClick={() =>
                          targetSellerId &&
                          router.push(`/seller/${targetSellerId}`)
                        }
                      >
                        {seller.username || "Seller"}
                      </div>
                      
                      {/* Enriched Seller Badges */}
                      <div className="flex items-center gap-3 mt-0.5 mb-0.5 text-xs">
                        {seller.starRating !== undefined && (
                          <div className="flex items-center gap-1 text-amber-500 font-medium">
                            <span>⭐</span>
                            <span>{seller.starRating.toFixed(1)}</span>
                            <span className="text-slate-400">({seller.totalReviews || 0})</span>
                          </div>
                        )}
                        {seller.completedOrdersCount !== undefined && (
                          <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-100">
                            <span>🏆 {seller.completedOrdersCount} Orders Completed</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                        {seller.country && <span>📍 {seller.country}</span>}
                        <span>·</span>
                        <span>
                          Submitted {moment(proposal.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>
                    {proposal.price && (
                      <div className="text-lg sm:text-xl font-extrabold text-emerald-500 shrink-0">${proposal.price}</div>
                    )}
                  </div>

                  <div className="py-4">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{proposal.coverLetter}</p>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                      {proposal.deliveryDays && (
                        <span>
                          Delivery: <strong className="text-slate-800">{proposal.deliveryDays} days</strong>
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="py-2 px-5 rounded-lg font-semibold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
