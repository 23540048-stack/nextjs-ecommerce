"use client";

import React, { useState } from "react";
import {
  Star,
  Search,
  MessageSquare,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Send,
  ThumbsUp,
  Filter,
  Check,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface Review {
  id: string;
  productName: string;
  customerName: string;
  customerRank: string;
  rating: number;
  comment: string;
  date: string;
  status: "approved" | "pending" | "flagged";
  reply?: string;
  verifiedPurchase: boolean;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "REV-101",
    productName: "Sage Mode Tactical Hoodie",
    customerName: "Naruto Uzumaki",
    customerRank: "S-RANK VIP",
    rating: 5,
    comment:
      "Chakra flow is insane! The hood fits perfectly even with Sage eyes unlocked. Worth every ryo.",
    date: "2026-08-10",
    status: "approved",
    reply: "Thank you Lord Seventh! May your training continue to flourish.",
    verifiedPurchase: true,
  },
  {
    id: "REV-102",
    productName: "Anbu Black Ops Cloak",
    customerName: "Sasuke Uchiha",
    customerRank: "S-RANK VIP",
    rating: 4,
    comment:
      "Fabric is durable and stealthy for shadow missions. A bit tight around the left arm slot though.",
    date: "2026-08-11",
    status: "pending",
    verifiedPurchase: true,
  },
  {
    id: "REV-103",
    productName: "Akatsuki Cloud Windbreaker",
    customerName: "Deidara",
    customerRank: "JONIN",
    rating: 1,
    comment:
      "This jacket did not explode on impact as promised. Art is an explosion!! Extremely disappointed.",
    date: "2026-08-12",
    status: "flagged",
    verifiedPurchase: false,
  },
  {
    id: "REV-104",
    productName: "Jonin Tactical Vest",
    customerName: "Kakashi Hatake",
    customerRank: "S-RANK VIP",
    rating: 5,
    comment:
      "Pockets fit 3 Icha Icha novels effortlessly. Material holds up in lightning blade attacks.",
    date: "2026-08-12",
    status: "approved",
    verifiedPurchase: true,
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal States
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  // Status Toggles
  const handleApprove = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
    );
  };

  const handleFlag = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "flagged" } : r)),
    );
  };

  // Reply Actions
  const handleOpenReplyModal = (review: Review) => {
    setReplyingReview(review);
    setReplyText(review.reply || "");
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === replyingReview.id
          ? { ...r, reply: replyText, status: "approved" }
          : r,
      ),
    );
    setReplyingReview(null);
    setReplyText("");
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (!deletingReview) return;
    setReviews((prev) => prev.filter((r) => r.id !== deletingReview.id));
    setDeletingReview(null);
  };

  // Filtered Reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || r.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      {/* HEADER */}
      <div className="border-b border-brand-dark/15 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase flex items-center gap-2">
            <Star className="text-orange-600 fill-orange-600" size={28} />
            REVIEWS & FEEDBACK COMMAND CENTER
          </h1>
          <p className="text-xs text-brand-dark/60 mt-1">
            Moderate customer testimonials, handle reported reviews, and publish
            official team replies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 bg-brand-dark text-white uppercase">
            TOTAL FEEDBACK: {reviews.length}
          </span>
        </div>
      </div>

      {/* METRICS METERS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="border border-brand-dark/15 p-4 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            AVERAGE RATING
          </span>
          <p className="text-2xl font-extrabold text-orange-600">4.5 / 5.0</p>
        </div>

        <div className="border border-brand-dark/15 p-4 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            APPROVED REVIEWS
          </span>
          <p className="text-2xl font-extrabold text-emerald-600">
            {reviews.filter((r) => r.status === "approved").length}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-4 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            PENDING MODERATION
          </span>
          <p className="text-2xl font-extrabold text-amber-600">
            {reviews.filter((r) => r.status === "pending").length}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-4 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            FLAGGED / SPAM
          </span>
          <p className="text-2xl font-extrabold text-rose-600">
            {reviews.filter((r) => r.status === "flagged").length}
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-brand-dark/5 p-4 border border-brand-dark/15">
        <div className="w-full sm:w-80">
          <Input
            label="SEARCH FEEDBACK"
            placeholder="Search by customer, product, or comment..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-brand-dark/60 mr-1 flex items-center gap-1">
            <Filter size={12} /> FILTER BY STATUS:
          </span>
          {["ALL", "APPROVED", "PENDING", "FLAGGED"].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? "chakra" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center border border-brand-dark/15 bg-brand-dark/5 space-y-2">
            <p className="font-bold uppercase text-xs text-brand-dark/60">
              NO REVIEWS FOUND MATCHING CRITERIA
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="border border-brand-dark/15 p-5 bg-white space-y-4 hover:border-brand-dark/40 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-brand-dark/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-brand-dark uppercase">
                    {rev.customerName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-dark/10 text-brand-dark uppercase">
                    {rev.customerRank}
                  </span>
                  {rev.verifiedPurchase && (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase flex items-center gap-1">
                      <CheckCircle2 size={10} /> VERIFIED SHINOBI
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-brand-dark/50">{rev.date}</span>
                  <span className="text-brand-dark/30">•</span>
                  {rev.status === "approved" && (
                    <span className="text-emerald-600 uppercase font-bold text-[10px] bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      APPROVED
                    </span>
                  )}
                  {rev.status === "pending" && (
                    <span className="text-amber-600 uppercase font-bold text-[10px] bg-amber-50 px-2 py-0.5 border border-amber-200">
                      PENDING
                    </span>
                  )}
                  {rev.status === "flagged" && (
                    <span className="text-rose-600 uppercase font-bold text-[10px] bg-rose-50 px-2 py-0.5 border border-rose-200">
                      FLAGGED
                    </span>
                  )}
                </div>
              </div>

              {/* RATING & PRODUCT */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 uppercase">
                  [ PRODUCT: {rev.productName} ]
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < rev.rating
                          ? "text-orange-500 fill-orange-500"
                          : "text-brand-dark/20"
                      }
                    />
                  ))}
                </div>
              </div>

              {/* COMMENT */}
              <p className="text-xs text-brand-dark/90 leading-relaxed bg-brand-dark/[0.02] p-3 border-l-2 border-brand-dark">
                "{rev.comment}"
              </p>

              {/* OFFICIAL REPLY (IF ANY) */}
              {rev.reply && (
                <div className="bg-orange-500/5 p-3 border border-orange-500/20 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-orange-600 uppercase flex items-center gap-1">
                    <MessageSquare size={12} /> OFFICIAL SHINOBI STORE RESPONSE:
                  </span>
                  <p className="text-brand-dark/80 italic">{rev.reply}</p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-dark/10">
                <div className="flex gap-2">
                  <Button
                    variant={rev.status === "approved" ? "outline" : "chakra"}
                    size="sm"
                    icon={Check}
                    onClick={() => handleApprove(rev.id)}
                  >
                    {rev.status === "approved" ? "APPROVED" : "APPROVE"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={ShieldAlert}
                    onClick={() => handleFlag(rev.id)}
                  >
                    FLAG SPAM
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={MessageSquare}
                    onClick={() => handleOpenReplyModal(rev)}
                  >
                    {rev.reply ? "EDIT REPLY" : "REPLY"}
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeletingReview(rev)}
                  >
                    DELETE
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REPLY MODAL */}
      <Modal
        isOpen={!!replyingReview}
        onClose={() => setReplyingReview(null)}
        title="OFFICIAL STORE REPLY"
        maxWidth="lg"
      >
        {replyingReview && (
          <form
            onSubmit={handleSaveReply}
            className="space-y-4 text-xs font-mono pt-2"
          >
            <div className="bg-brand-dark/5 p-3 border border-brand-dark/10 space-y-1">
              <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
                CUSTOMER REVIEW:
              </span>
              <p className="font-bold text-brand-dark">
                "{replyingReview.comment}"
              </p>
              <span className="block text-[10px] text-orange-600 font-bold mt-1">
                By {replyingReview.customerName} on {replyingReview.productName}
              </span>
            </div>

            <div>
              <label className="block mb-2 font-bold text-brand-dark uppercase tracking-wider">
                YOUR PUBLIC RESPONSE
              </label>
              <textarea
                rows={4}
                required
                placeholder="Type official store response visible to all customers..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-brand-ivory text-brand-dark border border-brand-dark/20 p-2.5 font-mono text-xs outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setReplyingReview(null)}
              >
                CANCEL
              </Button>
              <Button type="submit" variant="chakra" size="md" icon={Send}>
                PUBLISH RESPONSE
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingReview}
        onClose={() => setDeletingReview(null)}
        title="CONFIRM REVIEW DELETION"
        maxWidth="md"
      >
        {deletingReview && (
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-rose-600 bg-rose-500/10 p-3 border border-rose-500/20">
              <AlertTriangle size={18} className="shrink-0" />
              <p className="font-bold uppercase">
                This action will permanently delete this review.
              </p>
            </div>

            <div className="bg-brand-dark/5 p-3 border border-brand-dark/10 space-y-1">
              <p>
                Review ID: <strong>{deletingReview.id}</strong>
              </p>
              <p>
                Customer: <strong>{deletingReview.customerName}</strong>
              </p>
              <p>
                Product: <strong>{deletingReview.productName}</strong>
              </p>
              <p>
                Comment:{" "}
                <strong className="text-brand-dark/80">
                  "{deletingReview.comment}"
                </strong>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setDeletingReview(null)}
              >
                CANCEL
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                icon={Trash2}
                onClick={handleConfirmDelete}
              >
                CONFIRM DELETE
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
