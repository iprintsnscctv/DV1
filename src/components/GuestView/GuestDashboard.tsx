import React from 'react';
import { Room, FilterState, Reservation, CustomerUser, GuestReview } from '../../types';
import { RoomCard } from './RoomCard';
import { BookingSearchBar } from './BookingSearchBar';
import { CategoryTabs } from './CategoryTabs';
import { HeroBanner } from './HeroBanner';
import { ContactLocationSection } from './ContactLocationSection';
import { CustomerPortalView } from '../CustomerPortal/CustomerPortalView';
import { Search, Heart } from 'lucide-react';

interface GuestDashboardProps {
  rooms: Room[];
  filters: FilterState;
  savedRoomIds: string[];
  reservations: Reservation[];
  reviews?: GuestReview[];
  guestSubTab: 'all' | 'saved' | 'my-booking' | 'contact';
  currentCustomer: CustomerUser | null;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onToggleSaveRoom: (roomId: string) => void;
  onSelectRoom: (room: Room) => void;
  onBookRoom: (room: Room) => void;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onGuestsCountChange: (count: number) => void;
  onSwitchToCatalog: () => void;
  onCustomerChange: (user: CustomerUser | null) => void;
  onSubmitReview?: (review: GuestReview) => void;
  onCancelReservation: (reservationId: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const GuestDashboard: React.FC<GuestDashboardProps> = ({
  rooms,
  filters,
  savedRoomIds,
  reservations,
  reviews = [],
  guestSubTab,
  currentCustomer,
  checkInDate,
  checkOutDate,
  guestsCount,
  onFilterChange,
  onResetFilters,
  onToggleSaveRoom,
  onSelectRoom,
  onBookRoom,
  onCheckInChange,
  onCheckOutChange,
  onGuestsCountChange,
  onSwitchToCatalog,
  onCustomerChange,
  onSubmitReview,
  onCancelReservation,
  onShowToast,
}) => {
  // Filter rooms based on search, category, capacity
  const displayRooms = rooms.filter((room) => {
    // If in Saved tab, only show saved rooms
    if (guestSubTab === 'saved') {
      if (!savedRoomIds.includes(room.id)) return false;
    }

    const matchesCategory =
      filters.category === 'All' ||
      room.category.toLowerCase().includes(filters.category.toLowerCase()) ||
      filters.category.toLowerCase().includes(room.category.toLowerCase());

    const matchesCapacity = room.capacity >= guestsCount;

    const matchesSearch =
      filters.searchQuery === '' ||
      room.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      room.category.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return matchesCategory && matchesCapacity && matchesSearch;
  });

  return (
    <div className="w-full">
      {/* If Viewing My Booking Tab */}
      {guestSubTab === 'my-booking' ? (
        <CustomerPortalView
          currentCustomer={currentCustomer}
          reservations={reservations}
          rooms={rooms}
          reviews={reviews}
          onSubmitReview={onSubmitReview}
          onCustomerChange={onCustomerChange}
          onCancelReservation={onCancelReservation}
          onNavigateToCatalog={onSwitchToCatalog}
          onShowToast={onShowToast}
        />
      ) : guestSubTab === 'contact' ? (
        /* If Viewing Dedicated Contact Us Page */
        <ContactLocationSection onShowToast={onShowToast} />
      ) : (
        <>
          {/* Top Hero Section matching user reference image */}
          <HeroBanner />

          {/* Top Search Widget matching screenshot */}
          <BookingSearchBar
            selectedCategory={filters.category}
            onSelectCategory={(category) => onFilterChange({ category })}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guestsCount={guestsCount}
            onCheckInChange={onCheckInChange}
            onCheckOutChange={onCheckOutChange}
            onGuestsCountChange={onGuestsCountChange}
          />

          {/* Category Tabs: All, Family Suites, Studio Rooms, Lofts */}
          <CategoryTabs
            selectedCategory={filters.category}
            onSelectCategory={(category) => onFilterChange({ category })}
          />

          {/* Saved Tab Notification if viewing saved */}
          {guestSubTab === 'saved' && (
            <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3.5 rounded-2xl text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold">
                <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>
                  Showing {displayRooms.length} Saved Room{displayRooms.length === 1 ? '' : 's'}
                </span>
              </div>
              <button
                type="button"
                onClick={onSwitchToCatalog}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                View All Rooms
              </button>
            </div>
          )}

          {/* 4-Columns Responsive Room Grid matching Screenshot */}
          {displayRooms.length > 0 ? (
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSaved={savedRoomIds.includes(room.id)}
                  reservations={reservations}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  onCheckInChange={onCheckInChange}
                  onCheckOutChange={onCheckOutChange}
                  onToggleSave={onToggleSaveRoom}
                  onSelect={onSelectRoom}
                  onBook={onBookRoom}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-8 max-w-lg mx-auto">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {guestSubTab === 'saved' ? 'No saved rooms yet' : 'No rooms matching criteria'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {guestSubTab === 'saved'
                  ? 'Tap the heart icon on any room card to save it for quick reference later.'
                  : 'Try selecting a different room category or adjusting the guest count in the search bar.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onFilterChange({ category: 'All' });
                  onGuestsCountChange(1);
                  if (guestSubTab === 'saved') onSwitchToCatalog();
                }}
                className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
