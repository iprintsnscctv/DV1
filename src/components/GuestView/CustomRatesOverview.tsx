'use client';

import React from 'react';
import { Room } from '../../types';
import { Sparkles, Calendar, Tag } from 'lucide-react';

interface CustomRatesOverviewProps {
  room: Room;
}

export const CustomRatesOverview: React.FC<CustomRatesOverviewProps> = ({ room }) => {
  const customRates = room.customRates;
  const paxTierRates = customRates?.paxTierRates;

  if (!paxTierRates && !customRates?.durationDiscounts?.length) {
    return null;
  }

  const maxPax = room.capacity || 4;
  const paxList = Array.from({ length: maxPax }, (_, i) => i + 1);

  return (
    <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/70 text-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-amber-950">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Transparent Pax & Season Rates</span>
        </div>
        <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
          Base: ₱{room.pricePerNight.toLocaleString()}/night
        </span>
      </div>

      {paxTierRates && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-amber-200/60 text-amber-900 font-medium">
                <th className="py-1 pr-2">Pax</th>
                <th className="py-1 px-2">Mon - Thu (Weekday)</th>
                <th className="py-1 pl-2">Fri - Sun (Weekend)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-200/40 text-gray-800">
              {paxList.map((pax) => {
                const monThu = paxTierRates.monThu?.[pax] ?? room.pricePerNight;
                const friSun = paxTierRates.friSun?.[pax] ?? Math.round(monThu * 1.15);
                return (
                  <tr key={pax} className="hover:bg-amber-100/40">
                    <td className="py-1 pr-2 font-medium">{pax} Guest{pax > 1 ? 's' : ''}</td>
                    <td className="py-1 px-2 text-emerald-800 font-medium">₱{monThu.toLocaleString()}</td>
                    <td className="py-1 pl-2 text-amber-800 font-semibold">₱{friSun.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {customRates?.durationDiscounts && customRates.durationDiscounts.length > 0 && (
        <div className="pt-2 border-t border-amber-200/60 space-y-1">
          <div className="flex items-center gap-1 text-amber-900 font-medium text-[11px]">
            <Tag className="w-3 h-3 text-amber-600" />
            <span>Length of Stay Discounts:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {customRates.durationDiscounts.map((disc) => (
              <span
                key={disc.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-amber-300 rounded-md text-[10px] text-amber-900 font-medium shadow-2xs"
              >
                <Calendar className="w-2.5 h-2.5 text-amber-600" />
                {disc.label} ({disc.discountPercentage}% OFF)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
