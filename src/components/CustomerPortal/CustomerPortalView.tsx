import React, { useState } from 'react';
import { CustomerUser, Reservation, Room } from '../../types';
import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
} from '../../utils/customerAuth';
import { formatPHP } from '../../utils/formatCurrency';
import { BookingReceiptModal } from './BookingReceiptModal';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  LogOut,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  XCircle,
} from 'lucide-react';

interface CustomerPortalViewProps {
  currentCustomer: CustomerUser | null;
  reservations: Reservation[];
  rooms: Room[];
  onCustomerChange: (user: CustomerUser | null) => void;
  onCancelReservation: (reservationId: string) => void;
  onNavigateToCatalog: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  currentCustomer,
  reservations,
  rooms,
  onCustomerChange,
  onCancelReservation,
  onNavigateToCatalog,
  onShowToast,
}) => {
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Selected reservation for receipt modal
  const [receiptReservation, setReceiptReservation] = useState<Reservation | null>(null);

  // Filter for customer's bookings
  const [statusFilter, setStatusFilter] = useState<'all' | 'active-upcoming' | 'completed' | 'cancelled'>('all');

  // Filter reservations belonging to the current customer
  const customerReservations = currentCustomer
    ? reservations.filter(
        (r) => r.guestEmail.toLowerCase() === currentCustomer.email.toLowerCase()
      )
    : [];

  const filteredReservations = customerReservations.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active-upcoming') return r.status === 'active' || r.status === 'upcoming';
    if (statusFilter === 'completed') return r.status === 'completed';
    if (statusFilter === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    const res = registerCustomer(name, email, password, phone);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to register account.');
      return;
    }

    if (res.user) {
      onCustomerChange(res.user);
      onShowToast(`Account created! Welcome, ${res.user.name}.`, 'success');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const res = loginCustomer(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to sign in.');
      return;
    }

    if (res.user) {
      onCustomerChange(res.user);
      onShowToast(`Signed in as ${res.user.name}.`, 'success');
      setEmail('');
      setPassword('');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setAuthMode('login');
    const res = loginCustomer(demoEmail, 'password123');
    if (res.success && res.user) {
      onCustomerChange(res.user);
      onShowToast(`Signed in as ${res.user.name}.`, 'success');
    }
  };

  const handleLogout = () => {
    logoutCustomer();
    onCustomerChange(null);
    onShowToast('Signed out of My Booking.', 'info');
  };

  const handleConfirmCancel = (reservation: Reservation) => {
    if (window.confirm(`Are you sure you want to cancel reservation ${reservation.confirmationCode}?`)) {
      onCancelReservation(reservation.id);
      onShowToast(`Reservation ${reservation.confirmationCode} cancelled.`, 'info');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 animate-in fade-in duration-200">
      {/* If Not Logged In: Show Registration / Login Gate */}
      {!currentCustomer ? (
        <div className="max-w-md mx-auto">
          {/* Card Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Top Header */}
            <div className="p-6 bg-slate-900 text-white text-center relative">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-3">
                <User className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">My Booking</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Register with your email and password to book rooms and securely view your booking vouchers and stay history.
              </p>
            </div>

            {/* Switch Tabs: Sign In vs Register */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800 m-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Register New Account
              </button>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mx-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={authMode === 'register' ? handleRegister : handleLogin}
              className="p-6 pt-2 space-y-4"
            >
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Juan Dela Cruz"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Phone Number (for booking verification)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+63 917 123 4567"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/25 transition-all cursor-pointer mt-2"
              >
                {authMode === 'register' ? 'Register Account & View Bookings' : 'Sign In to My Booking'}
              </button>
            </form>

            {/* Quick Demo Credentials Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase mb-2">
                Instant Demo Logins (Click to Test)
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('alex.wright@example.com')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 hover:border-amber-400 dark:hover:border-amber-500 transition-colors shadow-2xs cursor-pointer"
                >
                  👤 Alex Wright (Has Bookings)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('elena.rostova@example.com')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 hover:border-amber-400 dark:hover:border-amber-500 transition-colors shadow-2xs cursor-pointer"
                >
                  👤 Elena Rostova (Active Stay)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Customer View */
        <div className="space-y-6">
          {/* Customer Profile Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-amber-600/25">
                {currentCustomer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {currentCustomer.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Customer</span>
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {currentCustomer.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {currentCustomer.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Member Stats & Logout */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 text-center">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {customerReservations.length}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Stays</div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    {customerReservations.filter((r) => r.status === 'upcoming' || r.status === 'active').length}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Active</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Bookings Section Header & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                My Bookings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your reservations, view official check-in vouchers, and print confirmation slips.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={onNavigateToCatalog}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Book Another Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: `All Bookings (${customerReservations.length})` },
              {
                id: 'active-upcoming',
                label: `Upcoming & Active (${
                  customerReservations.filter((r) => r.status === 'upcoming' || r.status === 'active').length
                })`,
              },
              {
                id: 'completed',
                label: `Completed (${customerReservations.filter((r) => r.status === 'completed').length})`,
              },
              {
                id: 'cancelled',
                label: `Cancelled (${customerReservations.filter((r) => r.status === 'cancelled').length})`,
              },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredReservations.length > 0 ? (
            <div className="space-y-4">
              {filteredReservations.map((res) => {
                const room = rooms.find((r) => r.id === res.roomId);

                return (
                  <div
                    key={res.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4 flex-1">
                      {room?.images[0] ? (
                        <img
                          src={room.images[0]}
                          alt={res.roomName}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-slate-200/80 dark:border-slate-700/60"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <Calendar className="w-8 h-8" />
                        </div>
                      )}

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                            {res.confirmationCode}
                          </span>
                          <span
                            className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              res.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : res.status === 'upcoming'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : res.status === 'completed'
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {res.status}
                          </span>
                        </div>

                        <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                          {res.roomName} (Room {res.roomNumber})
                        </h4>

                        <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 pt-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-rose-500" />
                            {res.checkInDate} to {res.checkOutDate}
                          </span>
                          <span>•</span>
                          <span>{res.numberOfGuests} Guests</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            Diversion Road, Vigan City
                          </span>
                        </div>

                        {res.specialRequests && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                            Note: "{res.specialRequests}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Price & Action Buttons */}
                    <div className="flex md:flex-col items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid</div>
                        <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {formatPHP(res.totalAmount)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{res.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* View Voucher / Receipt Button */}
                        <button
                          type="button"
                          onClick={() => setReceiptReservation(res)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-500" />
                          <span>View Voucher</span>
                        </button>

                        {/* Cancel Button if upcoming */}
                        {res.status === 'upcoming' && (
                          <button
                            type="button"
                            onClick={() => handleConfirmCancel(res)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors"
                            title="Cancel booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                No bookings found for this filter
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {statusFilter === 'all'
                  ? `There are no reservations registered under ${currentCustomer.email}. Make a reservation to view your itinerary and vouchers here!`
                  : 'Try selecting "All Bookings" to see all reservations on your account.'}
              </p>
              <button
                type="button"
                onClick={onNavigateToCatalog}
                className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-xs"
              >
                Browse Available Rooms
              </button>
            </div>
          )}
        </div>
      )}

      {/* Booking Receipt Voucher Modal */}
      {receiptReservation && (
        <BookingReceiptModal
          reservation={receiptReservation}
          room={rooms.find((r) => r.id === receiptReservation.roomId)}
          onClose={() => setReceiptReservation(null)}
        />
      )}
    </div>
  );
};
