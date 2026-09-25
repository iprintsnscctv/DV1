import { Room, Reservation } from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-0',
    name: 'Room 0 - Big Family Room',
    roomNumber: '0',
    category: 'Family Suites',
    capacity: 8,
    bedsCount: 2,
    bathsCount: 1,
    rating: 4.88,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 2000,
    pricePerHour: 220,
    status: 'Available',
    isClean: true,
    floor: 1,
    sizeSqM: 45,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Spacious Big Family Room accommodating up to 8 pax with comfortable bedding and modern amenities.',
    amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Hot & Cold Shower', 'Mini Refrigerator'],
    houseRules: ['No smoking inside room', 'Quiet hours from 10 PM to 7 AM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in time.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000, 6: 2400, 7: 2550, 8: 2700 },
        friSun: { 1: 2200, 2: 2200, 3: 2200, 4: 2200, 5: 2200, 6: 2550, 7: 2750, 8: 3000 }
      }
    }
  },
  {
    id: 'room-1',
    name: 'Room 1 - Big Family Room',
    roomNumber: '1',
    category: 'Family Suites',
    capacity: 8,
    bedsCount: 2,
    bathsCount: 1,
    rating: 4.92,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 2000,
    pricePerHour: 250,
    status: 'Available',
    isClean: true,
    floor: 1,
    sizeSqM: 45,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Spacious Big Family Room accommodating up to 8 pax with comfortable bedding and modern amenities.',
    amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Hot & Cold Shower', 'Mini Refrigerator'],
    houseRules: ['No smoking inside room', 'Quiet hours from 10 PM to 7 AM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in time.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000, 6: 2400, 7: 2550, 8: 2700 },
        friSun: { 1: 2200, 2: 2200, 3: 2200, 4: 2200, 5: 2200, 6: 2550, 7: 2750, 8: 3000 }
      }
    }
  },
  {
    id: 'room-2',
    name: 'Room 2 - Loft type Family',
    roomNumber: '2',
    category: 'Lofts',
    capacity: 10,
    bedsCount: 3,
    bathsCount: 2,
    rating: 4.85,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 2000,
    pricePerHour: 280,
    status: 'Available',
    isClean: true,
    floor: 2,
    sizeSqM: 60,
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Loft type Family room accommodating up to 10 pax with multi-level layout and premium amenities.',
    amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Hot & Cold Shower', 'Loft Mezzanine'],
    houseRules: ['Strictly no smoking', 'Quiet hours after 10 PM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000, 6: 2400, 7: 2550, 8: 2700, 9: 2750, 10: 3000 },
        friSun: { 1: 2200, 2: 2200, 3: 2200, 4: 2200, 5: 2200, 6: 2550, 7: 2750, 8: 3000, 9: 3150, 10: 3500 }
      }
    }
  },
  {
    id: 'room-3',
    name: 'Room 3 - Loft type Family',
    roomNumber: '3',
    category: 'Lofts',
    capacity: 10,
    bedsCount: 3,
    bathsCount: 2,
    rating: 4.96,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 2000,
    pricePerHour: 280,
    status: 'Available',
    isClean: true,
    floor: 2,
    sizeSqM: 60,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Loft type Family room accommodating up to 10 pax with multi-level layout and premium amenities.',
    amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Hot & Cold Shower', 'Loft Mezzanine'],
    houseRules: ['Strictly no smoking', 'Quiet hours after 10 PM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000, 6: 2400, 7: 2550, 8: 2700, 9: 2750, 10: 3000 },
        friSun: { 1: 2200, 2: 2200, 3: 2200, 4: 2200, 5: 2200, 6: 2550, 7: 2750, 8: 3000, 9: 3150, 10: 3500 }
      }
    }
  },
  {
    id: 'room-4',
    name: 'Room 4 - Family room',
    roomNumber: '4',
    category: 'Family Suites',
    capacity: 3,
    bedsCount: 1,
    bathsCount: 1,
    rating: 4.90,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 900,
    pricePerHour: 150,
    status: 'Available',
    isClean: true,
    floor: 3,
    sizeSqM: 25,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Cozy Family room accommodating up to 3 pax.',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Smart TV', 'Hot Shower'],
    houseRules: ['No smoking', 'Quiet hours after 10 PM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 900, 2: 900, 3: 1200 },
        friSun: { 1: 1000, 2: 1000, 3: 1300 }
      }
    }
  },
  {
    id: 'room-5',
    name: 'Room 5 - Family room',
    roomNumber: '5',
    category: 'Family Suites',
    capacity: 3,
    bedsCount: 1,
    bathsCount: 1,
    rating: 4.89,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 900,
    pricePerHour: 150,
    status: 'Available',
    isClean: true,
    floor: 1,
    sizeSqM: 25,
    images: [
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Cozy Family room accommodating up to 3 pax.',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Smart TV', 'Hot Shower'],
    houseRules: ['No smoking', 'Quiet hours after 10 PM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 900, 2: 900, 3: 1200 },
        friSun: { 1: 1000, 2: 1000, 3: 1300 }
      }
    }
  },
  {
    id: 'room-6',
    name: 'Room 6 - Family room',
    roomNumber: '6',
    category: 'Family Suites',
    capacity: 3,
    bedsCount: 1,
    bathsCount: 1,
    rating: 4.94,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 900,
    pricePerHour: 150,
    status: 'Available',
    isClean: true,
    floor: 3,
    sizeSqM: 25,
    images: [
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Cozy Family room accommodating up to 3 pax.',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Smart TV', 'Hot Shower'],
    houseRules: ['No smoking', 'Quiet hours after 10 PM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 900, 2: 900, 3: 1200 },
        friSun: { 1: 1000, 2: 1000, 3: 1300 }
      }
    }
  },
  {
    id: 'room-7',
    name: 'Room 7 - Small Loft type Family',
    roomNumber: '7',
    category: 'Lofts',
    capacity: 8,
    bedsCount: 2,
    bathsCount: 1,
    rating: 4.98,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 2000,
    pricePerHour: 250,
    status: 'Available',
    isClean: true,
    floor: 4,
    sizeSqM: 50,
    images: [
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Small Loft type Family room accommodating up to 8 pax.',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Smart TV', 'Hot Shower', 'Mezzanine'],
    houseRules: ['No smoking', 'Quiet hours after 10 PM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000, 6: 2400, 7: 2550, 8: 2700 },
        friSun: { 1: 2200, 2: 2200, 3: 2200, 4: 2200, 5: 2200, 6: 2550, 7: 2750, 8: 3000 }
      }
    }
  },
  {
    id: 'room-8',
    name: 'Room 8 - Standard room',
    roomNumber: '8',
    category: 'Studio Rooms',
    capacity: 3,
    bedsCount: 1,
    bathsCount: 1,
    rating: 4.87,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 900,
    pricePerHour: 150,
    status: 'Available',
    isClean: true,
    floor: 2,
    sizeSqM: 24,
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Comfortable Standard room accommodating up to 3 pax.',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Smart TV', 'Hot Shower'],
    houseRules: ['No smoking', 'Quiet hours after 10 PM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 900, 2: 900, 3: 1200 },
        friSun: { 1: 1000, 2: 1000, 3: 1300 }
      }
    }
  },
  {
    id: 'room-9',
    name: 'Room 9 - Standard room',
    roomNumber: '9',
    category: 'Studio Rooms',
    capacity: 3,
    bedsCount: 1,
    bathsCount: 1,
    rating: 4.91,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 900,
    pricePerHour: 150,
    status: 'Available',
    isClean: true,
    floor: 1,
    sizeSqM: 24,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Comfortable Standard room accommodating up to 3 pax.',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Smart TV', 'Hot Shower'],
    houseRules: ['No smoking', 'Quiet hours after 10 PM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 900, 2: 900, 3: 1200 },
        friSun: { 1: 1000, 2: 1000, 3: 1300 }
      }
    }
  },
  {
    id: 'room-10',
    name: 'Room 10 - Standard room',
    roomNumber: '10',
    category: 'Studio Rooms',
    capacity: 3,
    bedsCount: 1,
    bathsCount: 1,
    rating: 4.93,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 900,
    pricePerHour: 150,
    status: 'Available',
    isClean: true,
    floor: 3,
    sizeSqM: 24,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Comfortable Standard room accommodating up to 3 pax.',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Smart TV', 'Hot Shower'],
    houseRules: ['No smoking', 'Supervise children on stairs'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 900, 2: 900, 3: 1200 },
        friSun: { 1: 1000, 2: 1000, 3: 1300 }
      }
    }
  },
  {
    id: 'room-11',
    name: 'Room 11 - Standard room',
    roomNumber: '11',
    category: 'Studio Rooms',
    capacity: 3,
    bedsCount: 1,
    bathsCount: 1,
    rating: 4.95,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 900,
    pricePerHour: 150,
    status: 'Available',
    isClean: true,
    floor: 4,
    sizeSqM: 24,
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Comfortable Standard room accommodating up to 3 pax.',
    amenities: ['High-Speed Wi-Fi', 'Panoramic Windows', 'Air Conditioning', 'Smart TV'],
    houseRules: ['No smoking', 'Quiet hours after 10 PM'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 900, 2: 900, 3: 1200 },
        friSun: { 1: 1000, 2: 1000, 3: 1300 }
      }
    }
  },
  {
    id: 'room-12',
    name: 'Room 12 - Big Family Room',
    roomNumber: '12',
    category: 'Family Suites',
    capacity: 8,
    bedsCount: 2,
    bathsCount: 1,
    rating: 4.97,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 2000,
    pricePerHour: 250,
    status: 'Available',
    isClean: true,
    floor: 2,
    sizeSqM: 45,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Spacious Big Family Room accommodating up to 8 pax with comfortable bedding and modern amenities.',
    amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Hot & Cold Shower', 'Mini Refrigerator'],
    houseRules: ['No smoking indoors', 'No parties'],
    cancellationPolicy: 'Free cancellation up to 72 hours before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000, 6: 2400, 7: 2550, 8: 2700 },
        friSun: { 1: 2200, 2: 2200, 3: 2200, 4: 2200, 5: 2200, 6: 2550, 7: 2750, 8: 3000 }
      }
    }
  },
  {
    id: 'room-14',
    name: 'Room 14 - Family Room',
    roomNumber: '14',
    category: 'Family Suites',
    capacity: 5,
    bedsCount: 3,
    bathsCount: 2,
    rating: 4.99,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 1000,
    pricePerHour: 600,
    status: 'Available',
    isClean: true,
    floor: 5,
    sizeSqM: 95,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Our premier presidential suite offering supreme luxury, spacious living hall, private veranda, premium furnishings, and immaculate city views.',
    amenities: ['High-Speed Wi-Fi', 'Private Veranda', 'Living Hall', 'Full Kitchen', '2 Luxury Bathrooms', 'Air Conditioning', '3 Smart TVs'],
    houseRules: ['No smoking inside room', 'Strict adherence to house quiet hours'],
    cancellationPolicy: 'Free cancellation up to 7 days before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 1000, 2: 1000, 3: 1200, 4: 1400, 5: 1500 },
        friSun: { 1: 1200, 2: 1200, 3: 1300, 4: 1600, 5: 1800 }
      }
    }
  },
  {
    id: 'room-15',
    name: 'Room 15 - Family Room',
    roomNumber: '15',
    category: 'Family Suites',
    capacity: 5,
    bedsCount: 3,
    bathsCount: 2,
    rating: 4.98,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 1000,
    pricePerHour: 580,
    status: 'Available',
    isClean: true,
    floor: 5,
    sizeSqM: 90,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Grand governor suite featuring Spanish-era inspired decor, majestic king beds, expansive dining area, and tranquil balcony.',
    amenities: ['High-Speed Wi-Fi', 'Balcony', 'Dining Area', 'Kitchenette', 'Air Conditioning', 'Smart TVs', 'Hot & Cold Shower'],
    houseRules: ['No smoking', 'No unauthorized events'],
    cancellationPolicy: 'Free cancellation up to 7 days before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 1000, 2: 1000, 3: 1200, 4: 1400, 5: 1500 },
        friSun: { 1: 1200, 2: 1200, 3: 1300, 4: 1600, 5: 1800 }
      }
    }
  },
  {
    id: 'room-16',
    name: 'Room 16 - Family Room',
    roomNumber: '16',
    category: 'Family Suites',
    capacity: 5,
    bedsCount: 3,
    bathsCount: 2,
    rating: 5.0,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 1000,
    pricePerHour: 580,
    status: 'Available',
    isClean: true,
    floor: 1,
    sizeSqM: 90,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Spacious and comfortable family suite accommodating up to 5 guests with modern furnishings, serene ambiance, and complete amenities.',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Smart TVs', 'Hot & Cold Shower', 'Mini Refrigerator', 'Living Space'],
    houseRules: ['No smoking inside rooms', 'Quiet hours after 10 PM', 'Registered guests only'],
    cancellationPolicy: 'Free cancellation up to 7 days before check-in.',
    customRates: {
      paxTierRates: {
        monThu: { 1: 1000, 2: 1000, 3: 1200, 4: 1400, 5: 1500 },
        friSun: { 1: 1200, 2: 1200, 3: 1300, 4: 1600, 5: 1800 }
      }
    }
  },
  {
    id: 'room-17',
    name: 'Room 17 - Private Villa',
    roomNumber: '17',
    category: 'Private Villas',
    capacity: 20,
    bedsCount: 6,
    bathsCount: 4,
    rating: 5.0,
    location: 'Diversion Road, Vigan City',
    pricePerNight: 7000,
    pricePerHour: 1500,
    status: 'Available',
    isClean: true,
    floor: 1,
    sizeSqM: 250,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'An ultra-exclusive private villa estate accommodating up to 20 guests featuring 6 luxurious bedrooms, private swimming pool, lush manicured gardens, expansive living pavilion, full commercial kitchen, and dedicated butler service. The ultimate getaway for families, VIP retreats, and milestone celebrations.',
    amenities: ['Private Swimming Pool', 'Exclusive Estate', '6 Bedrooms', '4 Bathrooms', 'Full Kitchen', 'Butler Service', 'High-Speed Wi-Fi', 'Private Parking', 'BBQ Pavilion', 'Smart Home Sound System'],
    houseRules: ['No smoking inside rooms', 'Outdoor music muted after 10 PM', 'Registered guests only'],
    cancellationPolicy: 'Strict: 50% refund up to 14 days before check-in.',
    customRates: {
      paxTierRates: {
        monThu: {
          1: 7000, 2: 7000, 3: 7000, 4: 7000, 5: 7000, 6: 7000, 7: 7000, 8: 7000, 9: 7000, 10: 7000,
          11: 7400, 12: 7800, 13: 8200, 14: 8600, 15: 9000, 16: 9400, 17: 9800, 18: 10200, 19: 10600, 20: 11000
        },
        friSun: {
          1: 8000, 2: 8000, 3: 8000, 4: 8000, 5: 8000, 6: 8000, 7: 8000, 8: 8000, 9: 8000, 10: 8000,
          11: 8500, 12: 9000, 13: 9500, 14: 10000, 15: 10500, 16: 11000, 17: 11500, 18: 12000, 19: 12500, 20: 13000
        }
      }
    }
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-101',
    confirmationCode: 'DV-0126',
    roomId: 'room-1',
    roomName: 'Room 1 - Standard Family Suite',
    roomNumber: '1',
    guestName: 'Alexander Wright',
    guestEmail: 'alex.wright@example.com',
    guestPhone: '+63 917 234 5678',
    checkInDate: '2026-09-22',
    checkOutDate: '2026-09-25',
    numberOfGuests: 4,
    totalAmount: 9656,
    status: 'upcoming',
    specialRequests: 'High floor preferred, late check-in around 8 PM.',
    createdAt: '2026-09-20 14:32',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'res-102',
    confirmationCode: 'DV-0226',
    roomId: 'room-3',
    roomName: 'Room 3 - Heritage Balcony Suite',
    roomNumber: '3',
    guestName: 'Elena Rostova',
    guestEmail: 'elena.rostova@example.com',
    guestPhone: '+63 928 987 6543',
    checkInDate: '2026-09-21',
    checkOutDate: '2026-09-23',
    numberOfGuests: 6,
    totalAmount: 7414,
    status: 'active',
    specialRequests: 'Extra pillows and baby crib please.',
    createdAt: '2026-09-18 09:15',
    paymentMethod: 'GCash / Mobile Money'
  },
  {
    id: 'res-103',
    confirmationCode: 'DV-0326',
    roomId: 'room-0',
    roomName: 'Room 0 - Ground Floor Studio',
    roomNumber: '0',
    guestName: 'Marcus Chen',
    guestEmail: 'm.chen@example.com',
    guestPhone: '+63 919 432 1098',
    checkInDate: '2026-09-15',
    checkOutDate: '2026-09-18',
    numberOfGuests: 2,
    totalAmount: 5290,
    status: 'completed',
    specialRequests: 'None',
    createdAt: '2026-09-12 18:40',
    paymentMethod: 'Credit Card'
  }
];

export const AMENITIES_LIST = [
  'High-Speed Wi-Fi',
  'Smart TV',
  'Air Conditioning',
  'Hot & Cold Shower',
  'Kitchenette',
  'City View',
  'Balcony',
  'Private Terrace',
  'Refrigerator',
  'Coffee Maker'
];
