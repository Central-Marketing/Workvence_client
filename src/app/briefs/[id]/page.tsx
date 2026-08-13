// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import moment from "moment";
import toast from "react-hot-toast";

import { axiosFetch } from "@/utils";
import { useUserStore } from "@/store/userStore";
import { Loader, SubmitProposalModal } from "@/components";

const BriefDetail = () => {
  const router = useRouter();
  const params = useParams();
  const briefId = params.id;
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const [proposalSent, setProposalSent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMyProposalModal, setShowMyProposalModal] = useState(false);
  const [submittedProposalData, setSubmittedProposalData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof window !== "undefined" && localStorage.getItem(`proposed_${briefId}`)) {
      setProposalSent(true);
    }
  }, [briefId]);

  // Fetch brief details
  const {
    isLoading,
    error,
    data: brief,
  } = useQuery({
    queryKey: ["brief", briefId],
    queryFn: () =>
      axiosFetch.get(`/briefs/${briefId}`).then(({ data }) => data?.brief || data?.data || data),
    enabled: !!briefId,
  });

  const isClosed = brief?.isClosed || brief?.status === "closed";
  const isOwner =
    brief &&
    user &&
    (brief.userID?._id === user._id || brief.userID === user._id);
  const isSeller = user?.isSeller;

  // Check if seller already submitted a proposal
  const { data: myProposals = [] } = useQuery({
    queryKey: ["my-proposals-for-brief", briefId],
    queryFn: () =>
      axiosFetch.get(`/briefs/my-proposals`)
        .then(({ data }) => {
          let props = [];
          if (Array.isArray(data)) props = data;
          else if (Array.isArray(data?.proposals)) props = data.proposals;
          else if (Array.isArray(data?.data)) props = data.data;
          
          return props.filter((p: any) => p.briefID === briefId || p.briefID?._id === briefId);
        })
        .catch(() => []),
    enabled: !!briefId && !!user && isSeller && !isOwner,
  });

  const myProposal = myProposals[0];
  const hasAlreadyProposed = !!myProposal;

  const activeProposal = submittedProposalData || myProposal;
  const showSubmittedUI = proposalSent || hasAlreadyProposed;

  // Close brief mutation (buyer)
  const closeMutation = useMutation({
    mutationFn: () =>
      axiosFetch.patch(`/briefs/${briefId}/close`).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brief", briefId] });
      toast.success("Brief closed");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to close brief");
    },
  });

  const handleProposalSuccess = (data?: any, isAlreadySubmitted?: boolean) => {
    setProposalSent(true);
    setSubmittedProposalData(data);
    if (typeof window !== "undefined") {
      localStorage.setItem(`proposed_${briefId}`, "true");
    }
    if (!isAlreadySubmitted) {
      toast.success("Proposal submitted successfully!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center bg-slate-50 py-10 min-h-[80vh]">
        <div className="w-[90%] max-w-[900px] flex justify-center mt-10">
          <Loader size={45} />
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="flex justify-center bg-slate-50 py-10 min-h-[80vh]">
        <div className="w-[90%] max-w-[900px] flex flex-col items-center justify-center text-center mt-10">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Brief not found</h3>
          <p className="text-slate-500">This brief may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-slate-50 py-10 min-h-[80vh]">
      <div className="w-[90%] max-w-[900px] flex flex-col gap-6">
        {/* Back */}
        <Link href="/briefs" className="inline-flex items-center gap-1.5 text-slate-500 text-sm font-semibold hover:text-emerald-500 w-fit transition-colors">
          ← Back to Briefs
        </Link>

        {/* Main Detail Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7 sm:px-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{brief.title}</h1>
              <div className="flex flex-wrap gap-4 text-[13px] text-slate-500 items-center">
                {brief.category && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-500 capitalize">{brief.category}</span>
                )}
                <span>Posted {moment(brief.createdAt).fromNow()}</span>
                {brief.deadline && (
                  <span>
                    Deadline: {moment(brief.deadline).format("MMM D, YYYY")}
                  </span>
                )}
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-[13px] font-semibold capitalize shrink-0 ${isClosed ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}>
              {isClosed ? "Closed" : "Open"}
            </span>
          </div>

          <div className="p-5 sm:p-7 sm:px-8 flex flex-col gap-6">
            {/* Description */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 uppercase tracking-wide mb-4">Description</h3>
              <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap">{brief.description}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {brief.budget && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Budget</div>
                  <div className="text-lg font-bold text-emerald-500">${brief.budget}</div>
                </div>
              )}
              {brief.deadline && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Deadline</div>
                  <div className="text-lg font-bold text-slate-900">
                    {moment(brief.deadline).format("MMM D, YYYY")}
                  </div>
                </div>
              )}
              {brief.proposalCount !== undefined && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Proposals</div>
                  <div className="text-lg font-bold text-slate-900">{brief.proposalCount}</div>
                </div>
              )}
            </div>

            {/* Buyer Info */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <img
                src={brief.userID?.image || "/media/noavatar.png"}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-[15px] font-semibold text-slate-900">
                  {brief.userID?.username || "Anonymous"}
                </div>
                <div className="text-xs text-slate-400">Brief Owner</div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-5 border-t border-slate-100 flex gap-3">
            {isOwner && !isClosed && (
              <>
                <Link
                  href={`/briefs/${briefId}/proposals`}
                  className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  View Proposals
                </Link>
                <button
                  className="px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                  onClick={() => closeMutation.mutate()}
                  disabled={closeMutation.isPending}
                >
                  {closeMutation.isPending ? "Closing..." : "Close Brief"}
                </button>
              </>
            )}
            {isOwner && isClosed && (
              <Link
                href={`/briefs/${briefId}/proposals`}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                View Past Proposals
              </Link>
            )}
          </div>
        </div>

        {/* Proposal Action — Sellers only, open briefs only */}
        {isSeller && !isOwner && !isClosed && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8 text-center">
            {showSubmittedUI ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="text-4xl">✅</div>
                <h3 className="text-xl font-bold text-slate-900">Proposal Submitted!</h3>
                <p className="text-slate-500">
                  You have already submitted a proposal for this brief. The buyer will review your proposal and may initiate a conversation.
                </p>
                <button
                  onClick={() => setShowMyProposalModal(true)}
                  className="mt-4 px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors inline-block"
                >
                  View My Proposal
                </button>
              </div>
            ) : (
              <div className="py-10 px-5 text-center flex flex-col items-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to submit?</h2>
                <p className="text-slate-500 mb-6">
                  Convince the buyer why you are the best fit for this project
                </p>
                <button
                  className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors text-lg"
                  onClick={() => setShowModal(true)}
                >
                  Submit Proposal
                </button>
              </div>
            )}
          </div>
        )}

        {/* Closed notice for sellers */}
        {isSeller && !isOwner && isClosed && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8 text-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="text-4xl">🔒</div>
              <h3 className="text-xl font-bold text-slate-900">This Brief is Closed</h3>
              <p className="text-slate-500">The buyer is no longer accepting proposals for this project.</p>
            </div>
          </div>
        )}
      </div>

      {showMyProposalModal && activeProposal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setShowMyProposalModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
            {/* Header (Always Fixed at Top) */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Your Proposal</h2>
              <button
                onClick={() => setShowMyProposalModal(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div className="flex justify-between border-b border-slate-100 pb-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Price</div>
                  <div className="text-xl font-extrabold text-emerald-600">${activeProposal.price}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Time</div>
                  <div className="text-xl font-extrabold text-slate-900">{activeProposal.deliveryTime} Days</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cover Letter</div>
                <div className="text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {activeProposal.coverLetter}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <SubmitProposalModal
          brief={brief}
          onClose={() => setShowModal(false)}
          onSuccess={handleProposalSuccess}
        />
      )}
    </div>
  );
};

export default BriefDetail;
