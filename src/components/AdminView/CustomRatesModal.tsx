import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, RoomCustomRates, DayOfWeekRate, SpecificDateRate, DurationDiscountRule } from '../../types';
import { formatPHP } from '../../utils/formatCurrency';
import { X, Calendar, Users, DollarSign, Clock, Plus, Trash2, CheckCircle2, Sparkles, AlertCircle, Tag, Sliders } from 'lucide-react';

interface CustomRatesModalProps {
  room: Room | null;
  onClose: () => void;
  onSaveRates: (roomId: string, customRates: RoomCustomRates) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const CustomRatesModal: React.FC<CustomRatesModalProps> = ({
  room,
  onClose,
  onSaveRates,
  onShowToast,
}) => {
  if (!room) return null;

  const [activeSubTab, setActiveSubTab] = useState<'days' | 'pax' | 'specific_dates' | 'duration'>('days');

  // Days of week state
  const [dayRates, setDayRates] = useState<DayOfWeekRate[]>(() => {
    const existing = room.customRates?.dayOfWeekRates || [];
    return DAYS_NAMES.map((name, index) => {
      const match = existing.find((d) => d.day === index);
      return match || { day: index, name, enabled: false, fixedPrice: undefined, rateMultiplier: undefined };
    });
  });

  // Pax rule state
  const [basePax, setBasePax] = useState<number>(
    room.customRates?.paxRule?.basePax ?? Math.min(2, room.capacity)
  );
  const [extraPaxRate, setExtraPaxRate] = useState<number>(
    room.customRates?.paxRule?.extraPaxRate ?? 350
  );
  const [maxPax, setMaxPax] = useState<number>(
    room.customRates?.paxRule?.maxPax ?? room.capacity
  );

  // Specific dates state
  const [specificDates, setSpecificDates] = useState<SpecificDateRate[]>(
    room.customRates?.specificDateRates ? [...room.customRates.specificDateRates] : []
  );

  // New specific date input
  const [newDateStr, setNewDateStr] = useState<string>('');
  const [newDateName, setNewDateName] = useState<string>('');
  const [newDatePrice, setNewDatePrice] = useState<number>(Math.round(room.pricePerNight * 1.3));

  // Duration discounts state
  const [durationDiscounts, setDurationDiscounts] = useState<DurationDiscountRule[]>(
    room.customRates?.durationDiscounts ? [...room.customRates.durationDiscounts] : []
  );
  const [newMinNights, setNewMinNights] = useState<number>(3);
  const [newDiscountPercent, setNewDiscountPercent] = useState<number>(10);
  const [newDiscountLabel, setNewDiscountLabel] = useState<string>('3+ Nights Transient Special');

  // Preset handlers
  const handleApplyWeekendSurge = () => {
    setDayRates((prev) =>
      prev.map((d) => {
        if (d.day === 5 || d.day === 6) {
          // Friday & Saturday
          return {
            ...d,
            enabled: true,
            fixedPrice: Math.round(room.pricePerNight * 1.2),
            rateMultiplier: undefined,
          };
        }
        return d;
      })
    );
    onShowToast('Applied 20% weekend surge for Friday & Saturday.', 'info');
  };

  const handleApplyWeekdayDiscount = () => {
    setDayRates((prev) =>
      prev.map((d) => {
        if (d.day >= 1 && d.day <= 4) {
          // Mon - Thu
          return {
            ...d,
            enabled: true,
            fixedPrice: Math.round(room.pricePerNight * 0.9),
            rateMultiplier: undefined,
          };
        }
        return d;
      })
    );
    onShowToast('Applied 10% weekday discount for Mon-Thu.', 'info');
  };

  const handleClearDayRates = () => {
    setDayRates((prev) =>
      prev.map((d) => ({ ...d, enabled: false, fixedPrice: undefined, rateMultiplier: undefined }))
    );
  };

  const handleToggleDay = (dayIndex: number) => {
    setDayRates((prev) =>
      prev.map((d) => {
        if (d.day === dayIndex) {
          const nextEnabled = !d.enabled;
          return {
            ...d,
            enabled: nextEnabled,
            fixedPrice: nextEnabled && !d.fixedPrice ? Math.round(room.pricePerNight * 1.15) : d.fixedPrice,
          };
        }
        return d;
      })
    );
  };

  const handleDayPriceChange = (dayIndex: number, price: number) => {
    setDayRates((prev) =>
      prev.map((d) => (d.day === dayIndex ? { ...d, fixedPrice: price, enabled: true } : d))
    );
  };

  // Specific dates handlers
  const handleAddSpecificDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateStr || !newDateName || newDatePrice <= 0) {
      onShowToast('Please specify valid date, event name, and rate.', 'error');
      return;
    }

    if (specificDates.some((d) => d.date === newDateStr)) {
      onShowToast('A custom rate for this date is already added.', 'error');
      return;
    }

    const newRule: SpecificDateRate = {
      id: `sp-${Date.now()}`,
      date: newDateStr,
      name: newDateName,
      pricePerNight: newDatePrice,
    };

    setSpecificDates((prev) => [...prev, newRule]);
    setNewDateStr('');
    setNewDateName('');
    setNewDatePrice(Math.round(room.pricePerNight * 1.3));
    onShowToast(`Added specific day rate for ${newDateName}.`, 'success');
  };

  const handleDeleteSpecificDate = (id: string) => {
    setSpecificDates((prev) => prev.filter((d) => d.id !== id));
    onShowToast('Specific day rate removed.', 'info');
  };

  // Duration discount handlers
  const handleAddDurationDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMinNights <= 1 || newDiscountPercent <= 0) {
      onShowToast('Please provide valid min nights and discount %.', 'error');
      return;
    }

    const newRule: DurationDiscountRule = {
      id: `dur-${Date.now()}`,
      minNights: newMinNights,
      discountPercentage: newDiscountPercent,
      label: newDiscountLabel || `${newMinNights}+ Nights Discount (${newDiscountPercent}% Off)`,
    };

    setDurationDiscounts((prev) => [...prev, newRule]);
    setNewMinNights(5);
    setNewDiscountPercent(15);
    setNewDiscountLabel('5+ Nights Extended Stay (15% Off)');
    onShowToast('Duration discount added.', 'success');
  };

  const handleDeleteDurationDiscount = (id: string) => {
    setDurationDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  // Save all custom rates
  const handleSave = () => {
    const updatedRates: RoomCustomRates = {
      paxRule: {
        basePax,
        extraPaxRate,
        maxPax,
      },
      dayOfWeekRates: dayRates.filter((d) => d.enabled),
      specificDateRates: specificDates,
      durationDiscounts: durationDiscounts,
    };

    onSaveRates(room.id, updatedRates);
    onShowToast(`Custom rates saved for Room ${room.roomNumber}!`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    Custom Rates Configuration
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                    Room {room.roomNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {room.name} • Base Rate: <span className="font-bold text-slate-700 dark:text-slate-200">{formatPHP(room.pricePerNight)}/night</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-900/30 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('days')}
              className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'days'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>By Days of Week ({dayRates.filter((d) => d.enabled).length} active)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('pax')}
              className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'pax'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>By Pax (Guest Count)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('specific_dates')}
              className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'specific_dates'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>By Specific Day / Holidays ({specificDates.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('duration')}
              className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === 'duration'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>By Length of Stay ({durationDiscounts.length})</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
            {/* SUBTAB 1: BY DAYS OF WEEK */}
            {activeSubTab === 'days' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">
                      Day-of-the-Week Surge & Discount Rules
                    </h4>
                    <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mt-0.5">
                      Set custom prices for specific days of the week (e.g., higher weekend rates or discounted mid-week rates).
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleApplyWeekendSurge}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 shadow-sm"
                    >
                      +20% Weekend
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyWeekdayDiscount}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-sm"
                    >
                      -10% Weekday
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDayRates}
                      className="px-2.5 py-1.5 text-xs text-rose-500 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dayRates.map((day) => (
                    <div
                      key={day.day}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        day.enabled
                          ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day.enabled}
                            onChange={() => handleToggleDay(day.day)}
                            className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
                          />
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {day.name}
                          </span>
                        </label>
                        {day.enabled && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                            Custom Rate Active
                          </span>
                        )}
                      </div>

                      {day.enabled && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                              PHP ₱
                            </span>
                            <input
                              type="number"
                              step={50}
                              value={day.fixedPrice ?? room.pricePerNight}
                              onChange={(e) => handleDayPriceChange(day.day, Number(e.target.value))}
                              className="w-full p-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">/night</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Base: {formatPHP(room.pricePerNight)} (
                            {day.fixedPrice && day.fixedPrice > room.pricePerNight
                              ? `+${formatPHP(day.fixedPrice - room.pricePerNight)} surge`
                              : day.fixedPrice && day.fixedPrice < room.pricePerNight
                              ? `-${formatPHP(room.pricePerNight - day.fixedPrice)} discount`
                              : 'Same as base'}
                            )
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 2: BY PAX (GUEST COUNT) */}
            {activeSubTab === 'pax' && (
              <div className="space-y-5">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                    Pax & Extra Guest Pricing Policy
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define the base number of guests covered by the standard nightly rate, and the extra charge per additional guest per night.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Base Included Pax
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={room.capacity}
                      value={basePax}
                      onChange={(e) => setBasePax(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400">
                      Standard nightly rate covers up to {basePax} guest(s).
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Extra Pax Fee (₱ / night)
                    </label>
                    <input
                      type="number"
                      step={50}
                      min={0}
                      value={extraPaxRate}
                      onChange={(e) => setExtraPaxRate(Math.max(0, Number(e.target.value)))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-indigo-600 dark:text-indigo-400"
                    />
                    <p className="text-[10px] text-slate-400">
                      Applied for every guest above {basePax}.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Max Room Capacity
                    </label>
                    <input
                      type="number"
                      min={basePax}
                      max={12}
                      value={maxPax}
                      onChange={(e) => setMaxPax(Math.max(basePax, Number(e.target.value)))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400">
                      Hard limit of occupants for this room.
                    </p>
                  </div>
                </div>

                {/* Pax Simulation / Summary */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                  <h5 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-2">
                    Live Rate Preview by Guest Count:
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {Array.from({ length: maxPax }).map((_, idx) => {
                      const count = idx + 1;
                      const extra = Math.max(0, count - basePax);
                      const price = room.pricePerNight + extra * extraPaxRate;
                      return (
                        <div
                          key={count}
                          className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50"
                        >
                          <div className="text-[10px] text-slate-400">{count} Guest{count > 1 ? 's' : ''}</div>
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {formatPHP(price)}
                          </div>
                          {extra > 0 ? (
                            <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              +{formatPHP(extra * extraPaxRate)} extra
                            </div>
                          ) : (
                            <div className="text-[9px] text-emerald-600 font-semibold">Base rate</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 3: BY SPECIFIC DAY / DATES (HOLIDAYS) */}
            {activeSubTab === 'specific_dates' && (
              <div className="space-y-5">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                    Specific Day & Holiday Rate Overrides
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add specific calendar dates (such as Sinulog, Christmas, New Year, long weekends) where this room has an explicit custom nightly rate.
                  </p>
                </div>

                {/* Add Specific Date Form */}
                <form
                  onSubmit={handleAddSpecificDate}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Specific Date
                    </label>
                    <input
                      type="date"
                      value={newDateStr}
                      onChange={(e) => setNewDateStr(e.target.value)}
                      className="w-full p-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Event / Holiday Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Sinulog Weekend, Christmas"
                      value={newDateName}
                      onChange={(e) => setNewDateName(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Nightly Rate (₱)
                    </label>
                    <input
                      type="number"
                      step={100}
                      min={100}
                      value={newDatePrice}
                      onChange={(e) => setNewDatePrice(Number(e.target.value))}
                      className="w-full p-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      type="submit"
                      className="w-full p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center shadow-md shadow-indigo-600/30"
                      title="Add Specific Date Rule"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* List of Specific Dates */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Configured Specific Dates ({specificDates.length})
                  </h5>
                  {specificDates.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No specific day rates added yet. Use the form above to add holidays or peak dates.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {specificDates.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-100 dark:border-indigo-900">
                              {item.date}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Base: {formatPHP(room.pricePerNight)} • Override: <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatPHP(item.pricePerNight)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                              {formatPHP(item.pricePerNight)}/night
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSpecificDate(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                              title="Delete rule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 4: BY LENGTH OF STAY / DURATION */}
            {activeSubTab === 'duration' && (
              <div className="space-y-5">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                    Stay Duration & Multi-Day Discounts
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reward guests booking for multiple nights with automatic percentage discounts.
                  </p>
                </div>

                {/* Add Duration Rule */}
                <form
                  onSubmit={handleAddDurationDiscount}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Min Nights
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={30}
                      value={newMinNights}
                      onChange={(e) => setNewMinNights(Number(e.target.value))}
                      className="w-full p-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={newDiscountPercent}
                      onChange={(e) => setNewDiscountPercent(Number(e.target.value))}
                      className="w-full p-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-emerald-600"
                      required
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Promo Badge Label
                    </label>
                    <input
                      type="text"
                      value={newDiscountLabel}
                      onChange={(e) => setNewDiscountLabel(e.target.value)}
                      placeholder="e.g. 3+ Nights Staycation"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      type="submit"
                      className="w-full p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center shadow-md shadow-indigo-600/30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Duration rules list */}
                <div className="space-y-2">
                  {durationDiscounts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No duration discounts configured yet.
                    </div>
                  ) : (
                    durationDiscounts.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                            {item.discountPercentage}% OFF
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Requires minimum stay of {item.minNights} nights
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteDurationDiscount(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply & Save Custom Rates</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
