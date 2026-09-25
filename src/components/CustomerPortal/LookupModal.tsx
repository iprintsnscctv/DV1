'use client';

import React, { useState } from 'react';
import { Search, X, Calendar, User, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { Reservation } from '../../types';
import { fetchReservations } from '../../services/api';

interface LookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReservation?: (res: Reservation) => void;
}

export const LookupModal: React.FC<LookupModalProps> = ({ isOpen, onClose, onSelectReservation }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Reservation | null>(null);
  const [notFound, setNotFound] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const allRes = await fetchReservations();
      const q = query.trim().toUpperCase();
      const cleanPhone = query.trim().replace(/\D/g, '');

      const found = allRes.find((r) => {
        const matchCode = r.confirmationCode?.toUpperCase() === q || r.id?.toUpperCase() === q;
        const resPhoneClean = (r.guestPhone || '').replace(/\D/g, '');
        const matchPhone = cleanPhone && resPhoneClean && (resPhoneClean.includes(cleanPhone) || cleanPhone.includes(resPhoneClean));
        return matchCode || matchPhone;
      });

      if (found) {
        setResult(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#221912] to-[#3a2c20] text-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600/30 rounded-lg">
              <Search className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Find Your Reservation</h3>
              <p className="text-xs text-amber-200/80">Search by Confirmation Code (e.g. DV-12345) or Phone Number</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-200/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Confirmation Code or Phone..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition shadow-sm"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {notFound && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>No reservation found matching that confirmation code or phone number.</span>
            </div>
          )}

          {result && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-700">Reservation Confirmed</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded">
                  {result.confirmationCode || result.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Room</p>
                  <p className="font-semibold text-[#221912]">{result.roomName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Guest</p>
                  <p className="font-semibold text-[#221912]">{result.guestName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dates</p>
                  <p className="font-semibold text-[#221912] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-700" />
                    {result.checkInDate} to {result.checkOutDate}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Guests</p>
                  <p className="font-semibold text-[#221912] flex items-center gap-1">
                    <User className="w-3 h-3 text-amber-700" />
                    {result.numberOfGuests} Guests
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-amber-200/60">
                {onSelectReservation && (
                  <button
                    onClick={() => {
                      onSelectReservation(result);
                      onClose();
                    }}
                    className="px-4 py-2 bg-[#221912] text-amber-100 hover:bg-[#382b20] text-xs font-semibold rounded-lg transition"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
