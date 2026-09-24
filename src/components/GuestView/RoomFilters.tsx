import React from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { FilterState, RoomCategory } from '../../types';
import { AMENITIES_LIST } from '../../data/mockData';
import { formatPHP } from '../../utils/formatCurrency';

interface RoomFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
}

const CATEGORIES: (RoomCategory | 'All')[] = [
  'All',
  'Standard Transient',
  'Deluxe Suite',
  'Executive Loft',
  'Family Villa',
  'Budget Pod'
];

export const RoomFilters: React.FC<RoomFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const toggleAmenity = (amenity: string) => {
    const exists = filters.amenities.includes(amenity);
    const updated = exists
      ? filters.amenities.filter((a: string) => a !== amenity)
      : [...filters.amenities, amenity];
    onFilterChange({ amenities: updated });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-5 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search rooms by name or feature..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange({ category: cat })}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                filters.category === cat
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/25 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors self-end md:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Advanced Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {/* Capacity */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Minimum Guest Capacity
          </label>
          <select
            value={filters.capacity}
            onChange={(e) => onFilterChange({ capacity: Number(e.target.value) })}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/25"
          >
            <option value={1}>1+ Guests</option>
            <option value={2}>2+ Guests</option>
            <option value={4}>4+ Guests</option>
            <option value={6}>6+ Guests</option>
          </select>
        </div>

        {/* Max Price */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>Max Nightly Rate</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{formatPHP(filters.maxPrice)}/night</span>
          </div>
          <input
            type="range"
            min={500}
            max={6000}
            step={100}
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Room Availability
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/25"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available Now</option>
            <option value="Booked">Booked</option>
            <option value="Reserved">Reserved</option>
            <option value="Maintenance">Under Maintenance</option>
          </select>
        </div>
      </div>

      {/* Amenities Tags */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
          Filter by Amenities:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES_LIST.slice(0, 8).map((amenity) => {
            const isSelected = filters.amenities.includes(amenity);
            return (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
