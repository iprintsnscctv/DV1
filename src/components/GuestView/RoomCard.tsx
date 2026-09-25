import React, { useState } from 'react';
import {
  Users,
  Bed,
  Bath,
  Maximize2,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { Room } from '../../types';

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
  onViewRates: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onBook, onViewRates }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = room.images && room.images.length > 0 ? room.images : [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  ];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const isAvailable = room.status === 'Available';

  // Extract base Mon-Thu vs Fri-Sun sample pricing
  const monThuBase = room.customRates?.paxTierRates?.monThu?.[room.capacity] || room.pricePerNight;
  const friSunBase = room.customRates?.paxTierRates?.friSun?.[room.capacity] || Math.round(room.pricePerNight * 1.15);

  return (
    <div className="bg-white dark:bg-[#1e1611] rounded-2xl overflow-hidden border border-[#e8d8c8] dark:border-[#382b20] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Image Carousel */}
      <div className="relative h-60 w-full overflow-hidden bg-gray-900">
        <img
          src={images[currentImageIndex]}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-md ${
              isAvailable
                ? 'bg-emerald-600 text-white'
                : room.status === 'Reserved'
                ? 'bg-amber-600 text-white'
                : room.status === 'Booked'
                ? 'bg-red-600 text-white'
                : 'bg-gray-600 text-white'
            }`}
          >
            {room.status}
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20">
            {room.category}
          </span>
        </div>

        {/* Carousel controls if multi-image */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Unit #{room.roomNumber} • Floor {room.floor}
              </span>
              <h3 className="text-lg font-serif font-bold text-[#2a1c14] dark:text-[#fbf8f4] leading-snug">
                {room.name}
              </h3>
            </div>
            {room.rating && (
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-200 dark:border-amber-800/60">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{room.rating}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-[#6e5443] dark:text-[#beaba0] line-clamp-2 mb-4 leading-relaxed">
            {room.description}
          </p>

          {/* Quick Specs */}
          <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#ede1d3] dark:border-[#382b20] mb-4 text-xs text-[#523d30] dark:text-[#d4c3b5]">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Up to {room.capacity} Pax</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-amber-600" />
              <span>{room.bedsCount || 2} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-amber-600" />
              <span>{room.bathsCount || 1} Bath</span>
            </div>
          </div>

          {/* Amenities tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {room.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-[#f6eee5] dark:bg-[#281e18] text-[#553f31] dark:text-[#cdbcb0] font-medium"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md text-amber-700 dark:text-amber-400 font-semibold">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Booking CTA */}
        <div className="pt-3 border-t border-[#ede1d3] dark:border-[#382b20]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-serif text-[#2a1c14] dark:text-[#fcfaf7]">
                  ₱{room.pricePerNight.toLocaleString()}
                </span>
                <span className="text-xs text-[#786151] dark:text-[#bcaaa0]">/ night</span>
              </div>
              <div className="text-[10px] text-[#8c7463] dark:text-[#9e8c80]">
                Weekday ₱{monThuBase.toLocaleString()} • Weekend ₱{friSunBase.toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => onViewRates(room)}
              className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Info className="w-3 h-3" /> Rate Breakdown
            </button>
          </div>

          <div className="flex gap-2">
            <button
              disabled={!isAvailable}
              onClick={() => onBook(room)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                isAvailable
                  ? 'bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white shadow-amber-600/20 hover:shadow-md'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAvailable ? 'Book This Room' : 'Currently Unavailable'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
