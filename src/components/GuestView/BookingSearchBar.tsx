import React from 'react';
import { Bed, Calendar as CalendarIcon, Users, Minus, Plus } from 'lucide-react';

interface BookingSearchBarProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onGuestsCountChange: (count: number) => void;
}

export const BookingSearchBar: React.FC<BookingSearchBarProps> = ({
  selectedCategory = 'All',
  onSelectCategory,
  checkInDate,
  checkOutDate,
  guestsCount,
  onCheckInChange,
  onCheckOutChange,
  onGuestsCountChange,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 mb-8 transition-all">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
        {/* Column 1: Book Here with Room Type */}
        <div className="lg:col-span-4 sm:col-span-2">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Bed className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>BOOK NOW</span>
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory?.(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-amber-500/25 cursor-pointer appearance-none pr-8 truncate"
            >
              <option value="All">All Room Types (Family, Studio, Lofts)</option>
              <option value="Family Suites">Family Suites</option>
              <option value="Studio Rooms">Studio Rooms</option>
              <option value="Lofts">High-Ceiling Glass Lofts</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Column 2: Check-In */}
        <div className="lg:col-span-3 sm:col-span-1">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>CHECK-IN</span>
          </div>
          <div className="relative">
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => onCheckInChange(e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-amber-500/25"
            />
          </div>
        </div>

        {/* Column 3: Check-Out */}
        <div className="lg:col-span-3 sm:col-span-1">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>CHECK-OUT</span>
          </div>
          <div className="relative">
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => onCheckOutChange(e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-amber-500/25"
            />
          </div>
        </div>

        {/* Column 4: Guests */}
        <div className="lg:col-span-2 sm:col-span-2">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>GUESTS</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onGuestsCountChange(Math.max(1, guestsCount - 1))}
              disabled={guestsCount <= 1}
              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              aria-label="Decrease guests"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs sm:text-sm font-semibold">
              {guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'}
            </span>
            <button
              type="button"
              onClick={() => onGuestsCountChange(Math.min(12, guestsCount + 1))}
              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              aria-label="Increase guests"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
