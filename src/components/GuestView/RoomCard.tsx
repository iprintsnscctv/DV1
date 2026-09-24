import React, { useState } from 'react';
import { Room } from '../../types';
import { MapPin, Star, Heart, Calendar as CalendarIcon, ChevronDown, Check, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { formatPHP } from '../../utils/formatCurrency';
import { getRoomCustomRateSummary } from '../../utils/pricingCalculator';

interface RoomCardProps {
  room: Room;
  isSaved?: boolean;
  onToggleSave?: (roomId: string) => void;
  onSelect: (room: Room) => void;
  onBook: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isSaved = false,
  onToggleSave,
  onSelect,
  onBook,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const customRateSummaries = getRoomCustomRateSummary(room);

  // Generate 7 days upcoming calendar preview with dynamic rates
  const today = new Date();
  const upcomingDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const isWeekend = d.getDay() === 5 || d.getDay() === 6; // Fri or Sat

    // Check if room has custom day rate
    let price = room.pricePerNight;
    const dayRule = room.customRates?.dayOfWeekRates?.find(
      (r) => r.day === d.getDay() && r.enabled
    );
    if (dayRule?.fixedPrice) {
      price = dayRule.fixedPrice;
    } else if (dayRule?.rateMultiplier) {
      price = Math.round(room.pricePerNight * dayRule.rateMultiplier);
    }

    return {
      dateStr: `${dayNum}`,
      dayName,
      price,
      isSurge: price > room.pricePerNight,
      isToday: i === 0,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Image Container */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={room.images[0]}
          alt={room.name}
          onClick={() => onSelect(room)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          referrerPolicy="no-referrer"
        />

        {/* Top-Left: Available Today Green Pill */}
        <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Check className="w-3 h-3 stroke-[3]" />
          <span>Available Today</span>
        </div>

        {/* Top-Right: Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.(room.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-amber-500 flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer"
          aria-label={isSaved ? 'Remove from saved' : 'Save room'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isSaved
                ? 'fill-amber-500 text-amber-500'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          />
        </button>


      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Rating Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-xs truncate">
              <MapPin className="w-3.5 h-3.5 fill-amber-600 dark:fill-amber-400 shrink-0" />
              <span className="truncate">{room.location || 'Diversion Road, Vigan City'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold text-xs shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{room.rating ? room.rating.toFixed(2) : '4.90'}</span>
            </div>
          </div>

          {/* Room Title */}
          <h3
            onClick={() => onSelect(room)}
            className="font-bold text-slate-900 dark:text-white text-sm mt-1.5 truncate cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            {room.name}
          </h3>

          {/* Specs: Bed, Bath, Capacity */}
          <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
            {room.bedsCount || 1} Bed • {room.bathsCount || 1} Bath • Up to {room.capacity} guests
          </div>

          {/* Collapsible Check Room Calendar Button */}
          <button
            type="button"
            onClick={() => setShowCalendar((prev) => !prev)}
            className="w-full py-1.5 px-3 mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Check Room Calendar</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                showCalendar ? 'rotate-180 text-amber-600 dark:text-amber-400' : ''
              }`}
            />
          </button>

          {/* Expanded Inline Calendar & Dynamic Rates Drawer */}
          {showCalendar && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <span>7-Day Nightly Rate Preview</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">PHP (₱)</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {upcomingDays.map((d, idx) => (
                  <div
                    key={idx}
                    className={`py-1 px-0.5 rounded-lg border text-[10px] ${
                      d.isToday
                        ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 font-bold text-amber-800 dark:text-amber-200'
                        : d.isSurge
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-700 dark:text-amber-300'
                        : 'bg-white dark:bg-slate-800 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-[9px] text-slate-400 uppercase font-medium">{d.dayName}</div>
                    <div className="font-bold">{d.dateStr}</div>
                    <div className="text-[9px] font-semibold mt-0.5">₱{Math.round(d.price / 1000)}k</div>
                  </div>
                ))}
              </div>
              {customRateSummaries.length > 0 && (
                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-wrap">
                  <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{customRateSummaries.join(' • ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Price & Action Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {formatPHP(room.pricePerNight)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-1">/ night</span>
          </div>

          <button
            type="button"
            onClick={() => onBook(room)}
            disabled={room.status === 'Maintenance'}
            className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            Reserve Room
          </button>
        </div>
      </div>
    </div>
  );
};
