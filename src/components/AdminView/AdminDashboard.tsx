import React, { useState } from 'react';
import { Room, Reservation, RoomStatus, RoomCustomRates, GuestReview } from '../../types';
import { 
  Building2, Users, Calendar, DollarSign, CheckCircle2, AlertCircle, 
  Clock, Plus, Search, Filter, Shield, Sparkles, RefreshCw, Eye, Edit3, Trash2, Check, X,
  Sliders, ListFilter, LayoutGrid, Tag, ArrowUpRight, Upload, Image as ImageIcon, Database,
  MessageSquare
} from 'lucide-react';
import { formatPHP } from '../../utils/formatCurrency';
import { calculateRoomPricing, getRoomCustomRateSummary } from '../../utils/pricingCalculator';
import { CustomRatesModal } from './CustomRatesModal';
import { RoomEditModal } from './RoomEditModal';
import { SupabaseSettingsModal } from './SupabaseSettingsModal';
import { StaffManagementModal } from './StaffManagementModal';
import { ReviewScreeningSection } from './ReviewScreeningSection';
import { AdminAccount } from '../../utils/adminAuth';

interface AdminDashboardProps {
  rooms: Room[];
  reservations: Reservation[];
  reviews?: GuestReview[];
  onApproveReview?: (reviewId: string) => void;
  onRejectReview?: (reviewId: string, feedback?: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  currentAdmin?: AdminAccount | null;
  onLogoutAdmin?: () => void;
  onUpdateRoomStatus: (roomId: string, status: RoomStatus, isClean: boolean) => void;
  onUpdateReservationStatus: (reservationId: string, status: Reservation['status']) => void;
  onCreateWalkInReservation: (reservation: Omit<Reservation, 'id' | 'confirmationCode' | 'createdAt'>) => void;
  onUpdateRoom?: (room: Room) => void;
  onAddNewRoom?: (room: Room) => void;
  onSaveRoomCustomRates?: (roomId: string, customRates: RoomCustomRates) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  rooms,
  reservations,
  reviews = [],
  onApproveReview,
  onRejectReview,
  onDeleteReview,
  currentAdmin,
  onLogoutAdmin,
  onUpdateRoomStatus,
  onUpdateReservationStatus,
  onCreateWalkInReservation,
  onUpdateRoom,
  onAddNewRoom,
  onSaveRoomCustomRates,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'reservations' | 'reviews'>('matrix');
  const [reservationSearch, setReservationSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;

  // Check current permissions (defaults to true if admin or unset)
  const isMasterAdmin = currentAdmin?.role === 'admin' || !currentAdmin;
  const canManageStaff = isMasterAdmin || currentAdmin?.permissions?.canManageStaff;
  const canManageRooms = isMasterAdmin || currentAdmin?.permissions?.canManageRooms;
  const canManageHousekeeping = isMasterAdmin || currentAdmin?.permissions?.canManageHousekeeping;
  const canManageReservations = isMasterAdmin || currentAdmin?.permissions?.canManageReservations;
  const canCreateWalkIn = isMasterAdmin || currentAdmin?.permissions?.canCreateWalkIn;
  const canAccessSupabase = isMasterAdmin || currentAdmin?.permissions?.canAccessSupabase;

  // Matrix room forms state
  const [matrixRoomForms, setMatrixRoomForms] = useState<Record<string, any>>({});
  const [roomForCustomRates, setRoomForCustomRates] = useState<Room | null>(null);

  // Room add / edit modal state
  const [roomForEdit, setRoomForEdit] = useState<Room | null>(null);
  const [showRoomEditModal, setShowRoomEditModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // Walk-in form state
  const [walkInRoomId, setWalkInRoomId] = useState(rooms[0]?.id || '');
  const [walkInGuestName, setWalkInGuestName] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInCheckIn, setWalkInCheckIn] = useState('2026-09-22');
  const [walkInCheckOut, setWalkInCheckOut] = useState('2026-09-24');
  const [walkInGuests, setWalkInGuests] = useState(2);
  const [walkInPayment, setWalkInPayment] = useState<Reservation['paymentMethod']>('Cash at Desk');

  // Matrix image manager state
  const [matrixImageRoomId, setMatrixImageRoomId] = useState<string | null>(null);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  const handleMatrixImageUpload = (room: Room, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newImages = [...room.images];
    let loadedCount = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            if (onUpdateRoom) {
              onUpdateRoom({ ...room, images: newImages });
            }
            onShowToast(`Successfully uploaded ${files.length} image(s) for Room ${room.roomNumber}`, 'success');
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMatrixAddImageUrl = (room: Room) => {
    if (!newImageUrlInput.trim()) return;
    const newImages = [...room.images, newImageUrlInput.trim()];
    if (onUpdateRoom) {
      onUpdateRoom({ ...room, images: newImages });
    }
    setNewImageUrlInput('');
    onShowToast(`Image URL added for Room ${room.roomNumber}`, 'success');
  };

  const handleMatrixRemoveImage = (room: Room, indexToRemove: number) => {
    if (room.images.length <= 1) {
      onShowToast('Room must have at least one image', 'error');
      return;
    }
    const newImages = room.images.filter((_, idx) => idx !== indexToRemove);
    if (onUpdateRoom) {
      onUpdateRoom({ ...room, images: newImages });
    }
    onShowToast(`Image removed for Room ${room.roomNumber}`, 'success');
  };

  // Compute metrics
  const totalRooms = rooms.length;
  const availableRoomsCount = rooms.filter((r) => r.status === 'Available').length;
  const occupiedRoomsCount = totalRooms - availableRoomsCount;
  const occupancyRate = Math.round((occupiedRoomsCount / (totalRooms || 1)) * 100);

  const todaysCheckIns = reservations.filter((r) => r.checkInDate === '2026-09-22' || r.checkInDate === '2026-09-21').length;
  const todaysCheckOuts = reservations.filter((r) => r.checkOutDate === '2026-09-22' || r.checkOutDate === '2026-09-21').length;
  const totalRevenue = reservations
    .filter((r) => r.status !== 'cancelled')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Selected room for walk-in pricing
  const currentWalkInRoom = rooms.find((r) => r.id === walkInRoomId) || rooms[0];

  const walkInPricing = currentWalkInRoom
    ? calculateRoomPricing(
        currentWalkInRoom,
        walkInCheckIn,
        walkInCheckOut,
        walkInGuests
      )
    : null;

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWalkInRoom) return;

    if (!walkInGuestName || !walkInPhone) {
      onShowToast('Please provide guest name and phone number for walk-in.', 'error');
      return;
    }

    const grandTotal = walkInPricing ? walkInPricing.grandTotal : currentWalkInRoom.pricePerNight * 2;

    onCreateWalkInReservation({
      roomId: currentWalkInRoom.id,
      roomName: currentWalkInRoom.name,
      roomNumber: currentWalkInRoom.roomNumber,
      guestName: walkInGuestName,
      guestEmail: walkInEmail || 'walkin@diversion.hotel',
      guestPhone: walkInPhone,
      checkInDate: walkInCheckIn,
      checkOutDate: walkInCheckOut,
      numberOfGuests: walkInGuests,
      totalAmount: grandTotal,
      status: 'active',
      specialRequests: 'Walk-in front desk booking (Custom rate calculation applied)',
      paymentMethod: walkInPayment,
    });

    onUpdateRoomStatus(currentWalkInRoom.id, 'Booked', true);
    onShowToast(`Checked in walk-in guest to Room ${currentWalkInRoom.roomNumber} (${formatPHP(grandTotal)})!`, 'success');
    setShowWalkInModal(false);

    // Reset form
    setWalkInGuestName('');
    setWalkInEmail('');
    setWalkInPhone('');
  };

  const handleOpenQuickBookForRoom = (room: Room) => {
    setWalkInRoomId(room.id);
    setWalkInGuests(room.customRates?.paxRule?.basePax || Math.min(2, room.capacity));
    setShowWalkInModal(true);
  };

  const handleSaveRates = (roomId: string, customRates: RoomCustomRates) => {
    if (onSaveRoomCustomRates) {
      onSaveRoomCustomRates(roomId, customRates);
    }
  };

  const handleSaveRoomDetails = (roomData: Room) => {
    if (roomForEdit) {
      if (onUpdateRoom) onUpdateRoom(roomData);
    } else {
      if (onAddNewRoom) onAddNewRoom(roomData);
    }
    setShowRoomEditModal(false);
    setRoomForEdit(null);
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.guestName.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      res.confirmationCode.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      res.roomName.toLowerCase().includes(reservationSearch.toLowerCase()) ||
      res.roomNumber.includes(reservationSearch);

    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Top Header & Summary Cards */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              Front Desk & Operations Panel
            </span>
            <span className="text-xs text-slate-400">All prices in Philippine Peso (PHP ₱)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Front Desk Room & Operations Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage room directory, custom rates (by days, pax, and specific dates), housekeeping, and reservations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Active Admin / Staff Session Badge */}
          {currentAdmin && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 dark:text-slate-300">
                Logged in: <strong className="text-slate-900 dark:text-white">{currentAdmin.username}</strong>
                {currentAdmin.role === 'admin' ? ' (Admin)' : ' (Staff)'}
              </span>
              {onLogoutAdmin && (
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className="ml-1 text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                >
                  Logout
                </button>
              )}
            </div>
          )}

          {/* Admin-only Staff Account Management */}
          {canManageStaff && (
            <button
              onClick={() => setShowStaffModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300/40 dark:border-amber-700/40 text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Create and manage staff accounts with restricted access"
            >
              <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Staff & Access Control</span>
            </button>
          )}

          {canAccessSupabase && (
            <button
              onClick={() => setShowSupabaseModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 shadow-xs transition-all cursor-pointer"
              title="Configure Cloud PostgreSQL Database with Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Supabase Settings</span>
            </button>
          )}

          {canManageRooms && (
            <button
              onClick={() => {
                setRoomForEdit(null);
                setShowRoomEditModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Add Room</span>
            </button>
          )}

          {canCreateWalkIn && (
            <button
              onClick={() => {
                if (rooms.length > 0) setWalkInRoomId(rooms[0].id);
                setShowWalkInModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Walk-In Booking</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Occupancy</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {occupancyRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {occupiedRoomsCount} of {totalRooms} rooms currently occupied
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Today's Check-Ins</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {todaysCheckIns} Guest(s)
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {todaysCheckOuts} expected check-outs
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Available Rooms</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {availableRoomsCount} Ready
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Ready for instant transient check-in
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
            {formatPHP(totalRevenue)}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Standardized in PHP (₱)
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Real-Time Room Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'reservations'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Reservation Logs ({reservations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Guest Reviews Screening</span>
          {pendingReviewsCount > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold animate-pulse">
              {pendingReviewsCount}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
              {reviews.length}
            </span>
          )}
        </button>
      </div>





      {/* TAB 3: REAL-TIME ROOM MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6 max-w-[1600px] mx-auto py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Booked</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Reserved</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400"></span> Maintenance</span>
            </div>
            <div className="text-xs text-slate-400">
              Real-time room configuration matrix matching active inventory specs.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const form = matrixRoomForms[room.id] || {
                name: room.name,
                description: room.description,
                roomNumber: room.roomNumber,
                amenitiesStr: room.amenities.join('\n'),
                extraPaxRate: room.customRates?.paxRule?.extraPaxRate || 350,
                newImageUrl: '',
              };

              const updateField = (field: string, val: any) => {
                setMatrixRoomForms((prev) => ({
                  ...prev,
                  [room.id]: {
                    ...(prev[room.id] || {
                      name: room.name,
                      description: room.description,
                      roomNumber: room.roomNumber,
                      amenitiesStr: room.amenities.join('\n'),
                      extraPaxRate: room.customRates?.paxRule?.extraPaxRate || 350,
                      newImageUrl: '',
                    }),
                    [field]: val,
                  },
                }));
              };

              const handleSaveBasic = () => {
                if (!onUpdateRoom) return;
                const updated: Room = {
                  ...room,
                  name: form.name,
                  description: form.description,
                  roomNumber: form.roomNumber,
                  amenities: form.amenitiesStr.split('\n').map((s: string) => s.trim()).filter(Boolean),
                };
                onUpdateRoom(updated);
                onShowToast(`Successfully saved details for Room ${room.roomNumber}`, 'success');
              };

              return (
                <div
                  key={room.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 relative flex flex-col justify-between"
                >
                  {/* Top Header Pill & Status */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs shadow-sm">
                        {room.roomNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={room.status}
                        onChange={(e) => onUpdateRoomStatus(room.id, e.target.value as RoomStatus, room.isClean)}
                        className="text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Available">Active (Available)</option>
                        <option value="Booked">Booked</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-sm">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Room Main Title & Compact Tabs */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => updateField('cardTab', 'details')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          (form.cardTab || 'details') === 'details'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => updateField('cardTab', 'rates')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          form.cardTab === 'rates'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        Rates
                      </button>
                      <button
                        onClick={() => updateField('cardTab', 'dates')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          form.cardTab === 'dates'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        Dates & Policy
                      </button>
                      <button
                        onClick={() => updateField('cardTab', 'photos')}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                          form.cardTab === 'photos'
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        Photos ({room.images.length})
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: DETAILS */}
                  {(!form.cardTab || form.cardTab === 'details') && (
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            ROOM NAME
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            ROOM NUMBER
                          </label>
                          <input
                            type="text"
                            value={form.roomNumber}
                            onChange={(e) => updateField('roomNumber', e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          DESCRIPTION
                        </label>
                        <textarea
                          rows={2}
                          value={form.description}
                          onChange={(e) => updateField('description', e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          AMENITIES (ONE PER LINE)
                        </label>
                        <textarea
                          rows={2}
                          value={form.amenitiesStr}
                          onChange={(e) => updateField('amenitiesStr', e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-mono"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={handleSaveBasic}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                        >
                          Save Details
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: RATES BY DAYS & PAX */}
                  {form.cardTab === 'rates' && (
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Rates by Days & Pax</span>
                        <button
                          onClick={() => onShowToast('Loaded standard base rates.', 'info')}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Load Standard
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                              <th className="p-2.5">PAX</th>
                              <th className="p-2.5">MON–THU</th>
                              <th className="p-2.5">FRI–SUN</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pax) => {
                              const baseP = room.pricePerNight;
                              const monVal = pax <= 2 ? baseP : baseP + (pax - 2) * 350;
                              const friVal = pax <= 2 ? Math.round(baseP * 1.1) : Math.round(baseP * 1.1) + (pax - 2) * 350;
                              return (
                                <tr key={pax} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <td className="p-2 font-bold text-slate-700 dark:text-slate-300">
                                    {pax === 1 ? '1' : pax === 2 ? '1–2' : `${pax}`}
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      defaultValue={monVal}
                                      className="w-full p-1 bg-slate-50 dark:bg-slate-800 rounded-lg font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      defaultValue={friVal}
                                      className="w-full p-1 bg-slate-50 dark:bg-slate-800 rounded-lg font-bold text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: DATES & POLICY */}
                  {form.cardTab === 'dates' && (
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                      {/* Rates by Date */}
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Rates by Date</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                          />
                          <div className="flex gap-1.5">
                            <input
                              type="number"
                              placeholder="₱ Rate"
                              defaultValue={Math.round(room.pricePerNight * 1.3)}
                              className="w-full p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                            />
                            <button
                              onClick={() => onShowToast('Custom date rate added.', 'success')}
                              className="px-3 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Extra guest fee & Age policy */}
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Extra Guest &gt;7 Fee</span>
                        <div className="flex items-center gap-2 max-w-xs bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 font-bold">₱</span>
                          <input
                            type="number"
                            defaultValue={350}
                            className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1 text-[11px] text-amber-900 dark:text-amber-200">
                        <div className="font-extrabold">Age-Based Rate Policy:</div>
                        <div>• 6 yrs and above: ₱300 / night</div>
                        <div>• 5 yrs and below: Free</div>
                      </div>

                      {/* Maintenance / Blocked Dates */}
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Blocked / Maintenance Dates</span>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => onShowToast('Blocked date added.', 'info')}
                            className="px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl"
                          >
                            Block
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: PHOTOS */}
                  {form.cardTab === 'photos' && (
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {room.images.map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-900">
                            <img src={imgUrl} alt={`Room ${room.roomNumber} ${imgIdx}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            {imgIdx === 0 && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-indigo-600 text-white font-extrabold text-[8px] shadow-sm">
                                COVER
                              </span>
                            )}
                            <button
                              onClick={() => handleMatrixRemoveImage(room, imgIdx)}
                              className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              title="Remove image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleMatrixImageUpload(room, e)}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950/50 dark:file:text-indigo-400 cursor-pointer"
                        />
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={form.newImageUrl || ''}
                            onChange={(e) => updateField('newImageUrl', e.target.value)}
                            className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              if (!form.newImageUrl) return;
                              const updated = { ...room, images: [...room.images, form.newImageUrl] };
                              if (onUpdateRoom) onUpdateRoom(updated);
                              updateField('newImageUrl', '');
                              onShowToast('Image URL added successfully.', 'success');
                            }}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: RESERVATION LOGS */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search guest name, code, room..."
                value={reservationSearch}
                onChange={(e) => setReservationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active (Checked In)</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Confirmation & Guest</th>
                    <th className="p-4">Room Reserved</th>
                    <th className="p-4">Dates & Guests</th>
                    <th className="p-4">Payment & Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Front Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredReservations.map((res) => (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {res.confirmationCode}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                          {res.guestName}
                        </div>
                        <div className="text-[11px] text-slate-400">{res.guestPhone}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          Room {res.roomNumber}
                        </div>
                        <div className="text-slate-400 text-[11px]">{res.roomName}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {res.checkInDate} → {res.checkOutDate}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {res.numberOfGuests} Guest(s)
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatPHP(res.totalAmount)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {res.paymentMethod}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            res.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : res.status === 'upcoming'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : res.status === 'completed'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {res.status === 'upcoming' && (
                          <button
                            onClick={() => {
                              onUpdateReservationStatus(res.id, 'active');
                              onUpdateRoomStatus(res.roomId, 'Booked', true);
                              onShowToast(`Guest ${res.guestName} checked in to Room ${res.roomNumber}`, 'success');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                          >
                            Check-In
                          </button>
                        )}

                        {res.status === 'active' && (
                          <button
                            onClick={() => {
                              onUpdateReservationStatus(res.id, 'completed');
                              onUpdateRoomStatus(res.roomId, 'Available', false);
                              onShowToast(`Guest ${res.guestName} checked out. Room marked dirty for housekeeping.`, 'info');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs"
                          >
                            Check-Out
                          </button>
                        )}

                        {res.status !== 'cancelled' && res.status !== 'completed' && (
                          <button
                            onClick={() => {
                              onUpdateReservationStatus(res.id, 'cancelled');
                              onShowToast(`Reservation ${res.confirmationCode} cancelled.`, 'error');
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredReservations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No reservations match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GUEST REVIEWS SCREENING */}
      {activeTab === 'reviews' && (
        <ReviewScreeningSection
          reviews={reviews}
          onApproveReview={(id) => onApproveReview?.(id)}
          onRejectReview={(id, feedback) => onRejectReview?.(id, feedback)}
          onDeleteReview={(id) => onDeleteReview?.(id)}
          onShowToast={onShowToast}
        />
      )}

      {/* Custom Rates Modal (Days, Pax, Specific Dates) */}
      {roomForCustomRates && (
        <CustomRatesModal
          room={roomForCustomRates}
          onClose={() => setRoomForCustomRates(null)}
          onSaveRates={handleSaveRates}
          onShowToast={onShowToast}
        />
      )}

      {/* Room Add / Edit Modal */}
      {showRoomEditModal && (
        <RoomEditModal
          room={roomForEdit}
          isOpen={showRoomEditModal}
          onClose={() => {
            setShowRoomEditModal(false);
            setRoomForEdit(null);
          }}
          onSaveRoom={handleSaveRoomDetails}
          onShowToast={onShowToast}
        />
      )}

      {/* Walk-In Modal With Dynamic Rate Engine */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Front-Desk Walk-In Booking
                </h3>
                <p className="text-xs text-slate-400">
                  Custom rates by days, pax, and dates applied automatically.
                </p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Room
                </label>
                <select
                  value={walkInRoomId}
                  onChange={(e) => setWalkInRoomId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} - {r.name} ({formatPHP(r.pricePerNight)}/night) {r.status !== 'Available' ? `[${r.status}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Juan dela Cruz"
                    value={walkInGuestName}
                    onChange={(e) => setWalkInGuestName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+63 917 123 4567"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Check-In
                  </label>
                  <input
                    type="date"
                    value={walkInCheckIn}
                    onChange={(e) => setWalkInCheckIn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Check-Out
                  </label>
                  <input
                    type="date"
                    value={walkInCheckOut}
                    onChange={(e) => setWalkInCheckOut(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Guests (Pax)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={currentWalkInRoom?.capacity || 6}
                    value={walkInGuests}
                    onChange={(e) => setWalkInGuests(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={walkInPayment}
                  onChange={(e) => setWalkInPayment(e.target.value as Reservation['paymentMethod'])}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="Cash at Desk">Cash at Desk (PHP ₱)</option>
                  <option value="GCash / Mobile Money">GCash / Maya (Philippines)</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">BDO / BPI Bank Transfer</option>
                </select>
              </div>

              {/* Dynamic Custom Rate Pricing Breakdown Box */}
              {walkInPricing && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
                  <div className="font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                    <span>Rate Calculation Breakdown ({walkInPricing.nights} Night{walkInPricing.nights > 1 ? 's' : ''}):</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      ₱ Philippine Peso
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Nightly Subtotal ({walkInPricing.nights} nights):</span>
                      <span>{formatPHP(walkInPricing.nightlySubtotal)}</span>
                    </div>

                    {walkInPricing.extraPaxTotal > 0 && (
                      <div className="flex justify-between text-indigo-600 dark:text-indigo-400 font-semibold">
                        <span>Extra Guests ({walkInGuests} guests):</span>
                        <span>+{formatPHP(walkInPricing.extraPaxTotal)}</span>
                      </div>
                    )}

                    {walkInPricing.durationDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Duration Discount ({walkInPricing.durationDiscountLabel || `${walkInPricing.durationDiscountPercentage}%`}):</span>
                        <span>-{formatPHP(walkInPricing.durationDiscountAmount)}</span>
                      </div>
                    )}

                    {walkInPricing.customRulesApplied.length > 0 && (
                      <div className="pt-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        Rules applied: {walkInPricing.customRulesApplied.join(' • ')}
                      </div>
                    )}

                    <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                      <span>12% VAT & Cleaning Fee:</span>
                      <span>{formatPHP(walkInPricing.vatAmount + walkInPricing.serviceFee)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-indigo-200 dark:border-indigo-900 font-extrabold text-sm text-slate-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 text-base">
                      {formatPHP(walkInPricing.grandTotal)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check In Guest Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supabase PostgreSQL Configuration & Sync Modal */}
      <SupabaseSettingsModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
        onShowToast={onShowToast}
      />

      {/* Staff Management & Access Restriction Modal */}
      {showStaffModal && currentAdmin && (
        <StaffManagementModal
          currentAdmin={currentAdmin}
          onClose={() => setShowStaffModal(false)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
