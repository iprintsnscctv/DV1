import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  Copy,
  Printer,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  User,
  Info,
} from 'lucide-react';
import { Room, Reservation } from '../../types';

interface BookingModalProps {
  room: Room | null;
  onClose: () => void;
  onConfirmBooking: (res: Reservation) => Promise<void>;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  onClose,
  onConfirmBooking,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
}) => {
  if (!room) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(initialCheckIn || todayStr);
  const [checkOut, setCheckOut] = useState(initialCheckOut || tomorrowStr);
  const [guests, setGuests] = useState(Math.min(initialGuests, room.capacity));
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Maya' | 'Bank Transfer' | 'Cash'>('GCash');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculate pricing breakdown
  const { nights, breakdown, subtotal, discountAmount, totalAmount } = useMemo(() => {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = endDate.getTime() - startDate.getTime();
    const calculatedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let nightBreakdown: { date: string; dayName: string; isWeekend: boolean; rate: number }[] = [];
    let sum = 0;

    for (let i = 0; i < calculatedNights; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0 is Sun, 5 is Fri, 6 is Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Check for custom date override
      const dateOverride = room.customRates?.customDateRates?.find((r) => r.date === dateStr);
      let nightRate = room.pricePerNight;

      if (dateOverride) {
        nightRate = dateOverride.rate;
      } else if (room.customRates?.paxTierRates) {
        const tier = isWeekend
          ? room.customRates.paxTierRates.friSun?.[guests]
          : room.customRates.paxTierRates.monThu?.[guests];
        if (tier) nightRate = tier;
      }

      nightBreakdown.push({
        date: dateStr,
        dayName,
        isWeekend,
        rate: nightRate,
      });
      sum += nightRate;
    }

    // Apply duration discounts
    let discount = 0;
    const durationDiscounts = room.customRates?.durationDiscounts;
    if (durationDiscounts) {
      if (calculatedNights >= 30 && durationDiscounts.monthlyDiscount) {
        discount = (sum * durationDiscounts.monthlyDiscount) / 100;
      } else if (calculatedNights >= 7 && durationDiscounts.weeklyDiscount) {
        discount = (sum * durationDiscounts.weeklyDiscount) / 100;
      } else if (calculatedNights >= 3 && durationDiscounts.threeNightsDiscount) {
        discount = (sum * durationDiscounts.threeNightsDiscount) / 100;
      }
    }

    return {
      nights: calculatedNights,
      breakdown: nightBreakdown,
      subtotal: sum,
      discountAmount: discount,
      totalAmount: Math.max(0, sum - discount),
    };
  }, [checkIn, checkOut, guests, room]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = `DV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const reservation: Reservation = {
        id: `res-${Date.now()}`,
        confirmationCode: code,
        roomId: room.id,
        roomName: room.name,
        roomNumber: room.roomNumber,
        guestName,
        guestEmail: guestEmail || 'guest@example.com',
        guestPhone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: guests,
        totalAmount,
        status: 'upcoming',
        specialRequests,
        createdAt: new Date().toISOString(),
        paymentMethod,
      };

      await onConfirmBooking(reservation);
      setConfirmedReservation(reservation);
    } catch (err: any) {
      alert(err.message || 'Failed to complete reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (confirmedReservation) {
      navigator.clipboard.writeText(confirmedReservation.confirmationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1a130e] text-[#2a1c14] dark:text-[#f8f4ec] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#ebdcd0] dark:border-[#403024] relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2b2019] hover:bg-gray-200 dark:hover:bg-[#382b22] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedReservation ? (
          /* Confirmation Success View */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Reservation Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2a1c14] dark:text-[#fcf9ee] mt-1 mb-2">
              Mabuhay, {confirmedReservation.guestName}!
            </h2>
            <p className="text-xs sm:text-sm text-[#735745] dark:text-[#c5b2a3] max-w-md mx-auto mb-6">
              Your reservation at <strong>Diversion Vigan</strong> has been successfully placed. We
              look forward to hosting you!
            </p>

            {/* Confirmation Code Card */}
            <div className="bg-[#fbf6f0] dark:bg-[#241a14] border-2 border-dashed border-amber-600/40 p-4 rounded-2xl max-w-md mx-auto mb-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8c6e59] dark:text-[#a89383]">
                Your Confirmation Code
              </span>
              <div className="flex items-center justify-center gap-3 mt-1">
                <span className="text-2xl font-mono font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                  {confirmedReservation.confirmationCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition-colors"
                  title="Copy confirmation code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && <span className="text-[10px] text-emerald-600 font-semibold">Copied to clipboard!</span>}
            </div>

            {/* Summary Details */}
            <div className="bg-gray-50 dark:bg-[#201712] rounded-xl p-4 text-left text-xs space-y-2 mb-6 border border-[#ebdcd0] dark:border-[#382b20]">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Room:</span>
                <span className="font-semibold">{confirmedReservation.roomName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Dates:</span>
                <span className="font-semibold">
                  {confirmedReservation.checkInDate} to {confirmedReservation.checkOutDate} ({nights} {nights === 1 ? 'night' : 'nights'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Guests:</span>
                <span className="font-semibold">{confirmedReservation.numberOfGuests} Guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Payment:</span>
                <span className="font-semibold">{confirmedReservation.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-sm font-bold text-amber-700 dark:text-amber-400">
                <span>Total Amount:</span>
                <span>₱{confirmedReservation.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#2b211a] transition-all"
              >
                <Printer className="w-4 h-4" /> Print / Save Voucher
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                Unit #{room.roomNumber} • {room.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec]">
                Reserve {room.name}
              </h2>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              {/* Dates & Pax Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                    Guests (Pax)
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'} (Max {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Juan Dela Cruz"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                    Mobile Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+63 917 123 4567"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="juan@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                    Payment Preference
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="GCash">GCash Transfer</option>
                    <option value="Maya">Maya (PayMaya)</option>
                    <option value="Bank Transfer">Bank Transfer (BDO / BPI)</option>
                    <option value="Cash">Cash on Check-in (Villa Front Desk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#735745] dark:text-[#c5b2a3] mb-1">
                  Special Requests or Arrival Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Estimated arrival time, extra pillows, celebration setup..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#231a14] text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Price Calculation Box */}
              <div className="bg-[#fbf6f0] dark:bg-[#231a14] p-4 rounded-2xl border border-[#ebdcd0] dark:border-[#382b20]">
                <div className="flex items-center justify-between text-xs font-bold text-[#4a3426] dark:text-[#d8c7b8] mb-2">
                  <span>Pricing Summary ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                  <span>{guests} Pax</span>
                </div>

                <div className="space-y-1 text-xs text-[#735745] dark:text-[#a89383]">
                  {breakdown.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>
                        {item.date} ({item.dayName}) {item.isWeekend ? '• Weekend' : '• Weekday'}
                      </span>
                      <span>₱{item.rate.toLocaleString()}</span>
                    </div>
                  ))}
                  {breakdown.length > 3 && (
                    <div className="text-[10px] text-gray-500 italic">
                      + {breakdown.length - 3} more nights...
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold pt-1">
                      <span>Duration Discount Applied</span>
                      <span>-₱{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec] pt-2 border-t border-[#ebdcd0] dark:border-[#3d2f25]">
                    <span>Total Estimated Amount</span>
                    <span className="text-amber-700 dark:text-amber-400">
                      ₱{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#2b211a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm & Reserve Room</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
