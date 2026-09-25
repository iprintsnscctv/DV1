import React, { useState, useEffect } from 'react';
import { Room, Reservation, FilterState, RoomStatus, CustomerUser, GuestReview } from './types';
import { INITIAL_ROOMS, INITIAL_RESERVATIONS } from './data/mockData';
import {
  fetchRooms,
  fetchReservations,
  createReservationOnServer,
  updateReservationStatusOnServer,
  updateRoomOnServer,
} from './services/api';
import { getCurrentCustomer } from './utils/customerAuth';
import { getCurrentAdminSession, logoutAdmin, AdminAccount } from './utils/adminAuth';
import { getStoredReviews, saveReview, updateReviewStatus, deleteStoredReview } from './utils/reviewStorage';
import { Header } from './components/Header';
import { GuestDashboard } from './components/GuestView/GuestDashboard';
import { AdminDashboard } from './components/AdminView/AdminDashboard';
import { AdminLoginModal } from './components/AdminView/AdminLoginModal';
import { RoomDetailModal } from './components/GuestView/RoomDetailModal';
import { BookingModal } from './components/GuestView/BookingModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DiversionLogo } from './components/DiversionLogo';
import { generateReceiptNumber } from './utils/receiptNumber';

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [reviews, setReviews] = useState<GuestReview[]>(() => getStoredReviews());
  const [currentView, setCurrentView] = useState<'guest' | 'admin'>('guest');
  const [guestSubTab, setGuestSubTab] = useState<'all' | 'saved' | 'my-booking' | 'contact'>('all');

  // Customer Account Auth State
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(() => getCurrentCustomer());

  // Admin Account Auth State
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => getCurrentAdminSession());
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // Search Bar Criteria (synced with Booking Modal)
  const [checkInDate, setCheckInDate] = useState('2026-09-24');
  const [checkOutDate, setCheckOutDate] = useState('2026-09-26');
  const [guestsCount, setGuestsCount] = useState(1);

  // Sync with backend API on mount
  useEffect(() => {
    fetchRooms()
      .then((serverRooms) => {
        if (serverRooms && serverRooms.length > 0) {
          setRooms(serverRooms);
        }
      })
      .catch((err) => console.log('Using local rooms dataset fallback:', err));

    fetchReservations()
      .then((serverRes) => {
        if (serverRes && serverRes.length > 0) {
          setReservations(serverRes);
        }
      })
      .catch((err) => console.log('Using local reservations dataset fallback:', err));
  }, []);

  // Saved / Favorite rooms
  const [savedRoomIds, setSavedRoomIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('div_saved_rooms');
      return stored ? JSON.parse(stored) : ['room-0', 'room-3'];
    } catch {
      return ['room-0', 'room-3'];
    }
  });

  const toggleSaveRoom = (roomId: string) => {
    const isCurrentlySaved = savedRoomIds.includes(roomId);
    const updated = isCurrentlySaved
      ? savedRoomIds.filter((id) => id !== roomId)
      : [...savedRoomIds, roomId];

    setSavedRoomIds(updated);
    try {
      localStorage.setItem('div_saved_rooms', JSON.stringify(updated));
    } catch {}

    showToast(
      isCurrentlySaved ? 'Removed from your saved rooms' : 'Saved room to your favorites list!',
      isCurrentlySaved ? 'info' : 'success'
    );
  };

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All',
    minPrice: 500,
    maxPrice: 6000,
    capacity: 1,
    amenities: [],
    status: 'All',
  });

  // Modals
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'All',
      minPrice: 500,
      maxPrice: 6000,
      capacity: 1,
      amenities: [],
      status: 'All',
    });
    setGuestsCount(1);
    showToast('Filters reset to default.', 'info');
  };

  // Room status update from admin
  const handleUpdateRoomStatus = (roomId: string, status: RoomStatus, isClean: boolean) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status, isClean } : r))
    );
    updateRoomOnServer(roomId, { status, isClean }).catch((err) =>
      console.warn('Backend sync failed, state retained locally:', err)
    );
    showToast('Room status and housekeeping updated successfully.', 'success');
  };

  // Reservation status update
  const handleUpdateReservationStatus = (reservationId: string, status: Reservation['status']) => {
    const targetRes = reservations.find((r) => r.id === reservationId);
    if (targetRes && (status === 'completed' || status === 'cancelled')) {
      setRooms((rPrev) =>
        rPrev.map((r) => (r.id === targetRes.roomId ? { ...r, status: 'Available' } : r))
      );
    }

    setReservations((prev) =>
      prev.map((res) => (res.id === reservationId ? { ...res, status } : res))
    );

    updateReservationStatusOnServer(reservationId, status).catch((err) =>
      console.warn('Backend reservation status sync failed:', err)
    );
  };

  // Create guest transient booking
  const handleConfirmBooking = (
    newResData: Omit<Reservation, 'id' | 'confirmationCode' | 'createdAt' | 'status'>
  ) => {
    if (!currentCustomer) {
      showToast('You must register an account before booking a room.', 'error');
      setGuestSubTab('my-booking');
      return;
    }

    const receiptCode = generateReceiptNumber(reservations);
    const newReservation: Reservation = {
      ...newResData,
      id: `res-${Date.now()}`,
      confirmationCode: receiptCode,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'upcoming',
    };

    setReservations((prev) => [newReservation, ...prev]);

    // Mark room as reserved/booked
    setRooms((prev) =>
      prev.map((r) => (r.id === newResData.roomId ? { ...r, status: 'Reserved' } : r))
    );

    // Save to server
    createReservationOnServer(newReservation).catch((err) =>
      console.warn('Backend booking save failed, cached in memory:', err)
    );

    // Switch to My Booking so guest can inspect receipt
    setGuestSubTab('my-booking');
    showToast('Booking confirmed! Check your official receipt in My Booking.', 'success');
  };

  // Create walk-in reservation from admin
  const handleCreateWalkIn = (
    newResData: Omit<Reservation, 'id' | 'confirmationCode' | 'createdAt'>
  ) => {
    const receiptCode = generateReceiptNumber(reservations);
    const newReservation: Reservation = {
      ...newResData,
      id: `res-${Date.now()}`,
      confirmationCode: receiptCode,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setReservations((prev) => [newReservation, ...prev]);
    createReservationOnServer(newReservation).catch((err) =>
      console.warn('Backend walk-in sync failed:', err)
    );
  };

  // Update room details from front desk panel
  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
    updateRoomOnServer(updatedRoom.id, {
      status: updatedRoom.status,
      isClean: updatedRoom.isClean,
      pricePerNight: updatedRoom.pricePerNight,
      pricePerHour: updatedRoom.pricePerHour,
      description: updatedRoom.description,
      customRates: updatedRoom.customRates,
    }).catch((err) => console.warn('Backend room update failed:', err));
  };

  // Add new room to inventory
  const handleAddNewRoom = (newRoom: Room) => {
    setRooms((prev) => [newRoom, ...prev]);
  };

  // Save custom rates for room
  const handleSaveRoomCustomRates = (roomId: string, customRates: Room['customRates']) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, customRates } : r))
    );
    updateRoomOnServer(roomId, { customRates }).catch((err) =>
      console.warn('Backend custom rates sync failed:', err)
    );
  };

  // Review management handlers
  const handleSubmitReview = (newReview: GuestReview) => {
    const updated = saveReview(newReview);
    setReviews(updated);
  };

  const handleApproveReview = (reviewId: string) => {
    const updated = updateReviewStatus(reviewId, 'approved');
    setReviews(updated);
  };

  const handleRejectReview = (reviewId: string, feedback?: string) => {
    const updated = updateReviewStatus(reviewId, 'rejected', feedback);
    setReviews(updated);
  };

  const handleDeleteReview = (reviewId: string) => {
    const updated = deleteStoredReview(reviewId);
    setReviews(updated);
  };

  const customerBookingsCount = currentCustomer
    ? reservations.filter((r) => r.guestEmail.toLowerCase() === currentCustomer.email.toLowerCase()).length
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        currentView={currentView}
        guestSubTab={guestSubTab}
        currentCustomer={currentCustomer}
        savedCount={savedRoomIds.length}
        customerBookingsCount={customerBookingsCount}
        onViewChange={(view) => {
          if (view === 'admin') {
            if (!currentAdmin) {
              setShowAdminLoginModal(true);
            } else {
              setCurrentView('admin');
            }
          } else {
            setCurrentView('guest');
            setGuestSubTab('all');
          }
        }}
        onGuestSubTabChange={(tab) => {
          setCurrentView('guest');
          setGuestSubTab(tab);
        }}
        onShowToast={showToast}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6">
        {currentView === 'guest' ? (
          <GuestDashboard
            rooms={rooms}
            filters={filters}
            savedRoomIds={savedRoomIds}
            reservations={reservations}
            reviews={reviews}
            guestSubTab={guestSubTab}
            currentCustomer={currentCustomer}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guestsCount={guestsCount}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onToggleSaveRoom={toggleSaveRoom}
            onSelectRoom={(room) => setSelectedRoomForDetails(room)}
            onBookRoom={(room) => setSelectedRoomForBooking(room)}
            onCheckInChange={setCheckInDate}
            onCheckOutChange={setCheckOutDate}
            onGuestsCountChange={setGuestsCount}
            onSwitchToCatalog={() => setGuestSubTab('all')}
            onCustomerChange={setCurrentCustomer}
            onSubmitReview={handleSubmitReview}
            onCancelReservation={(id) => handleUpdateReservationStatus(id, 'cancelled')}
            onShowToast={showToast}
          />
        ) : (
          <AdminDashboard
            rooms={rooms}
            reservations={reservations}
            reviews={reviews}
            onApproveReview={handleApproveReview}
            onRejectReview={handleRejectReview}
            onDeleteReview={handleDeleteReview}
            currentAdmin={currentAdmin}
            onLogoutAdmin={() => {
              logoutAdmin();
              setCurrentAdmin(null);
              setCurrentView('guest');
              showToast('Logged out from Admin session.', 'info');
            }}
            onUpdateRoomStatus={handleUpdateRoomStatus}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onCreateWalkInReservation={handleCreateWalkIn}
            onUpdateRoom={handleUpdateRoom}
            onAddNewRoom={handleAddNewRoom}
            onSaveRoomCustomRates={handleSaveRoomCustomRates}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Refined Brand Footer */}
      <footer className="border-t border-amber-900/10 dark:border-amber-900/30 bg-[#f7f2ea]/70 dark:bg-[#120d0a]/80 mt-16 py-12 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <DiversionLogo size="lg" variant="horizontal" />
          </div>

          <div className="flex flex-col md:items-end text-xs text-[#5c4636] dark:text-[#c4b3a4] space-y-1">
            <p className="font-semibold text-sm text-[#3b2a1e] dark:text-[#ebdccd]">
              Diversion Road, Vigan City, Ilocos Sur, Philippines
            </p>
            <p>Direct Inquiries & Bookings: +63 977 123 4567 • reservation@diversionvigan.ph</p>
            <p className="text-[11px] text-[#806c5d] dark:text-[#9e8d7f] pt-1">
              © {new Date().getFullYear()} Diversion Vigan • Transient and Private Villa. All rights reserved.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-amber-900/10 dark:border-amber-900/20 text-center text-xs text-[#806c5d] dark:text-[#9e8d7f]">
          <p>Designed &amp; Developed by James Mait</p>
        </div>
      </footer>

      {/* Room Detail Modal */}
      {selectedRoomForDetails && (
        <RoomDetailModal
          room={selectedRoomForDetails}
          reviews={reviews}
          onClose={() => setSelectedRoomForDetails(null)}
          onBook={(room) => {
            setSelectedRoomForDetails(null);
            setSelectedRoomForBooking(room);
          }}
        />
      )}

      {/* Booking Workflow Modal with customer prefill */}
      {selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          currentCustomer={currentCustomer}
          onCustomerChange={setCurrentCustomer}
          initialCheckInDate={checkInDate}
          initialCheckOutDate={checkOutDate}
          initialGuestsCount={guestsCount}
          onClose={() => setSelectedRoomForBooking(null)}
          onConfirmBooking={handleConfirmBooking}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Admin / Staff Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={(admin) => {
          setCurrentAdmin(admin);
          setCurrentView('admin');
        }}
        onShowToast={showToast}
      />
    </div>
  );
}
