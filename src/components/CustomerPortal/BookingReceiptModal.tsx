import React, { useRef, useState } from 'react';
import { Reservation, Room } from '../../types';
import {
  X,
  Printer,
  Download,
  Share2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  Building2,
  FileCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { formatPHP } from '../../utils/formatCurrency';
import { DiversionLogo } from '../DiversionLogo';
import { toPng, toBlob } from 'html-to-image';
import { normalizeReceiptNumber } from '../../utils/receiptNumber';

interface BookingReceiptModalProps {
  reservation: Reservation | null;
  room?: Room;
  onClose: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const BookingReceiptModal: React.FC<BookingReceiptModalProps> = ({
  reservation,
  room,
  onClose,
  onShowToast,
}) => {
  const receiptCardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!reservation) return null;

  const receiptNumber = normalizeReceiptNumber(reservation.confirmationCode, 1);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(receiptNumber);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      onShowToast?.(`Receipt number ${receiptNumber} copied to clipboard!`, 'info');
    } catch {
      // Fallback
      onShowToast?.(`Receipt: ${receiptNumber}`, 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSavePng = async () => {
    if (!receiptCardRef.current) return;
    try {
      setIsSaving(true);
      // Generate clean high-DPI PNG of the receipt
      const dataUrl = await toPng(receiptCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const downloadLink = document.createElement('a');
      downloadLink.download = `Receipt-${receiptNumber}.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();

      onShowToast?.(`Receipt ${receiptNumber} saved as PNG!`, 'success');
    } catch (error) {
      console.error('Error exporting PNG receipt:', error);
      onShowToast?.('Could not save PNG directly. You can use Print instead.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSharePng = async () => {
    if (!receiptCardRef.current) return;
    try {
      setIsSharing(true);

      const blob = await toBlob(receiptCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      if (!blob) {
        throw new Error('Could not create receipt image');
      }

      const fileName = `Receipt-${receiptNumber}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Check if Web Share API supports file sharing
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `Receipt ${receiptNumber} - Diversion Vigan`,
          text: `Official Booking Receipt for ${reservation.guestName} at Diversion Vigan (Receipt #${receiptNumber})`,
          files: [file],
        });
        onShowToast?.('Receipt shared successfully!', 'success');
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        // Fallback to text sharing if file share is unsupported on this browser
        await navigator.share({
          title: `Receipt ${receiptNumber} - Diversion Vigan`,
          text: `Official Receipt ${receiptNumber}\nGuest: ${reservation.guestName}\nRoom: ${reservation.roomName}\nCheck-in: ${reservation.checkInDate}\nCheck-out: ${reservation.checkOutDate}\nTotal: ${formatPHP(reservation.totalAmount)}\nDiversion Road, Vigan City, Ilocos Sur`,
        });
        onShowToast?.('Receipt details shared!', 'success');
      } else {
        // Direct download fallback with notice
        const downloadLink = document.createElement('a');
        downloadLink.download = fileName;
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
        onShowToast?.('Direct sharing not supported on this browser. Receipt saved as PNG!', 'info');
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Error sharing PNG receipt:', error);
        // Fallback to saving PNG
        await handleSavePng();
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      {/* Print-specific style to isolate and render only the receipt cleanly */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #dv-receipt-export-card, #dv-receipt-export-card * {
            visibility: visible !important;
          }
          #dv-receipt-export-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 my-auto">
          {/* Top Action Bar */}
          <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between gap-2 shrink-0 border-b border-slate-800 no-print">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 shrink-0">
                Receipt
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full font-mono transition-colors border border-slate-700 cursor-pointer truncate"
                title="Click to copy receipt number"
              >
                <span>{receiptNumber}</span>
                {copiedCode ? (
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                )}
              </button>
            </div>

            {/* Action Buttons: Print, Save PNG, Share PNG, Close */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                title="Print official receipt"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                type="button"
                onClick={handleSavePng}
                disabled={isSaving}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/30 disabled:opacity-60"
                title="Save Receipt as PNG image"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="hidden sm:inline">Save PNG</span>
              </button>

              <button
                type="button"
                onClick={handleSharePng}
                disabled={isSharing}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-500/30 disabled:opacity-60"
                title="Share Receipt PNG or details"
              >
                {isSharing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Receipt Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950/40">
            {/* Printable & Exportable Receipt Card Container */}
            <div
              id="dv-receipt-export-card"
              ref={receiptCardRef}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-slate-900 dark:text-slate-100"
            >
              {/* Header Brand & Receipt Status */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
                <div className="space-y-1">
                  <DiversionLogo size="sm" variant="horizontal" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Diversion Road, Vigan City, Ilocos Sur, Philippines
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Direct: +63 977 123 4567 • reservation@diversionvigan.ph
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Receipt Confirmed</span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 mt-1.5">
                    No: {receiptNumber}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Issued: {reservation.createdAt}
                  </div>
                </div>
              </div>

              {/* Reserved Room Accommodation Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>Accommodation Details</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                    {reservation.roomName || room?.name || `Room ${reservation.roomNumber}`}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Room {reservation.roomNumber} • Diversion Road, Vigan City</span>
                  </div>
                </div>

                {/* QR Code Verification box */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs">
                  <QrCode className="w-11 h-11 text-slate-800 dark:text-slate-200" />
                  <span className="text-[9px] font-mono font-bold text-slate-500 mt-0.5">
                    {receiptNumber}
                  </span>
                </div>
              </div>

              {/* Stay Timeline & Schedule */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-slate-50/70 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Check-In Date
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{reservation.checkInDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>From 2:00 PM</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Check-Out Date
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{reservation.checkOutDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Standard 12:00 PM (Noon)</span>
                  </div>
                </div>
              </div>

              {/* Primary Guest Details */}
              <div className="space-y-2 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Primary Guest Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/40">
                    <div className="text-[10px] text-slate-400">Guest Name</div>
                    <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {reservation.guestName}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/40">
                    <div className="text-[10px] text-slate-400">Registered Email</div>
                    <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {reservation.guestEmail}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/40">
                    <div className="text-[10px] text-slate-400">Contact Number</div>
                    <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {reservation.guestPhone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Settlement Summary */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Payment Method
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Paid via {reservation.paymentMethod}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Guests: {reservation.numberOfGuests} pax
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Total Amount Paid
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-rose-600 dark:text-rose-400">
                    {formatPHP(reservation.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Official Check-in Notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                Please present this <span className="font-bold">Receipt</span> or state your receipt number{' '}
                <span className="font-bold font-mono text-amber-800 dark:text-amber-300">{receiptNumber}</span> upon
                arrival at the Diversion Vigan Front Desk. Valid government-issued ID is required for transient
                check-in.
              </div>
            </div>

            {/* Quick Action Buttons Below Card (No Print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 no-print">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <span>Format: <strong>{receiptNumber}</strong> (01 seq, 26 year)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePng}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Save as PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleSharePng}
                  disabled={isSharing}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 disabled:opacity-60"
                >
                  {isSharing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>Share PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
