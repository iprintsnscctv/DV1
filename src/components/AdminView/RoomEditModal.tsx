import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, RoomCategory, RoomStatus } from '../../types';
import { formatPHP } from '../../utils/formatCurrency';
import { AMENITIES_LIST } from '../../data/mockData';
import { X, CheckCircle2, Building2, DollarSign, Users, Layers, Sparkles } from 'lucide-react';

interface RoomEditModalProps {
  room: Room | null; // null means adding a new room
  isOpen: boolean;
  onClose: () => void;
  onSaveRoom: (roomData: Room) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES: RoomCategory[] = [
  'Standard Transient',
  'Deluxe Suite',
  'Executive Loft',
  'Family Villa',
  'Budget Pod',
];

export const RoomEditModal: React.FC<RoomEditModalProps> = ({
  room,
  isOpen,
  onClose,
  onSaveRoom,
  onShowToast,
}) => {
  const isEditing = Boolean(room);

  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState<RoomCategory>('Standard Transient');
  const [capacity, setCapacity] = useState(2);
  const [pricePerNight, setPricePerNight] = useState(1500);
  const [pricePerHour, setPricePerHour] = useState<number | undefined>(200);
  const [floor, setFloor] = useState(1);
  const [sizeSqM, setSizeSqM] = useState(24);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (room) {
      setName(room.name);
      setRoomNumber(room.roomNumber);
      setCategory(room.category);
      setCapacity(room.capacity);
      setPricePerNight(room.pricePerNight);
      setPricePerHour(room.pricePerHour);
      setFloor(room.floor);
      setSizeSqM(room.sizeSqM);
      setDescription(room.description);
      setAmenities(room.amenities);
      setImageUrl(room.images[0] || '');
    } else {
      setName('');
      setRoomNumber('');
      setCategory('Standard Transient');
      setCapacity(2);
      setPricePerNight(1500);
      setPricePerHour(200);
      setFloor(1);
      setSizeSqM(24);
      setDescription('Comfortable transient room with modern amenities.');
      setAmenities(['High-Speed Wi-Fi', 'Air Conditioning', 'Hot Shower']);
      setImageUrl('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80');
    }
  }, [room, isOpen]);

  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roomNumber || pricePerNight <= 0) {
      onShowToast('Please fill in required room details.', 'error');
      return;
    }

    const finalRoom: Room = {
      id: room ? room.id : `room-${Date.now()}`,
      name,
      roomNumber,
      category,
      capacity,
      pricePerNight,
      pricePerHour: pricePerHour && pricePerHour > 0 ? pricePerHour : undefined,
      status: room ? room.status : 'Available',
      isClean: room ? room.isClean : true,
      images: imageUrl ? [imageUrl] : (room ? room.images : ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80']),
      description,
      amenities,
      floor,
      sizeSqM,
      houseRules: room ? room.houseRules : ['No smoking indoors', 'Quiet hours from 10 PM'],
      cancellationPolicy: room ? room.cancellationPolicy : 'Free cancellation up to 24 hours before check-in.',
      customRates: room?.customRates,
    };

    onSaveRoom(finalRoom);
    onShowToast(isEditing ? `Room ${roomNumber} updated.` : `New Room ${roomNumber} created.`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isEditing ? `Edit Room ${room?.roomNumber}` : 'Add New Room to Inventory'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Front Desk Room Inventory Record
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 104, 205"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Floor Number *
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Room Display Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sunrise Deluxe Ocean Loft"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RoomCategory)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Max Capacity (Guests)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Size (sq.m)
                </label>
                <input
                  type="number"
                  min={10}
                  value={sizeSqM}
                  onChange={(e) => setSizeSqM(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Base Nightly Rate (PHP ₱) *
                </label>
                <input
                  type="number"
                  step={50}
                  min={100}
                  required
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hourly Transient Rate (PHP ₱)
                </label>
                <input
                  type="number"
                  step={10}
                  min={0}
                  placeholder="Optional, e.g. 200"
                  value={pricePerHour ?? ''}
                  onChange={(e) => setPricePerHour(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-amber-600 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Room Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Amenities Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Room Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITIES_LIST.map((item) => {
                  const isChecked = amenities.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleAmenity(item)}
                      className={`p-2 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{item}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Create Room'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
