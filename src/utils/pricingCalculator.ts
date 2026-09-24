import { Room, SpecificDateRate, DayOfWeekRate } from '../types';
import { formatPHP } from './formatCurrency';

export interface NightlyBreakdown {
  date: string; // 'YYYY-MM-DD'
  formattedDate: string; // 'Mon, Sep 22'
  dayName: string; // 'Monday'
  rateType: 'base' | 'day_of_week' | 'specific_date';
  rateLabel: string;
  amount: number;
}

export interface PricingCalculationResult {
  nights: number;
  nightlyBreakdown: NightlyBreakdown[];
  nightlySubtotal: number;
  basePax: number;
  extraGuestsCount: number;
  extraPaxRate: number;
  extraPaxTotal: number;
  durationDiscountPercentage: number;
  durationDiscountAmount: number;
  durationDiscountLabel?: string;
  netSubtotal: number;
  vatAmount: number;
  serviceFee: number;
  grandTotal: number;
  customRulesApplied: string[];
}

/**
 * Calculates accurate room stay pricing considering:
 * 1. Specific Day / Holiday rates
 * 2. Day-of-week custom rates (e.g. Weekend surcharges or weekday rates)
 * 3. Pax / Guest count rules (base pax included + extra pax surcharge)
 * 4. Stay duration discounts (e.g. 3+ nights discount)
 */
export function calculateRoomPricing(
  room: Room,
  checkInDateStr: string,
  checkOutDateStr: string,
  numberOfGuests: number = 1
): PricingCalculationResult {
  const customRates = room.customRates;
  const customRulesApplied: string[] = [];

  const checkIn = new Date(checkInDateStr);
  const checkOut = new Date(checkOutDateStr);

  // Fallback if invalid dates
  let diffTime = checkOut.getTime() - checkIn.getTime();
  if (isNaN(diffTime) || diffTime <= 0) {
    diffTime = 1000 * 60 * 60 * 24;
  }
  const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const nightlyBreakdown: NightlyBreakdown[] = [];
  let nightlySubtotal = 0;

  for (let i = 0; i < totalNights; i++) {
    const currentDate = new Date(checkIn);
    currentDate.setDate(checkIn.getDate() + i);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon...
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    // 1. Check for specific date override first
    const specificRate = customRates?.specificDateRates?.find((sr) => sr.date === dateKey);

    if (specificRate) {
      nightlyBreakdown.push({
        date: dateKey,
        formattedDate,
        dayName,
        rateType: 'specific_date',
        rateLabel: `Special Day: ${specificRate.name}`,
        amount: specificRate.pricePerNight,
      });
      nightlySubtotal += specificRate.pricePerNight;
      const ruleText = `${specificRate.name} (${formattedDate})`;
      if (!customRulesApplied.includes(ruleText)) {
        customRulesApplied.push(ruleText);
      }
      continue;
    }

    // 1.5 Check for paxTierRates (Mon-Thu vs Fri-Sun by pax tier)
    if (customRates?.paxTierRates) {
      const isFriSun = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
      const tierMap = isFriSun ? customRates.paxTierRates.friSun : customRates.paxTierRates.monThu;
      const clampedPax = Math.max(1, Math.min(numberOfGuests, room.capacity));
      const nightPrice = tierMap[clampedPax] ?? tierMap[room.capacity] ?? room.pricePerNight;

      nightlyBreakdown.push({
        date: dateKey,
        formattedDate,
        dayName,
        rateType: isFriSun ? 'day_of_week' : 'base',
        rateLabel: `${numberOfGuests} Pax Rate (${isFriSun ? 'Fri-Sun' : 'Mon-Thu'})`,
        amount: nightPrice,
      });
      nightlySubtotal += nightPrice;
      continue;
    }

    // 2. Check for Day-of-Week rate
    const dayRate = customRates?.dayOfWeekRates?.find(
      (dr) => dr.day === dayOfWeek && dr.enabled
    );

    if (dayRate) {
      let nightPrice = room.pricePerNight;
      let label = `${dayName} Custom Rate`;

      if (dayRate.fixedPrice !== undefined && dayRate.fixedPrice > 0) {
        nightPrice = dayRate.fixedPrice;
      } else if (dayRate.rateMultiplier !== undefined && dayRate.rateMultiplier > 0) {
        nightPrice = Math.round(room.pricePerNight * dayRate.rateMultiplier);
        const percent = Math.round((dayRate.rateMultiplier - 1) * 100);
        label = `${dayName} (${percent >= 0 ? `+${percent}%` : `${percent}%`})`;
      }

      nightlyBreakdown.push({
        date: dateKey,
        formattedDate,
        dayName,
        rateType: 'day_of_week',
        rateLabel: label,
        amount: nightPrice,
      });
      nightlySubtotal += nightPrice;
      const ruleText = `${dayName} Custom Rate`;
      if (!customRulesApplied.includes(ruleText)) {
        customRulesApplied.push(ruleText);
      }
      continue;
    }

    // 3. Fallback to standard base nightly rate
    nightlyBreakdown.push({
      date: dateKey,
      formattedDate,
      dayName,
      rateType: 'base',
      rateLabel: 'Base Nightly Rate',
      amount: room.pricePerNight,
    });
    nightlySubtotal += room.pricePerNight;
  }

  // Pax calculation (Rate by Pax)
  const basePax = customRates?.paxRule?.basePax ?? Math.min(2, room.capacity);
  const extraPaxRate = customRates?.paxRule?.extraPaxRate ?? 0;
  const extraGuestsCount = customRates?.paxTierRates ? 0 : Math.max(0, numberOfGuests - basePax);
  const extraPaxTotal = customRates?.paxTierRates ? 0 : extraGuestsCount * extraPaxRate * totalNights;

  if (extraGuestsCount > 0 && extraPaxRate > 0) {
    customRulesApplied.push(
      `Extra Pax: +${formatPHP(extraPaxRate)}/guest/night (${extraGuestsCount} extra pax)`
    );
  }

  // Duration Discount (Rate by Days / Length of Stay)
  let durationDiscountPercentage = 0;
  let durationDiscountLabel: string | undefined;

  if (customRates?.durationDiscounts && customRates.durationDiscounts.length > 0) {
    // Find highest qualifying rule
    const qualifyingDiscounts = customRates.durationDiscounts
      .filter((d) => totalNights >= d.minNights)
      .sort((a, b) => b.minNights - a.minNights);

    if (qualifyingDiscounts.length > 0) {
      const bestDiscount = qualifyingDiscounts[0];
      durationDiscountPercentage = bestDiscount.discountPercentage;
      durationDiscountLabel = bestDiscount.label;
      customRulesApplied.push(bestDiscount.label);
    }
  }

  const preDiscountSubtotal = nightlySubtotal + extraPaxTotal;
  const durationDiscountAmount = Math.round(
    preDiscountSubtotal * (durationDiscountPercentage / 100)
  );

  const netSubtotal = Math.max(0, preDiscountSubtotal - durationDiscountAmount);
  const vatAmount = Math.round(netSubtotal * 0.12);
  const serviceFee = 250; // Standard cleaning & desk service fee in PHP
  const grandTotal = netSubtotal + vatAmount + serviceFee;

  return {
    nights: totalNights,
    nightlyBreakdown,
    nightlySubtotal,
    basePax,
    extraGuestsCount,
    extraPaxRate,
    extraPaxTotal,
    durationDiscountPercentage,
    durationDiscountAmount,
    durationDiscountLabel,
    netSubtotal,
    vatAmount,
    serviceFee,
    grandTotal,
    customRulesApplied,
  };
}

/**
 * Returns a summary array of active custom rates for a room.
 */
export function getRoomCustomRateSummary(room: Room): string[] {
  const summaries: string[] = [];
  const rates = room.customRates;

  if (!rates) return summaries;

  // Day of week summary
  const activeDays = rates.dayOfWeekRates?.filter((d) => d.enabled) || [];
  if (activeDays.length > 0) {
    const dayNames = activeDays.map((d) => d.name.slice(0, 3)).join(', ');
    summaries.push(`Days: ${dayNames}`);
  }

  // Pax rule summary
  if (rates.paxRule && rates.paxRule.extraPaxRate > 0) {
    summaries.push(`Base: ${rates.paxRule.basePax} pax (+${formatPHP(rates.paxRule.extraPaxRate)}/ex)`);
  }

  // Specific dates
  if (rates.specificDateRates && rates.specificDateRates.length > 0) {
    summaries.push(`${rates.specificDateRates.length} Special Day(s)`);
  }

  // Duration discounts
  if (rates.durationDiscounts && rates.durationDiscounts.length > 0) {
    summaries.push(`${rates.durationDiscounts[0].minNights}+ nights discount`);
  }

  return summaries;
}
