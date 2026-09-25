import React from 'react';
import {
  Calendar,
  Users,
  Search,
  Sparkles,
  Wifi,
  Car,
  Tv,
  Waves,
  Coffee,
  Shield,
} from 'lucide-react';

interface HeroBannerProps {
  checkInDate: string;
  setCheckInDate: (date: string) => void;
  checkOutDate: string;
  setCheckOutDate: (date: string) => void;
  guestsCount: number;
  setGuestsCount: (count: number) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  onSearch: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guestsCount,
  setGuestsCount,
  selectedCategory,
  setSelectedCategory,
  categories,
  onSearch,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#2a1c14] text-white shadow-xl mb-10">
      {/* Background decoration & overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#20150f] via-[#2a1c14]/90 to-transparent z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80")',
        }}
      />

      <div className="relative z-20 px-6 py-12 sm:px-10 sm:py-16 lg:py-20 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ilocano Heritage & Modern Tranquility</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#fbf8f4] leading-tight tracking-tight mb-4">
          Experience Authentic Comfort in Historic Vigan City
        </h1>

        <p className="text-sm sm:text-base text-[#d8c5b3] max-w-2xl leading-relaxed mb-8">
          Welcome to Diversion Vigan Transient and Private Villa. Designed for families, barkada
          getaways, and private celebrations along Diversion Road with exclusive suites, ample
          parking, and tailored group rates.
        </p>

        {/* Property Highlights Pills */}
        <div className="flex flex-wrap gap-3 mb-10 text-xs text-[#e8dbcc]">
          <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
            <Car className="w-4 h-4 text-amber-400" /> Free Gated Parking
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
            <Wifi className="w-4 h-4 text-amber-400" /> High-Speed Wi-Fi
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
            <Waves className="w-4 h-4 text-amber-400" /> Private Villa Pool Access
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
            <Shield className="w-4 h-4 text-amber-400" /> 24/7 CCTV & Security
          </span>
        </div>

        {/* Booking Bar / Quick Search */}
        <div className="bg-white dark:bg-[#1f1712] text-[#2c1d14] dark:text-[#f8f4ec] p-4 sm:p-5 rounded-2xl shadow-2xl border border-[#ebdccd] dark:border-[#403024]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Check-In */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#735745] dark:text-[#c4b1a2] mb-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> Check-in Date
                </span>
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#2b211a] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#735745] dark:text-[#c4b1a2] mb-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> Check-out Date
                </span>
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#2b211a] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Guests / Pax Count */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#735745] dark:text-[#c4b1a2] mb-1.5">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-600" /> Number of Guests
                </span>
              </label>
              <select
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#2b211a] text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest (Pax)' : 'Guests (Pax)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter / CTA */}
            <div>
              <button
                onClick={onSearch}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <Search className="w-4 h-4" />
                <span>Search Available Rooms</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#735745] dark:text-[#b09e91] mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#2a1c14] dark:bg-amber-500 text-amber-300 dark:text-[#1c120c] font-bold shadow-xs'
                    : 'bg-gray-100 dark:bg-[#2c2018] text-[#553e30] dark:text-[#d3c2b4] hover:bg-gray-200 dark:hover:bg-[#382b22]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
