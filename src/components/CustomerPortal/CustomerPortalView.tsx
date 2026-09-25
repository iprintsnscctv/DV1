import React, { useState } from 'react';
import { CustomerUser, Reservation, Room, GuestReview } from '../../types';
import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
} from '../../utils/customerAuth';
import { formatPHP } from '../../utils/formatCurrency';
import { normalizeReceiptNumber } from '../../utils/receiptNumber';
import { BookingReceiptModal } from './BookingReceiptModal';
import { WriteReviewModal } from './WriteReviewModal';
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
  Star,
  Image as ImageIcon,
  Video,
  Play,
  MessageSquare,
  Plus
} from 'lucide-react';

interface CustomerPortalViewProps {
  currentCustomer: CustomerUser | null;
  reservations: Reservation[];
  rooms: Room[];
  reviews?: GuestReview[];
  onSubmitReview?: (review: GuestReview) => void;
  onCustomerChange: (user: CustomerUser | null) => void;
  onCancelReservation: (reservationId: string) => void;
  onNavigateToCatalog: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  currentCustomer,
  reservations,
  rooms,
  reviews = [],
  onSubmitReview,
  onCustomerChange,
  onCancelReservation,
  onNavigateToCatalog,
  onShowToast,
}) => {
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Portal Sub Tab: 'bookings' | 'reviews'
  const [portalTab, setPortalTab] = useState<'bookings' | 'reviews'>('bookings');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Selected reservation for receipt modal
  const [receiptReservation, setReceiptReservation] = useState<Reservation | null>(null);

  // Write Review Modal State
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [reviewForReservation, setReviewForReservation] = useState<Reservation | null>(null);

  // Filter for customer's bookings
  const [statusFilter, setStatusFilter] = useState<'all' | 'active-upcoming' | 'completed' | 'cancelled'>('all');

  // Filter reservations belonging to the current customer
  const customerReservations = currentCustomer
    ? reservations.filter(
        (r) =>
          (currentCustomer.email && r.guestEmail.toLowerCase() === currentCustomer.email.toLowerCase()) ||
          (currentCustomer.phone && r.guestPhone.replace(/[^0-9]/g, '') === currentCustomer.phone.replace(/[^0-9]/g, ''))
      )
    : [];

  // Filter reviews belonging to current customer
  const customerReviews = currentCustomer
    ? reviews.filter(
        (rev) =>
          rev.guestId === currentCustomer.id ||
          (currentCustomer.email && rev.guestEmail?.toLowerCase() === currentCustomer.email.toLowerCase())
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

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Contact phone number is required.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

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

  const handleLogout = () => {
    logoutCustomer();
    onCustomerChange(null);
    onShowToast('Signed out of My Booking.', 'info');
  };

  const handleConfirmCancel = (reservation: Reservation) => {
    if (window.confirm(`Are you sure you want to cancel reservation ${reservation.confirmationCode}?`)) {
      onCancelReservation(reservation.id);
      onShowToast('Booking cancelled.', 'info');
    }
  };

  const handleOpenReviewForBooking = (res: Reservation) => {
    setReviewForReservation(res);
    setShowWriteReviewModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner / Account Portal Switcher */}
      {!currentCustomer ? (
        /* Guest Sign In / Register Card */
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 border border-white/20">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Guest Portal • My Booking</h2>
              <p className="text-xs text-amber-100/90 mt-1 max-w-xs mx-auto">
                Sign in or register to manage your room reservations, review check-in receipts, and write reviews with photos &amp; videos.
              </p>
            </div>
          </div>

          <div className="p-6">
            {/* Auth Mode Toggle */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
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
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={authMode === 'register' ? handleRegister : handleLogin}
              className="space-y-4"
            >
              {authMode === 'register' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Juan Dela Cruz"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Contact / Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+63 917 123 4567"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Password (min. 6 characters) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase">
                        Email Address
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">(Optional)</span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="guest@example.com (optional)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Login Mode */
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Contact Number or Email
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter contact number or email"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/25 transition-all cursor-pointer mt-2"
              >
                {authMode === 'register' ? 'Register Account & View Bookings' : 'Sign In to My Booking'}
              </button>
            </form>
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
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {currentCustomer.phone}
                  </span>
                  {currentCustomer.email && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {currentCustomer.email}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Member Stats & Logout */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 text-center">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {customerReservations.length}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Stays</div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    {customerReviews.length}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Reviews</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs (Bookings vs Reviews) */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPortalTab('bookings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  portalTab === 'bookings'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>My Bookings ({customerReservations.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalTab('reviews')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  portalTab === 'reviews'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>My Reviews &amp; Photos ({customerReviews.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {portalTab === 'reviews' ? (
                <button
                  type="button"
                  onClick={() => {
                    setReviewForReservation(null);
                    setShowWriteReviewModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write a Review</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNavigateToCatalog}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Book Another Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: BOOKINGS LIST */}
          {portalTab === 'bookings' && (
            <div className="space-y-4">
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
                                {normalizeReceiptNumber(res.confirmationCode)}
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

                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {/* Write Review Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenReviewForBooking(res)}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Write a review with pictures and video"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>Write Review</span>
                            </button>

                            {/* View Receipt Button */}
                            <button
                              type="button"
                              onClick={() => setReceiptReservation(res)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="View official receipt"
                            >
                              <FileText className="w-3.5 h-3.5 text-rose-500" />
                              <span>View Receipt</span>
                            </button>

                            {/* Cancel Button if upcoming */}
                            {res.status === 'upcoming' && (
                              <button
                                type="button"
                                onClick={() => handleConfirmCancel(res)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
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
                      ? `There are no reservations registered under your account yet. Make a reservation to view your itinerary and receipts here!`
                      : 'Try selecting "All Bookings" to see all reservations on your account.'}
                  </p>
                  <button
                    type="button"
                    onClick={onNavigateToCatalog}
                    className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Browse Available Rooms
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY REVIEWS & MEDIA */}
          {portalTab === 'reviews' && (
            <div className="space-y-4">
              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Star className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Guest Review &amp; Media Center
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Submit reviews with photos and walkthrough videos. Submissions undergo front desk screening before public posting.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReviewForReservation(null);
                    setShowWriteReviewModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write Review &amp; Upload Media</span>
                </button>
              </div>

              {customerReviews.length > 0 ? (
                <div className="space-y-4">
                  {customerReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-4 h-4 ${
                                    s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {rev.rating}.0 / 5.0
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                            "{rev.title}"
                          </h4>
                          <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                            {rev.roomName} (Room {rev.roomNumber || '0'})
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          <span
                            className={`text-xs font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 ${
                              rev.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : rev.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {rev.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {rev.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                            {rev.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                            <span>
                              {rev.status === 'pending' ? 'Pending Admin Screening' : rev.status === 'approved' ? 'Approved & Public' : 'Rejected'}
                            </span>
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Attached Media */}
                      {rev.media && rev.media.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Attached Photos &amp; Video ({rev.media.length})
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            {rev.media.map((med) => (
                              <div
                                key={med.id}
                                className="w-24 h-18 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 relative shrink-0"
                              >
                                {med.type === 'image' ? (
                                  <img
                                    src={med.url}
                                    alt={med.name || 'Photo'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                                    <video
                                      src={med.url}
                                      className="w-full h-full object-cover opacity-75"
                                      muted
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                                      <Play className="w-4 h-4 fill-white text-white" />
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 pt-1">
                        Submitted: {rev.createdAt}
                        {rev.status === 'pending' && ' • Awaiting front desk verification'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    No reviews written yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Share your experience staying at Diversion Vigan! Upload photos of your room setup and video walkthroughs.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewForReservation(null);
                      setShowWriteReviewModal(true);
                    }}
                    className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Write Your First Review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Booking Receipt Modal */}
      {receiptReservation && (
        <BookingReceiptModal
          reservation={receiptReservation}
          room={rooms.find((r) => r.id === receiptReservation.roomId)}
          onClose={() => setReceiptReservation(null)}
          onShowToast={onShowToast}
        />
      )}

      {/* Write Review Modal */}
      {showWriteReviewModal && currentCustomer && (
        <WriteReviewModal
          rooms={rooms}
          currentCustomer={currentCustomer}
          preselectedReservation={reviewForReservation}
          onClose={() => {
            setShowWriteReviewModal(false);
            setReviewForReservation(null);
          }}
          onSubmitReview={(newRev) => {
            onSubmitReview?.(newRev);
          }}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
