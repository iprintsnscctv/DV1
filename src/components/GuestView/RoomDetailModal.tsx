import React, { useState } from 'react';
import { Room, GuestReview, ReviewMedia } from '../../types';
import { 
  X, Users, Check, Shield, Clock, Calendar, ChevronLeft, ChevronRight, 
  Sparkles, AlertCircle, Star, Image as ImageIcon, Video, Play, ShieldCheck, MessageSquare 
} from 'lucide-react';
import { formatPHP } from '../../utils/formatCurrency';

interface RoomDetailModalProps {
  room: Room;
  reviews?: GuestReview[];
  onClose: () => void;
  onBook: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({ 
  room, 
  reviews = [], 
  onClose, 
  onBook 
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeMedia, setActiveMedia] = useState<ReviewMedia | null>(null);

  const roomReviews = reviews.filter((r) => r.roomId === room.id && r.status === 'approved');

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Room {room.roomNumber} • {room.category}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{room.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="overflow-y-auto p-6 space-y-6">
            {/* Image Gallery Slider */}
            <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
              <img
                src={room.images[activeImageIndex]}
                alt={room.name}
                className="w-full h-full object-cover transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

              {room.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                {room.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Overview Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Capacity</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Up to {room.capacity} Guests</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Floor & Size</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                  Floor {room.floor} • {room.sizeSqM} m²
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Nightly Rate</div>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {formatPHP(room.pricePerNight)} PHP
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Transient Hourly</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {room.pricePerHour ? `${formatPHP(room.pricePerHour)}/hr` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">About This Room</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {room.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Room Amenities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {room.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Rates Matrix Card (Days, Pax, Holidays) */}
            {room.customRates && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Special Dynamic Rates & Pax Policies</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    PHP (₱)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Pax policy */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Guest Capacity</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      Base: {room.customRates.paxRule?.basePax || Math.min(2, room.capacity)} Pax
                    </div>
                    {room.customRates.paxRule && room.customRates.paxRule.extraPaxRate > 0 && (
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                        +{formatPHP(room.customRates.paxRule.extraPaxRate)} / extra pax
                      </div>
                    )}
                  </div>

                  {/* Weekend / Days of week */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Days of the Week</div>
                    {room.customRates.dayOfWeekRates && room.customRates.dayOfWeekRates.filter((d) => d.enabled).length > 0 ? (
                      <div className="text-[11px] text-slate-900 dark:text-white font-medium mt-0.5">
                        {room.customRates.dayOfWeekRates
                          .filter((d) => d.enabled)
                          .map((d) => `${d.name.slice(0, 3)}: ${formatPHP(d.fixedPrice || room.pricePerNight)}`)
                          .join(', ')}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 mt-0.5">Uniform daily base rate</div>
                    )}
                  </div>

                  {/* Holidays or Stay Discounts */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Special Dates / Perks</div>
                    {room.customRates.specificDateRates && room.customRates.specificDateRates.length > 0 ? (
                      <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                        {room.customRates.specificDateRates.length} Holiday Date(s) Configured
                      </div>
                    ) : room.customRates.durationDiscounts && room.customRates.durationDiscounts.length > 0 ? (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        {room.customRates.durationDiscounts[0].label}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 mt-0.5">Standard booking terms</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* House Rules & Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  House Rules
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {room.houseRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Cancellation & Policies
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {room.cancellationPolicy}
                </p>
                <div className="mt-3 text-[11px] text-slate-500">
                  Standard Check-in: 2:00 PM | Check-out: 12:00 PM (Noon)
                </div>
              </div>
            </div>

            {/* Verified Guest Reviews & Media Showcase */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Verified Guest Reviews &amp; Media ({roomReviews.length})</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Real photos, walkthrough videos, and honest feedback from verified guests.
                  </p>
                </div>
              </div>

              {roomReviews.length > 0 ? (
                <div className="space-y-3.5">
                  {roomReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold text-xs flex items-center justify-center">
                            {rev.guestName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{rev.guestName}</span>
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>Verified Stay</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-400">({rev.createdAt})</span>
                        </div>
                      </div>

                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        "{rev.title}"
                      </h5>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Review Photos & Videos */}
                      {rev.media && rev.media.length > 0 && (
                        <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                          {rev.media.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setActiveMedia(item)}
                              className="relative group w-20 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all shrink-0"
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
                                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                                  </span>
                                  <span className="absolute bottom-0.5 right-1 text-[7px] font-bold px-1 rounded bg-black/80 text-white">
                                    VIDEO
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-center text-xs text-slate-400">
                  Be the first verified guest to review this room after your stay!
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Total Price per night</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatPHP(room.pricePerNight)} <span className="text-xs font-normal text-slate-500">PHP</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onBook(room);
                }}
                disabled={room.status === 'Maintenance'}
                className={`px-6 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all cursor-pointer ${
                  room.status === 'Maintenance'
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                }`}
              >
                Proceed to Book
              </button>
            </div>
          </div>
        </div>

        {/* Media Lightbox */}
        {activeMedia && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 text-white">
                <span className="text-xs font-bold flex items-center gap-2">
                  {activeMedia.type === 'video' ? <Video className="w-4 h-4 text-rose-500" /> : <ImageIcon className="w-4 h-4 text-amber-500" />}
                  {activeMedia.name || 'Guest Media'}
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
      </div>
    );
};
