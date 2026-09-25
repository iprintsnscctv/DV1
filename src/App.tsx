import React, { useState, useEffect } from 'react';
import { Room, Reservation, Review, CustomRates, SupabaseConfigStatus } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { HeroBanner } from './components/GuestView/HeroBanner';
import { RoomCard } from './components/GuestView/RoomCard';
import { BookingModal } from './components/GuestView/BookingModal';
import { CustomRatesOverview } from './components/GuestView/CustomRatesOverview';
import { LookupModal } from './components/CustomerPortal/LookupModal';
import { WriteReviewModal } from './components/CustomerPortal/WriteReviewModal';
import { CustomRatesModal } from './components/AdminView/CustomRatesModal';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'lookup' | 'admin' | 'custom-rates'>('explore');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConfigStatus | null>(null);

  // Search & Filter State
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [ratesModalRoom, setRatesModalRoom] = useState<Room | null>(null);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [reviewReservation, setReviewReservation] = useState<Reservation | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedRooms, fetchedReservations, status] = await Promise.all([
        api.getRooms(),
        api.getReservations(),
        api.getSupabaseStatus(),
      ]);
      setRooms(fetchedRooms);
      setReservations(fetchedReservations);
      setSupabaseStatus(status);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const categories = ['All', ...Array.from(new Set(rooms.map((r) => r.category).filter(Boolean)))];

  const filteredRooms = rooms.filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (guestsCount > r.capacity) return false;
    return true;
  });

  // Handlers
  const handleConfirmBooking = async (res: Reservation) => {
    const created = await api.createReservation(res);
    setReservations((prev) => [created, ...prev]);
    // update local room status
    setRooms((prev) =>
      prev.map((r) => (r.id === res.roomId && r.status === 'Available' ? { ...r, status: 'Reserved' } : r))
    );
  };

  const handleUpdateRoomStatus = async (roomId: string, status: string, isClean: boolean) => {
    const updated = await api.updateRoom(roomId, { status, isClean });
    setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
  };

  const handleSaveRates = async (roomId: string, customRates: CustomRates) => {
    const updated = await api.updateRoom(roomId, { customRates });
    setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
  };

  const handleUpdateReservationStatus = async (
    resId: string,
    status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  ) => {
    const updated = await api.updateReservationStatus(resId, status);
    setReservations((prev) => prev.map((r) => (r.id === resId ? updated : r)));
    await loadData();
  };

  const handleDeleteReservation = async (resId: string) => {
    if (!confirm('Are you sure you want to delete this reservation record?')) return;
    try {
      const res = await fetch(`/api/reservations/${resId}`, { method: 'DELETE' });
      if (res.ok) {
        setReservations((prev) => prev.filter((r) => r.id !== resId));
      }
    } catch (err) {
      console.error('Error deleting reservation:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#140f0c] text-[#241a13] dark:text-[#f8f4ec] font-sans antialiased flex flex-col selection:bg-amber-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        supabaseStatus={supabaseStatus}
        onOpenLookup={() => setIsLookupOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'explore' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Hero Section */}
            <HeroBanner
              checkInDate={checkInDate}
              setCheckInDate={setCheckInDate}
              checkOutDate={checkOutDate}
              setCheckOutDate={setCheckOutDate}
              guestsCount={guestsCount}
              setGuestsCount={setGuestsCount}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              onSearch={() => {}}
            />

            {/* Room Listing Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Exclusive Suites & Units
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec]">
                  Available Rooms in Diversion Vigan
                </h2>
              </div>
              <p className="text-xs text-[#735745] dark:text-[#c5b2a3]">
                Showing {filteredRooms.length} of {rooms.length} Units for {guestsCount} Guests
              </p>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onBook={(r) => setBookingRoom(r)}
                  onViewRates={(r) => {
                    setRatesModalRoom(r);
                  }}
                />
              ))}
            </div>

            {/* Experience Vigan Section */}
            <section className="bg-white dark:bg-[#1e1611] rounded-3xl p-8 sm:p-12 border border-[#ebdcd0] dark:border-[#382b20] shadow-sm mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prime Vigan Location</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2a1c14] dark:text-[#f8f4ec] mb-4">
                    Your Peaceful Oasis along Diversion Road
                  </h3>
                  <p className="text-xs sm:text-sm text-[#735745] dark:text-[#c5b2a3] leading-relaxed mb-6">
                    Located just minutes away from Calle Crisologo and Vigan Cathedral, Diversion Vigan
                    offers tranquil accommodation away from downtown congestion with easy highway access,
                    wide parking, and private villa amenities.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#4a3427] dark:text-[#dfcebd]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Check-in: 2:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Check-out: 12:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>24/7 Front Assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>Diversion Rd, Vigan City</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-lg border border-[#ebdcd0] dark:border-[#382b20] h-64 sm:h-80">
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
                    alt="Diversion Vigan Villa Property"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'custom-rates' && (
          <CustomRatesOverview
            rooms={rooms}
            onSelectRoom={(r) => {
              setBookingRoom(r);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            rooms={rooms}
            reservations={reservations}
            supabaseStatus={supabaseStatus}
            onUpdateRoomStatus={handleUpdateRoomStatus}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onDeleteReservation={handleDeleteReservation}
            onOpenRatesModal={(r) => setRatesModalRoom(r)}
            onTestSupabase={api.testSupabaseConnection}
            onSyncSupabase={api.syncToSupabase}
            onGetSchema={api.getSupabaseSchema}
          />
        )}
      </main>

      {/* Modals */}
      {bookingRoom && (
        <BookingModal
          room={bookingRoom}
          onClose={() => setBookingRoom(null)}
          onConfirmBooking={handleConfirmBooking}
          initialCheckIn={checkInDate}
          initialCheckOut={checkOutDate}
          initialGuests={guestsCount}
        />
      )}

      {ratesModalRoom && (
        <CustomRatesModal
          room={ratesModalRoom}
          onClose={() => setRatesModalRoom(null)}
          onSave={handleSaveRates}
        />
      )}

      {isLookupOpen && (
        <LookupModal
          onClose={() => setIsLookupOpen(false)}
          reservations={reservations}
          onOpenReviewModal={(res) => {
            setIsLookupOpen(false);
            setReviewReservation(res);
          }}
        />
      )}

      {reviewReservation && (
        <WriteReviewModal
          reservation={reviewReservation}
          onClose={() => setReviewReservation(null)}
          onSubmitReview={(newRev) => setReviews((prev) => [newRev, ...prev])}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#20150f] text-[#ebdcd0] border-t border-[#382b20] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-sm">
                  DV
                </div>
                <h4 className="text-base font-serif font-bold text-[#fcf9ee]">
                  Diversion Vigan
                </h4>
              </div>
              <p className="text-xs text-[#b8a595] leading-relaxed">
                Transient and Private Villa along Diversion Road, Vigan City, Ilocos Sur. Offering
                warm heritage hospitality, spacious family suites, and modern villa amenities.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Direct Contact & Inquiries
              </h5>
              <ul className="text-xs text-[#b8a595] space-y-2">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <span>+63 917 123 4567 / (077) 674-0000</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span>reservations@diversionvigan.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>Diversion Road, Vigan City, 2700 Ilocos Sur</span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Quick Navigation
              </h5>
              <div className="flex flex-col gap-2 text-xs text-[#b8a595]">
                <button
                  onClick={() => {
                    setActiveTab('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-amber-300 transition-colors"
                >
                  Rooms & Suites
                </button>
                <button
                  onClick={() => {
                    setActiveTab('custom-rates');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left hover:text-amber-300 transition-colors"
                >
                  Weekday & Weekend Rates
                </button>
                <button
                  onClick={() => setIsLookupOpen(true)}
                  className="text-left hover:text-amber-300 transition-colors"
                >
                  Find My Reservation Code
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className="text-left text-amber-400 hover:underline"
                >
                  Admin Portal
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#382b20] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8c7667]">
            <p>© {new Date().getFullYear()} Diversion Vigan Transient and Private Villa. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> in Vigan City, Ilocos Sur
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
