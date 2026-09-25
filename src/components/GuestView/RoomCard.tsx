import React, { useState } from 'react';
import { Room, Reservation } from '../../types';
import { MapPin, Star, Heart, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { formatPHP } from '../../utils/formatCurrency';

interface RoomCardProps {
  room: Room;
  isSaved?: boolean;
  reservations?: Reservation[];
  checkInDate?: string;
  checkOutDate?: string;
  onCheckInChange?: (date: string) => void;
  onCheckOutChange?: (date: string) => void;
  onToggleSave?: (roomId: string) => void;
  onSelect: (room: Room) => void;
  onBook: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isSaved = false,
  reservations = [],
  checkInDate = '2026-09-24',
  checkOutDate = '2026-09-26',
  onCheckInChange,
  onCheckOutChange,
  onToggleSave,
  onSelect,
  onBook,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  // Month navigation state initialized to check-in date's month or default September 2026
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (checkInDate) {
      const d = new Date(checkInDate);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(2026, 8, 1);
  });

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const monthName = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  // Helper to check if a specific date is booked for this room
  const isDateBooked = (dateStr: string) => {
    if (room.status === 'Maintenance') return true;
    return reservations.some((r) => {
      if (r.roomId !== room.id || r.status === 'cancelled') return false;
      return dateStr >= r.checkInDate && dateStr < r.checkOutDate;
    });
  };

  // Helper to check if a specific date is currently selected
  const isDateSelected = (dateStr: string) => {
    if (!checkInDate) return false;
    if (checkOutDate) {
      return dateStr >= checkInDate && dateStr <= checkOutDate;
    }
    return dateStr === checkInDate;
  };

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

          {/* 1-Month Calendar Viewing with Color Coding */}
          {showCalendar && (
            <div className="mt-2.5 p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2.5 animate-in fade-in duration-200">
              {/* Month Navigation Header */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {monthName}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 dark:text-slate-500">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* 1-Month Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty cells before 1st of month */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7" />
                ))}

                {/* Days of current month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = isDateSelected(dateStr);
                  const isBooked = isDateBooked(dateStr);
                  const isAvailable = !isBooked && !isSelected;

                  let cellClass = '';
                  if (isSelected) {
                    // Green: Selected Date
                    cellClass = 'bg-emerald-500 text-white font-bold shadow-xs border-emerald-600 ring-1 ring-emerald-400';
                  } else if (isBooked) {
                    // Red: Booked Date
                    cellClass = 'bg-red-500 text-white font-bold border-red-600 opacity-90 cursor-not-allowed';
                  } else {
                    // Orange: Available Date
                    cellClass = 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800/60 font-semibold hover:bg-orange-500 hover:text-white cursor-pointer';
                  }

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isBooked}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAvailable || isSelected) {
                          onCheckInChange?.(dateStr);
                          const nextDay = new Date(year, month, dayNum + 1);
                          const nextStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
                          onCheckOutChange?.(nextStr);
                        }
                      }}
                      title={`${dateStr} (${isSelected ? 'Selected' : isBooked ? 'Booked' : 'Available'})`}
                      className={`h-7 w-full rounded-lg border text-[11px] flex items-center justify-center transition-all ${cellClass}`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Color Coding Legend */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-[10px] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Available</span>
                </div>
              </div>
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
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
