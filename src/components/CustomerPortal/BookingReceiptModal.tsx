import React from 'react';
import { Reservation, Room } from '../../types';
import { X, Printer, Calendar, Clock, MapPin, User, Phone, Mail, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { formatPHP } from '../../utils/formatCurrency';
import { DiversionLogo } from '../DiversionLogo';

interface BookingReceiptModalProps {
  reservation: Reservation | null;
  room?: Room;
  onClose: () => void;
}

export const BookingReceiptModal: React.FC<BookingReceiptModalProps> = ({
  reservation,
  room,
  onClose,
}) => {
  if (!reservation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Action Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Official Booking Voucher
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {reservation.confirmationCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 px-3 transition-colors"
              title="Print voucher"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voucher Printable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100">
          {/* Header Brand */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <DiversionLogo size="sm" variant="horizontal" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Diversion Road, Vigan City, Ilocos Sur, Philippines
              </p>
              <p className="text-[11px] text-slate-400">
                Contact: +63 977 123 4567 • diversionvigan@example.com
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                reservation.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : reservation.status === 'upcoming'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {reservation.status}
              </span>
              <div className="text-[10px] text-slate-400 mt-1">
                Issued: {reservation.createdAt}
              </div>
            </div>
          </div>

          {/* Reserved Room Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                Accomodation Details
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                {reservation.roomName} (Room {reservation.roomNumber})
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Diversion Road, Vigan City</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
              <QrCode className="w-12 h-12" />
            </div>
          </div>

          {/* Stay Timeline */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Check-In Date</div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>{reservation.checkInDate}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Standard 2:00 PM</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Check-Out Date</div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>{reservation.checkOutDate}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Standard 12:00 PM (Noon)</span>
              </div>
            </div>
          </div>

          {/* Guest Contact Details */}
          <div className="space-y-2 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Primary Guest Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                <div className="text-[10px] text-slate-400">Guest Name</div>
                <div className="font-bold truncate mt-0.5">{reservation.guestName}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                <div className="text-[10px] text-slate-400">Registered Email</div>
                <div className="font-bold truncate mt-0.5">{reservation.guestEmail}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                <div className="text-[10px] text-slate-400">Phone Number</div>
                <div className="font-bold truncate mt-0.5">{reservation.guestPhone}</div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Payment Status</div>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid via {reservation.paymentMethod}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Amount Paid</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatPHP(reservation.totalAmount)}
              </div>
            </div>
          </div>

          {/* House Notice */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            Please present this voucher or state your confirmation code <span className="font-bold">{reservation.confirmationCode}</span> upon arrival at the Diversion Vigan Front Desk. Valid government-issued ID is required for transient check-in.
          </div>
        </div>
      </div>
    </div>
  );
};
