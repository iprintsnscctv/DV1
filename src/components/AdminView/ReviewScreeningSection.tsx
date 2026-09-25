import React, { useState } from 'react';
import { GuestReview, ReviewMedia } from '../../types';
import {
  Star, CheckCircle2, XCircle, AlertCircle, Clock, Search, Filter, 
  Trash2, Image as ImageIcon, Video, Eye, ShieldCheck, Play, X, 
  MessageSquare, Sparkles, User, ExternalLink
} from 'lucide-react';

interface ReviewScreeningSectionProps {
  reviews: GuestReview[];
  onApproveReview: (reviewId: string) => void;
  onRejectReview: (reviewId: string, feedback?: string) => void;
  onDeleteReview: (reviewId: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ReviewScreeningSection: React.FC<ReviewScreeningSectionProps> = ({
  reviews,
  onApproveReview,
  onRejectReview,
  onDeleteReview,
  onShowToast,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Media Lightbox Modal state
  const [activeMedia, setActiveMedia] = useState<ReviewMedia | null>(null);
  
  // Reject Feedback Modal state
  const [rejectingReviewId, setRejectingReviewId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Statistics
  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;
  
  const avgRating = totalCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
    : '5.0';

  const filteredReviews = reviews.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.guestName.toLowerCase().includes(q) ||
        r.roomName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmReject = () => {
    if (!rejectingReviewId) return;
    onRejectReview(rejectingReviewId, rejectionReason.trim() || 'Did not meet community review standards.');
    setRejectingReviewId(null);
    setRejectionReason('');
    onShowToast('Review rejected with feedback sent to guest records.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all hotel rooms</div>
        </div>

        {/* Pending Screening */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-sm bg-gradient-to-br from-amber-50/50 dark:from-amber-950/20 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">
              Pending Screening
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium mt-0.5">
            Requires admin action
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Live & Approved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {approvedCount}
          </div>
          <div className="text-[11px] text-emerald-600/80 font-medium mt-0.5">Visible to guests</div>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Avg Guest Score</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
            <span>{avgRating}</span>
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Overall customer satisfaction</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'pending', label: `Pending Screening (${pendingCount})`, isAlert: pendingCount > 0 },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : tab.isAlert
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest, room, keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 sm:p-6 shadow-sm transition-all ${
                review.status === 'pending'
                  ? 'border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-500/20'
                  : 'border-slate-200/90 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
                {/* Review Core Details */}
                <div className="space-y-3 flex-1">
                  {/* Header info */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {review.guestName[0]}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{review.guestName}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Verified Stay</span>
                          </span>
                        </div>
                        {review.guestEmail && (
                          <div className="text-[10px] text-slate-400">{review.guestEmail}</div>
                        )}
                      </div>
                    </div>

                    <span className="text-slate-300 dark:text-slate-700">•</span>

                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                      {review.roomName} (Room {review.roomNumber || '0'})
                    </span>

                    <span className="text-slate-300 dark:text-slate-700">•</span>

                    <span className="text-[11px] text-slate-400 font-medium">
                      Submitted on {review.createdAt}
                    </span>
                  </div>

                  {/* Rating Stars & Title */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {review.rating}.0 / 5.0
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      "{review.title}"
                    </h4>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">
                    {review.comment}
                  </p>

                  {/* Attached Media (Photos & Video) */}
                  {review.media && review.media.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Attached Media ({review.media.length}) — Click to Preview</span>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        {review.media.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setActiveMedia(item)}
                            className="relative group w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 cursor-pointer shadow-xs hover:ring-2 hover:ring-amber-500 transition-all shrink-0"
                          >
                            {item.type === 'image' ? (
                              <img
                                src={item.url}
                                alt={item.name || 'Review Photo'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                                <video
                                  src={item.url}
                                  className="w-full h-full object-cover opacity-75"
                                  muted
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                                  </span>
                                </span>
                                <span className="absolute bottom-1 right-1 text-[8px] font-bold px-1 rounded bg-black/80 text-white">
                                  VIDEO
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Rejection Feedback Note */}
                  {review.status === 'rejected' && review.adminFeedback && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                      <strong>Rejection Note:</strong> {review.adminFeedback}
                    </div>
                  )}
                </div>

                {/* Right: Status Pill & Action Buttons */}
                <div className="flex lg:flex-col items-end justify-between w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 gap-3">
                  {/* Status Badge */}
                  <div>
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        review.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : review.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {review.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {review.status === 'pending' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {review.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                      <span>{review.status === 'pending' ? 'Pending Screening' : review.status}</span>
                    </span>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2">
                    {/* Approve Button */}
                    {review.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => {
                          onApproveReview(review.id);
                          onShowToast(`Review by ${review.guestName} approved and published!`, 'success');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Approve and make visible to public"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {review.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => setRejectingReviewId(review.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                        title="Reject review"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Delete Review */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to permanently delete the review by ${review.guestName}?`)) {
                          onDeleteReview(review.id);
                          onShowToast('Review deleted from records.', 'info');
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Permanently Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="font-bold text-base text-slate-900 dark:text-white">
            No reviews matching this filter
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {filterStatus === 'pending'
              ? 'Great job! All submitted guest reviews have been screened and processed.'
              : 'Try selecting "All" or searching for a different keyword.'}
          </p>
        </div>
      )}

      {/* Media Lightbox / Full Player Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 text-white">
              <span className="text-xs font-bold flex items-center gap-2">
                {activeMedia.type === 'video' ? <Video className="w-4 h-4 text-rose-500" /> : <ImageIcon className="w-4 h-4 text-amber-500" />}
                {activeMedia.name || 'Media Preview'}
              </span>
              <button
                type="button"
                onClick={() => setActiveMedia(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-black min-h-[300px] max-h-[75vh]">
              {activeMedia.type === 'image' ? (
                <img
                  src={activeMedia.url}
                  alt={activeMedia.name || 'Enlarged Review Photo'}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
                />
              ) : (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-full object-contain rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Feedback Reason Modal */}
      {rejectingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Reason for Rejecting Review
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide an optional note explaining why this review was declined (e.g. inappropriate language, unrelated media, duplicate entry).
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Media uploaded contains blurry or unrelated images..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectingReviewId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
