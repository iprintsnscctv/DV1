import React, { useState, useEffect } from 'react';
import { Room, Reservation, CustomerUser } from '../../types';
import {
  X,
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Tag,
  Clock,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  AlertCircle,
  ShieldAlert,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { formatPHP } from '../../utils/formatCurrency';
import { calculateRoomPricing } from '../../utils/pricingCalculator';
import { registerCustomer, loginCustomer } from '../../utils/customerAuth';

interface BookingModalProps {
  room: Room;
  currentCustomer?: CustomerUser | null;
  onCustomerChange?: (user: CustomerUser | null) => void;
  initialCheckInDate?: string;
  initialCheckOutDate?: string;
  initialGuestsCount?: number;
  onClose: () => void;
  onConfirmBooking: (reservation: Omit<Reservation, 'id' | 'confirmationCode' | 'createdAt' | 'status'>) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  room,
  currentCustomer,
  onCustomerChange,
  initialCheckInDate,
  initialCheckOutDate,
  initialGuestsCount,
  onClose,
  onConfirmBooking,
  onShowToast,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkInDate, setCheckInDate] = useState(initialCheckInDate || '2026-09-24');
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOutDate || '2026-09-26');
  const [numberOfGuests, setNumberOfGuests] = useState(
    initialGuestsCount || room.customRates?.paxRule?.basePax || 1
  );

  // Guest Details
  const [guestName, setGuestName] = useState(currentCustomer?.name || '');
  const [guestEmail, setGuestEmail] = useState(currentCustomer?.email || '');
  const [guestPhone, setGuestPhone] = useState(currentCustomer?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Reservation['paymentMethod']>('GCash / Mobile Money');

  // Registration & Login In-Modal States
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Keep contact info in sync when currentCustomer changes
  useEffect(() => {
    if (currentCustomer) {
      setGuestName(currentCustomer.name);
      setGuestEmail(currentCustomer.email);
      setGuestPhone(currentCustomer.phone);
    }
  }, [currentCustomer]);

  // Dynamic pricing calculation using Custom Rates Engine (Days, Pax, Specific Dates)
  const pricing = calculateRoomPricing(
    room,
    checkInDate,
    checkOutDate,
    numberOfGuests
  );

  const diffDays = pricing.nights;
  const totalAmount = pricing.grandTotal;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (step === 1) {
      if (!checkInDate || !checkOutDate) {
        onShowToast('Please select valid check-in and check-out dates.', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // If customer is NOT yet authenticated/registered, require account creation or login first!
      if (!currentCustomer) {
        if (authMode === 'register') {
          if (!guestName.trim()) {
            setAuthError('Please enter your full name.');
            return;
          }
          if (!guestPhone.trim()) {
            setAuthError('Please enter your contact phone number.');
            return;
          }
          if (guestEmail.trim() && !guestEmail.includes('@')) {
            setAuthError('Please enter a valid email address or leave it empty.');
            return;
          }
          if (!password || password.length < 6) {
            setAuthError('Password must be at least 6 characters long.');
            return;
          }
          if (password !== confirmPassword) {
            setAuthError('Passwords do not match. Please verify.');
            return;
          }

          const res = registerCustomer(guestName, guestEmail, password, guestPhone);
          if (!res.success || !res.user) {
            setAuthError(res.error || 'Failed to register account.');
            return;
          }

          onCustomerChange?.(res.user);
          setGuestName(res.user.name);
          setGuestEmail(res.user.email);
          setGuestPhone(res.user.phone);
          onShowToast(`Account registered! Welcome, ${res.user.name}.`, 'success');
          setStep(3);
        } else {
          // Login Mode
          if (!guestEmail.trim()) {
            setAuthError('Please enter your contact number or registered email.');
            return;
          }
          if (!password) {
            setAuthError('Please enter your account password.');
            return;
          }

          const res = loginCustomer(guestEmail, password);
          if (!res.success || !res.user) {
            setAuthError(res.error || 'Invalid contact number, email, or password.');
            return;
          }

          onCustomerChange?.(res.user);
          setGuestName(res.user.name);
          setGuestEmail(res.user.email);
          setGuestPhone(res.user.phone);
          onShowToast(`Signed in as ${res.user.name}.`, 'success');
          setStep(3);
        }
      } else {
        // Customer is already logged in
        if (!guestPhone.trim()) {
          onShowToast('Please provide a contact phone number for check-in coordination.', 'error');
          return;
        }
        setStep(3);
      }
    } else {
      // Step 3: Final confirmation
      if (!currentCustomer) {
        onShowToast('Account registration is required before confirming a booking.', 'error');
        setStep(2);
        return;
      }

      onConfirmBooking({
        roomId: room.id,
        roomName: room.name,
        roomNumber: room.roomNumber,
        guestName: guestName || currentCustomer.name,
        guestEmail: guestEmail || currentCustomer.email,
        guestPhone: guestPhone || currentCustomer.phone,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        totalAmount,
        specialRequests,
        paymentMethod,
      });
      onClose();
    }
  };

  const handleQuickDemoLogin = (email: string) => {
    setAuthError('');
    setGuestEmail(email);
    setPassword('password123');
    const res = loginCustomer(email, 'password123');
    if (res.success && res.user) {
      onCustomerChange?.(res.user);
      setGuestName(res.user.name);
      setGuestEmail(res.user.email);
      setGuestPhone(res.user.phone);
      onShowToast(`Signed in as ${res.user.name}.`, 'success');
      setStep(3);
    } else {
      setAuthError(res.error || 'Failed to sign in with demo account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                Diversion Vigan • Transient and Private Villa
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Book {room.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between px-8 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 1 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dates & Guests
              </span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {currentCustomer ? 'Guest Info' : 'Account Required'}
              </span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 3 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Review & Book
              </span>
            </div>
          </div>

          <form onSubmit={handleNext} className="p-6 space-y-5">
            {/* STEP 1: Dates & Guests */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Number of Guests (Max {room.capacity})
                  </label>
                  <select
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold text-rose-900 dark:text-rose-300">
                      Stay Duration
                    </div>
                    <div className="text-sm font-bold text-rose-700 dark:text-rose-400">
                      {diffDays} Night{diffDays !== 1 ? 's' : ''} • {numberOfGuests} Guest{numberOfGuests !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-rose-900 dark:text-rose-300">
                      Estimated Total
                    </div>
                    <div className="text-base font-extrabold text-rose-700 dark:text-rose-400">
                      {formatPHP(pricing.grandTotal)}
                    </div>
                  </div>
                </div>

                {!currentCustomer && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Account required:</strong> You will be prompted to register or sign in on the next step to secure your reservation.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Account Registration / Guest Info */}
            {step === 2 && (
              <div className="space-y-4">
                {currentCustomer ? (
                  /* User is already registered and logged in */
                  <div className="space-y-4">
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                          {currentCustomer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                            <span>{currentCustomer.name}</span>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                              Registered
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            {currentCustomer.email} • Stay will link to My Booking
                          </div>
                        </div>
                      </div>
                      <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Contact Phone Number
                      </label>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+63 900 000 0000"
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Late check-in, extra towels, quiet room preference..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                      ></textarea>
                    </div>
                  </div>
                ) : (
                  /* User is NOT logged in: STRICTLY REQUIRE ACCOUNT REGISTRATION OR LOGIN */
                  <div className="space-y-4">
                    {/* Notice Banner */}
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Account Registration Required to Book
                        </h4>
                        <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                          Guests must register an account before booking. Your confirmed voucher, QR code, and check-in slip will be saved in <strong>My Booking</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setAuthError('');
                        }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          authMode === 'register'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register Account</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setAuthError('');
                        }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          authMode === 'login'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>
                    </div>

                    {/* Auth Error Display */}
                    {authError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {authMode === 'register' ? (
                      /* Registration Form Fields */
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              type="text"
                              required
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              placeholder="Juan Dela Cruz"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              placeholder="+63 917 123 4567"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                              Password (min 6 chars) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                              />
                            </div>
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
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                              placeholder="juan@example.com (optional)"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Sign In Mode Fields */
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                            Contact Number or Email
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              type="text"
                              required
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                              placeholder="Enter contact number or email"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Review & Payment */}
            {step === 3 && (
              <div className="space-y-4">
                {/* Account Confirmation Pill */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-emerald-900 dark:text-emerald-200">
                      Booking for: <strong>{guestName || currentCustomer?.name}</strong> ({guestEmail || currentCustomer?.email})
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                    Linked to My Booking
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Price Breakdown
                    </h4>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      Custom Dynamic Rates
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      Nightly Subtotal ({diffDays} night{diffDays > 1 ? 's' : ''})
                    </span>
                    <span>{formatPHP(pricing.nightlySubtotal)}</span>
                  </div>
                  {pricing.extraPaxTotal > 0 && (
                    <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold">
                      <span>Extra Guests Surcharge ({numberOfGuests} guests)</span>
                      <span>+{formatPHP(pricing.extraPaxTotal)}</span>
                    </div>
                  )}
                  {pricing.durationDiscountAmount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Length of Stay Discount</span>
                      <span>-{formatPHP(pricing.durationDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                    <span>Total Amount Due</span>
                    <span className="text-rose-600 dark:text-rose-400">{formatPHP(pricing.grandTotal)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Reservation['paymentMethod'])}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="GCash / Mobile Money">GCash (Mobile Wallet)</option>
                    <option value="Credit Card">Credit / Debit Card (Visa, Mastercard)</option>
                    <option value="Cash at Desk">Pay Cash at Front-Desk</option>
                    <option value="PayPal">Maya (PayMaya) / Online Banking</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Official booking slip and QR verification will be issued in <strong>My Booking</strong> immediately upon confirmation.
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setStep((s) => (s - 1) as 1 | 2);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div></div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>
                  {step === 1
                    ? 'Continue'
                    : step === 2
                    ? currentCustomer
                      ? 'Proceed to Review'
                      : authMode === 'register'
                      ? 'Register Account & Continue'
                      : 'Sign In & Continue'
                    : 'Confirm Reservation'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};
