import React, { useState } from 'react';
import { X, Save, Sparkles, Percent, Calendar } from 'lucide-react';
import { Room, CustomRates } from '../../types';

interface CustomRatesModalProps {
  room: Room;
  onClose: () => void;
  onSave: (roomId: string, customRates: CustomRates) => Promise<void>;
}

export const CustomRatesModal: React.FC<CustomRatesModalProps> = ({
  room,
  onClose,
  onSave,
}) => {
  const maxPax = room.capacity;

  const [monThuRates, setMonThuRates] = useState<Record<number, number>>(() => {
    const existing = room.customRates?.paxTierRates?.monThu || {};
    const init: Record<number, number> = {};
    for (let i = 1; i <= maxPax; i++) {
      init[i] = existing[i] || room.pricePerNight;
    }
    return init;
  });

  const [friSunRates, setFriSunRates] = useState<Record<number, number>>(() => {
    const existing = room.customRates?.paxTierRates?.friSun || {};
    const init: Record<number, number> = {};
    for (let i = 1; i <= maxPax; i++) {
      init[i] = existing[i] || Math.round(room.pricePerNight * 1.15);
    }
    return init;
  });

  const [threeNightsDiscount, setThreeNightsDiscount] = useState<number>(
    room.customRates?.durationDiscounts?.threeNightsDiscount ?? 5
  );
  const [weeklyDiscount, setWeeklyDiscount] = useState<number>(
    room.customRates?.durationDiscounts?.weeklyDiscount ?? 10
  );
  const [monthlyDiscount, setMonthlyDiscount] = useState<number>(
    room.customRates?.durationDiscounts?.monthlyDiscount ?? 20
  );

  const [saving, setSaving] = useState(false);

  const handlePaxChange = (
    tier: 'monThu' | 'friSun',
    pax: number,
    value: number
  ) => {
    if (tier === 'monThu') {
      setMonThuRates((prev) => ({ ...prev, [pax]: value }));
    } else {
      setFriSunRates((prev) => ({ ...prev, [pax]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedRates: CustomRates = {
        ...room.customRates,
        paxTierRates: {
          monThu: monThuRates,
          friSun: friSunRates,
        },
        durationDiscounts: {
          threeNightsDiscount,
          weeklyDiscount,
          monthlyDiscount,
        },
      };

      await onSave(room.id, updatedRates);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save custom rates');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1a130e] text-[#2a1c14] dark:text-[#f8f4ec] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#ebdcd0] dark:border-[#403024] relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2b2019] hover:bg-gray-200 dark:hover:bg-[#382b22] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Rate Management
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec]">
            Custom Pricing: {room.name}
          </h2>
          <p className="text-xs text-[#735745] dark:text-[#c5b2a3]">
            Configure per-pax weekday (Mon-Thu) vs weekend (Fri-Sun) pricing and length-of-stay discounts.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Pax Tier Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#473326] dark:text-[#d3c1b3] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> Pax Tier Rates (PHP / Night)
            </h4>
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-[#231a14] text-[#553e30] dark:text-[#d3c2b4] font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Guest Count</th>
                    <th className="p-2.5">Weekday (Mon–Thu)</th>
                    <th className="p-2.5">Weekend (Fri–Sun)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {Array.from({ length: maxPax }).map((_, idx) => {
                    const pax = idx + 1;
                    return (
                      <tr key={pax}>
                        <td className="p-2.5 font-semibold text-gray-700 dark:text-gray-300">
                          {pax} Pax
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={monThuRates[pax] ?? room.pricePerNight}
                            onChange={(e) =>
                              handlePaxChange('monThu', pax, Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#281e18] text-xs font-mono font-bold text-amber-800 dark:text-amber-300 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={friSunRates[pax] ?? Math.round(room.pricePerNight * 1.15)}
                            onChange={(e) =>
                              handlePaxChange('friSun', pax, Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#281e18] text-xs font-mono font-bold text-amber-900 dark:text-amber-400 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stay Duration Discounts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#473326] dark:text-[#d3c1b3] mb-2 flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-600" /> Duration Discounts (%)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  3+ Nights (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={threeNightsDiscount}
                  onChange={(e) => setThreeNightsDiscount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Weekly 7+ Nights (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={weeklyDiscount}
                  onChange={(e) => setWeeklyDiscount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Monthly 30+ Nights (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="70"
                  value={monthlyDiscount}
                  onChange={(e) => setMonthlyDiscount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs font-semibold focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#2b211a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Rate Structure'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
