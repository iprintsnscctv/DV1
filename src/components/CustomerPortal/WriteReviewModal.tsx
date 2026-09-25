import React, { useState } from 'react';
import { X, Star, CheckCircle, Sparkles } from 'lucide-react';
import { Reservation, Review } from '../../types';

interface WriteReviewModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onSubmitReview: (review: Review) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  reservation,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState(5);
  const [guestName, setGuestName] = useState(reservation?.guestName || '');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      reservationId: reservation?.id,
      guestName: guestName || 'Verified Guest',
      roomName: reservation?.roomName || 'Diversion Vigan Suite',
      rating,
      comment,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    onSubmitReview(newReview);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#1a130e] text-[#2a1c14] dark:text-[#f8f4ec] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#ebdcd0] dark:border-[#403024] relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2b2019] hover:bg-gray-200 dark:hover:bg-[#382b22] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-serif font-bold">Thank you for your feedback!</h3>
            <p className="text-xs text-[#735745] dark:text-[#c5b2a3] mt-1">
              Your review helps other travelers discover Diversion Vigan.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Verified Guest Experience
              </span>
              <h3 className="text-xl font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec] mt-0.5">
                Rate Your Stay
              </h3>
              {reservation && (
                <p className="text-xs text-[#735745] dark:text-[#c5b2a3]">
                  {reservation.roomName} • {reservation.checkInDate}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-300 dark:text-gray-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 ml-2">
                    {rating === 5
                      ? 'Exceptional'
                      : rating === 4
                      ? 'Very Good'
                      : rating === 3
                      ? 'Average'
                      : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                  Review & Comments *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details about cleanliness, staff hospitality, room amenities..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#2b211a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
