import React, { useState } from 'react';
import { Room, RoomCustomRates, SpecificDateRate } from '../../types';
import { formatPHP } from '../../utils/formatCurrency';
import { 
  Sliders, Calendar, Users, Tag, Clock, Plus, 
  CheckCircle2, AlertCircle, Sparkles, Edit3, ArrowRight, Layers 
} from 'lucide-react';

interface CustomRatesOverviewProps {
  rooms: Room[];
  onOpenCustomRatesForRoom: (room: Room) => void;
  onSaveRatesForRoom: (roomId: string, customRates: RoomCustomRates) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const CustomRatesOverview: React.FC<CustomRatesOverviewProps> = ({
  rooms,
  onOpenCustomRatesForRoom,
  onSaveRatesForRoom,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSection, setActiveSection] = useState<'days' | 'pax' | 'specific_dates'>('days');

  // Quick holiday apply modal state
  const [showGlobalHolidayModal, setShowGlobalHolidayModal] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [holidaySurgePercentage, setHolidaySurgePercentage] = useState(25);

  const filteredRooms = rooms.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  // Apply a specific holiday rate across all rooms
  const handleApplyGlobalHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayName) {
      onShowToast('Please provide a date and holiday name.', 'error');
      return;
    }

    rooms.forEach((room) => {
      const existingRates = room.customRates || {};
      const existingSpecific = existingRates.specificDateRates || [];

      // Calculate surge price
      const surgePrice = Math.round(room.pricePerNight * (1 + holidaySurgePercentage / 100));

      const updatedSpecific: SpecificDateRate[] = [
        ...existingSpecific.filter((d) => d.date !== holidayDate),
        {
          id: `sp-${Date.now()}-${room.id}`,
          date: holidayDate,
          name: holidayName,
          pricePerNight: surgePrice,
        },
      ];

      onSaveRatesForRoom(room.id, {
        ...existingRates,
        specificDateRates: updatedSpecific,
      });
    });

    onShowToast(`Applied ${holidayName} (${holidaySurgePercentage}% surge) across all rooms!`, 'success');
    setShowGlobalHolidayModal(false);
    setHolidayDate('');
    setHolidayName('');
  };

  // Quick batch apply weekend surge (+20% for Fri & Sat)
  const handleBatchApplyWeekendSurge = () => {
    rooms.forEach((room) => {
      const existingRates = room.customRates || {};
      const currentDayRates = existingRates.dayOfWeekRates || [];

      const updatedDays = DAY_NAMES.map((name, idx) => {
        const match = currentDayRates.find((d) => d.day === idx);
        if (idx === 5 || idx === 6) {
          // Friday & Saturday
          return {
            day: idx,
            name,
            enabled: true,
            fixedPrice: Math.round(room.pricePerNight * 1.2),
          };
        }
        return match || { day: idx, name, enabled: false };
      });

      onSaveRatesForRoom(room.id, {
        ...existingRates,
        dayOfWeekRates: updatedDays,
      });
    });

    onShowToast('Weekend Surge (+20% Fri/Sat) applied to all rooms.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-amber-600/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Front-Desk Rate Matrix
              </span>
              <span className="text-xs text-amber-200/80">• Dynamic Pricing & Surge Controls</span>
            </div>
            <h2 className="text-2xl font-black mt-1">
              Custom Rates: By Days, Pax & Specific Day
            </h2>
            <p className="text-xs text-amber-100/80 mt-1 max-w-xl">
              Configure specialized night-by-night rates for weekends, guest surcharges for extra occupants, and holiday/festival date overrides.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleBatchApplyWeekendSurge}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Apply +20% Weekend to All</span>
            </button>
            <button
              onClick={() => setShowGlobalHolidayModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Holiday / Special Date to All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveSection('days')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'days'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1. Rates by Days of Week</span>
          </button>

          <button
            onClick={() => setActiveSection('pax')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'pax'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2. Rates by Pax (Guest Count)</span>
          </button>

          <button
            onClick={() => setActiveSection('specific_dates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'specific_dates'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>3. Rates by Specific Day / Holiday</span>
          </button>
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="All">All Room Categories</option>
          <option value="Standard Transient">Standard Transient</option>
          <option value="Deluxe Suite">Deluxe Suite</option>
          <option value="Executive Loft">Executive Loft</option>
          <option value="Family Villa">Family Villa</option>
          <option value="Budget Pod">Budget Pod</option>
        </select>
      </div>

      {/* SECTION 1: RATES BY DAYS OF WEEK */}
      {activeSection === 'days' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Day-of-the-Week Rate Matrix (Sun - Sat)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare base rates versus custom day rates for every room.
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Rates shown in Philippine Peso (PHP ₱)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Room</th>
                  <th className="p-3.5">Base Rate</th>
                  {DAY_NAMES.map((day) => (
                    <th key={day} className={`p-3.5 text-center ${day === 'Friday' || day === 'Saturday' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}>
                      {day.slice(0, 3)}
                    </th>
                  ))}
                  <th className="p-3.5 text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRooms.map((room) => {
                  const dayRates = room.customRates?.dayOfWeekRates || [];

                  return (
                    <tr key={room.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div>Room {room.roomNumber}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{room.name}</div>
                      </td>

                      <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {formatPHP(room.pricePerNight)}
                      </td>

                      {DAY_NAMES.map((_, dayIdx) => {
                        const customDay = dayRates.find((d) => d.day === dayIdx && d.enabled);
                        const isWeekend = dayIdx === 5 || dayIdx === 6;

                        if (customDay && customDay.fixedPrice) {
                          const diff = customDay.fixedPrice - room.pricePerNight;
                          return (
                            <td key={dayIdx} className="p-3.5 text-center">
                              <span className="inline-block px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {formatPHP(customDay.fixedPrice)}
                              </span>
                              {diff !== 0 && (
                                <div className={`text-[9px] font-semibold mt-0.5 ${diff > 0 ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                  {diff > 0 ? `+${formatPHP(diff)}` : `-${formatPHP(Math.abs(diff))}`}
                                </div>
                              )}
                            </td>
                          );
                        }

                        return (
                          <td key={dayIdx} className="p-3.5 text-center text-slate-400">
                            <span className={isWeekend ? 'font-semibold text-slate-500' : ''}>
                              {formatPHP(room.pricePerNight)}
                            </span>
                          </td>
                        );
                      })}

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onOpenCustomRatesForRoom(room)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-colors"
                        >
                          Edit Days
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: RATES BY PAX (GUEST COUNT) */}
      {activeSection === 'pax' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              Guest Capacity & Extra Pax Pricing Rules
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rooms charge base nightly rate for up to the "Base Pax", with automatic extra fees added per additional occupant per night.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const paxRule = room.customRates?.paxRule;
              const base = paxRule?.basePax ?? Math.min(2, room.capacity);
              const extraRate = paxRule?.extraPaxRate ?? 0;
              const max = paxRule?.maxPax ?? room.capacity;

              return (
                <div
                  key={room.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        Room {room.roomNumber}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {room.category}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {room.name}
                    </h4>

                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Base Nightly Rate:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatPHP(room.pricePerNight)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Base Pax Included:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{base} Guest(s)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Extra Pax Fee:</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {extraRate > 0 ? `+${formatPHP(extraRate)} / guest / night` : 'No surcharge'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Max Room Capacity:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{max} Guests</span>
                      </div>
                    </div>

                    {/* Preview Table */}
                    <div className="mt-3 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Estimated Nightly Total by Pax:</div>
                      <div className="grid grid-cols-4 gap-1 text-[11px] text-center">
                        {Array.from({ length: Math.min(4, max) }).map((_, idx) => {
                          const pax = idx + 1;
                          const extra = Math.max(0, pax - base);
                          const total = room.pricePerNight + extra * extraRate;
                          return (
                            <div key={pax} className="p-1.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                              <div className="text-[9px] text-slate-400">{pax}p</div>
                              <div className="font-bold text-slate-900 dark:text-white">{formatPHP(total)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => onOpenCustomRatesForRoom(room)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Adjust Pax Rules</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: RATES BY SPECIFIC DAY / HOLIDAYS */}
      {activeSection === 'specific_dates' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                Calendar Date Overrides (Holidays, Sinulog, Peak Dates)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Any booking touching these specific calendar dates will automatically calculate using this exact override rate.
              </p>
            </div>
            <button
              onClick={() => setShowGlobalHolidayModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday Date to All Rooms</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const specificDates = room.customRates?.specificDateRates || [];

              return (
                <div
                  key={room.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                        Room {room.roomNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {specificDates.length} Specific Date(s)
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                      {room.name}
                    </h4>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Base Rate: {formatPHP(room.pricePerNight)}/night
                    </div>

                    <div className="mt-4 space-y-2">
                      {specificDates.length === 0 ? (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                          No specific day rates configured.
                        </div>
                      ) : (
                        specificDates.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Date: {item.date}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">
                                {formatPHP(item.pricePerNight)}
                              </div>
                              <div className="text-[9px] text-slate-400">per night</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => onOpenCustomRatesForRoom(room)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition-colors"
                    >
                      Manage Specific Dates
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Holiday Modal */}
      {showGlobalHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Add Special / Holiday Date to All Rooms
              </h3>
              <button
                onClick={() => setShowGlobalHolidayModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyGlobalHoliday} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Specific Calendar Date
                </label>
                <input
                  type="date"
                  required
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Holiday / Event Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sinulog Festival Peak, Christmas Eve"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Surge Rate Percentage (% above base rate)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={holidaySurgePercentage}
                    onChange={(e) => setHolidaySurgePercentage(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400 min-w-[50px]">
                    +{holidaySurgePercentage}%
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGlobalHolidayModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
                >
                  Apply to All Rooms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
