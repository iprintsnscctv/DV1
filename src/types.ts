export type RoomStatus = 'Available' | 'Booked' | 'Reserved' | 'Maintenance';

export type RoomCategory = 'All' | 'Family Suites' | 'Studio Rooms' | 'Lofts' | string;

export interface DayOfWeekRate {
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  name: string; // 'Sunday', 'Monday', etc.
  rateMultiplier?: number; // e.g. 1.2 (+20%)
  fixedPrice?: number; // e.g. ₱2,400
  enabled: boolean;
}

export interface PaxRateRule {
  basePax: number; // Guest count covered by base price (e.g., 2)
  extraPaxRate: number; // Extra fee per guest per night (e.g., ₱350)
  maxPax?: number; // Maximum allowable pax
}

export interface SpecificDateRate {
  id: string;
  date: string; // 'YYYY-MM-DD'
  name: string; // e.g., 'Sinulog Festival', 'Christmas Day', 'New Year Holiday'
  pricePerNight: number; // Custom rate in PHP
  notes?: string;
}

export interface DurationDiscountRule {
  id: string;
  minNights: number; // e.g., 3 nights, 7 nights
  discountPercentage: number; // e.g., 10 for 10% off
  label: string; // e.g. '3+ Nights Long Stay (10% Off)'
}

export interface PaxTierRateMap {
  monThu: { [pax: number]: number };
  friSun: { [pax: number]: number };
}

export interface RoomCustomRates {
  // Custom rate by Pax
  paxRule?: PaxRateRule;
  paxTierRates?: PaxTierRateMap;
  // Custom rate by Days of the week (e.g., Friday/Saturday surge)
  dayOfWeekRates?: DayOfWeekRate[];
  // Custom rate by Specific Day / Date (e.g. holidays, festival dates)
  specificDateRates?: SpecificDateRate[];
  // Custom rate by stay duration / number of days
  durationDiscounts?: DurationDiscountRule[];
}

export interface Room {
  id: string;
  name: string;
  roomNumber: string;
  category: RoomCategory;
  capacity: number;
  bedsCount?: number;
  bathsCount?: number;
  rating?: number;
  location?: string;
  pricePerNight: number;
  pricePerHour?: number; // For transient stays
  status: RoomStatus;
  isClean: boolean;
  images: string[];
  description: string;
  amenities: string[];
  floor: number;
  sizeSqM: number;
  houseRules: string[];
  cancellationPolicy: string;
  customRates?: RoomCustomRates;
}

export type ReservationStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  confirmationCode: string;
  roomId: string;
  roomName: string;
  roomNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;
  paymentMethod: 'Credit Card' | 'Cash at Desk' | 'GCash / Mobile Money' | 'PayPal';
}

export interface FilterState {
  searchQuery: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  capacity: number;
  amenities: string[];
  status: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

