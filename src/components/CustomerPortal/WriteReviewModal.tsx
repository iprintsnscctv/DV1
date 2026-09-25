import React, { useState } from 'react';
import { Room, CustomerUser, Reservation, GuestReview, ReviewMedia } from '../../types';
import { 
  X, Star, Image as ImageIcon, Video, Upload, Trash2, Plus, 
  CheckCircle2, Sparkles, AlertCircle, Play, Info
} from 'lucide-react';

interface WriteReviewModalProps {
  rooms: Room[];
  currentCustomer: CustomerUser;
  preselectedReservation?: Reservation | null;
  onClose: () => void;
  onSubmitReview: (review: GuestReview) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  rooms,
  currentCustomer,
  preselectedReservation,
  onClose,
  onSubmitReview,
  onShowToast,
}) => {
  const initialRoomId = preselectedReservation ? preselectedReservation.roomId : (rooms[0]?.id || 'room-0');
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  
  // Media state
  const [mediaItems, setMediaItems] = useState<ReviewMedia[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const newMedia: ReviewMedia[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newMedia.push({
            id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: 'image',
            url: event.target.result as string,
            name: file.name,
          });
        }
        processed++;
        if (processed === files.length) {
          setMediaItems((prev) => [...prev, ...newMedia]);
          setIsUploading(false);
          onShowToast(`Attached ${newMedia.length} photo(s)`, 'success');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Video File Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 50 * 1024 * 1024) {
      onShowToast('Video file size exceeds 50MB limit. Please upload a smaller video clip or paste a link.', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newVideo: ReviewMedia = {
          id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'video',
          url: event.target.result as string,
          name: file.name,
        };
        setMediaItems((prev) => [...prev, newVideo]);
        setIsUploading(false);
        onShowToast('Attached video clip successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Photo by URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    const newMedia: ReviewMedia = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      url: imageUrlInput.trim(),
      name: 'Web Photo Link',
    };
    setMediaItems((prev) => [...prev, newMedia]);
    setImageUrlInput('');
    onShowToast('Image URL attached', 'success');
  };

  // Add Video by URL
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    const newMedia: ReviewMedia = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'video',
      url: videoUrlInput.trim(),
      name: 'Web Video Link',
    };
    setMediaItems((prev) => [...prev, newMedia]);
    setVideoUrlInput('');
    onShowToast('Video URL attached', 'success');
  };

  // Remove attached media
  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast('Please provide a short headline for your review.', 'error');
      return;
    }
    if (!comment.trim() || comment.length < 15) {
      onShowToast('Please write at least 15 characters sharing your experience.', 'error');
      return;
    }

    setIsSubmitting(true);
    const newReview: GuestReview = {
      id: `rev-${Date.now()}`,
      roomId: selectedRoom?.id || 'room-0',
      roomName: selectedRoom?.name || 'Diversion Vigan Room',
      roomNumber: selectedRoom?.roomNumber || '0',
      reservationId: preselectedReservation?.id,
      guestId: currentCustomer.id,
      guestName: currentCustomer.name,
      guestEmail: currentCustomer.email,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      media: mediaItems,
      status: 'pending', // Starts as pending for admin screening
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setTimeout(() => {
      onSubmitReview(newReview);
      setIsSubmitting(false);
      onClose();
      onShowToast('Review submitted! It will appear publicly after front desk screening.', 'success');
    }, 400);
  };

  const ratingDescriptions: Record<number, string> = {
    1: 'Poor / Needs Improvement',
    2: 'Fair / Below Expectation',
    3: 'Average / Decent Stay',
    4: 'Very Good / Recommended',
    5: 'Excellent & Outstanding Stay!',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Guest Review
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Write a Review & Upload Media
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Screening Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Your feedback, photos, and video walkthroughs will be screened by the Diversion Vigan front-desk admin team before going live on the public room showcase.
            </p>
          </div>

          {/* Select Room */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Room / Suite Stayed In
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Room {r.roomNumber}) — {r.category}
                </option>
              ))}
            </select>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Your Rating
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:text-amber-400 transition-transform active:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Review Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spacious family room with great air conditioning & Wi-Fi!"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Detailed Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Experience & Feedback
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about room cleanliness, bed comfort, staff hospitality, location convenience, water pressure, or amenities..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
            />
          </div>

          {/* Photo & Video Upload Section */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Upload Photos &amp; Video Walkthrough</span>
                <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-400">
                {mediaItems.length} media attached
              </span>
            </div>

            {/* Upload Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo Upload Card */}
              <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-all cursor-pointer text-center">
                <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Upload Photos
                  </span>
                  <span className="text-[10px] text-slate-400 block">JPG, PNG, WebP</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Video Upload Card */}
              <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-all cursor-pointer text-center">
                <Video className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Upload Video
                  </span>
                  <span className="text-[10px] text-slate-400 block">MP4, MOV, WebM</span>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick URL Input for Photos & Videos */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="flex-1 flex items-center gap-1.5">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste photo URL..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="flex-1 flex items-center gap-1.5">
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="Or paste video clip URL..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddVideoUrl}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Attached Media Previews */}
            {mediaItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center"
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.name || 'Review Photo'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                        <video
                          src={item.url}
                          className="w-full h-full object-cover opacity-80"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="w-8 h-8 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </span>
                        </div>
                        <span className="absolute bottom-1 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">
                          VIDEO
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(item.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title="Remove media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Review...' : 'Submit for Screening'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
