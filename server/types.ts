export interface CustomRates {
  paxTierRates?: {
    monThu?: Record<number, number>;
    friSun?: Record<number, number>;
  };
  durationDiscounts?: {
    threeNightsDiscount?: number;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
  };
  customDateRates?: {
    date: string;
    rate: number;
    label?: string;
  }[];
}

export interface Room {
  id: string;
  name: string;
  roomNumber: string;
  category: string;
  capacity: number;
  bedsCount?: number;
  bathsCount?: number;
  rating?: number;
  location?: string;
  pricePerNight: number;
  pricePerHour: number;
  status: string;
  isClean: boolean;
  floor: number;
  sizeSqM: number;
  images: string[];
  description: string;
  amenities: string[];
  houseRules: string[];
  cancellationPolicy: string;
  customRates?: CustomRates;
}

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
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  specialRequests?: string;
  createdAt: string;
  paymentMethod: string;
}

export interface DBData {
  rooms: Room[];
  reservations: Reservation[];
}
