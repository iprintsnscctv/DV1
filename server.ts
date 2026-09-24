import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DATA_FILE = path.resolve(process.cwd(), "data.json");

interface Room {
  id: string;
  name: string;
  roomNumber: string;
  category: string;
  capacity: number;
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
}

interface Reservation {
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
  status: string;
  specialRequests: string;
  createdAt: string;
  paymentMethod: string;
}

interface DBData {
  rooms: Room[];
  reservations: Reservation[];
}

const defaultRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Sunset Deluxe Transient Suite',
    roomNumber: '101',
    category: 'Deluxe Suite',
    capacity: 2,
    pricePerNight: 85,
    pricePerHour: 15,
    status: 'Available',
    isClean: true,
    floor: 1,
    sizeSqM: 32,
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A serene sanctuary featuring modern minimalist aesthetics, plush queen bed, high-speed fiber Wi-Fi, smart TV, and rainfall shower.',
    amenities: ['High-Speed Wi-Fi', 'Smart TV', 'Air Conditioning', 'Hot & Cold Shower', 'Mini Refrigerator', 'Coffee Maker'],
    houseRules: ['No smoking inside room', 'Quiet hours from 10 PM to 7 AM', 'No unregistered visitors after midnight'],
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in time.'
  },
  {
    id: 'room-2',
    name: 'Executive Skyline Loft',
    roomNumber: '204',
    category: 'Executive Loft',
    capacity: 4,
    pricePerNight: 140,
    pricePerHour: 25,
    status: 'Booked',
    isClean: false,
    floor: 2,
    sizeSqM: 48,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Spacious loft with panoramic city views, soaring ceilings, king-size bed plus sofa sleeper, fully equipped kitchenette, and dedicated workstation.',
    amenities: ['High-Speed Wi-Fi', 'Kitchenette', 'City View', 'Air Conditioning', 'Smart TV', 'Washing Machine'],
    houseRules: ['No smoking', 'No parties or large gatherings'],
    cancellationPolicy: 'Strict: 50% refund up to 48 hours before check-in.'
  },
  {
    id: 'room-3',
    name: 'Cozy Standard Transient Pod',
    roomNumber: '102',
    category: 'Standard Transient',
    capacity: 2,
    pricePerNight: 55,
    pricePerHour: 10,
    status: 'Available',
    isClean: true,
    floor: 1,
    sizeSqM: 22,
    images: [
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'An efficient, comfortable, and budget-friendly space designed for travelers on the go. Includes double bed, en-suite bathroom, and lightning-fast Wi-Fi.',
    amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Hot Shower', 'Toiletries', 'Luggage Rack'],
    houseRules: ['Strictly no smoking', 'Quiet hours after 9 PM'],
    cancellationPolicy: 'Free cancellation up to 12 hours before check-in.'
  },
  {
    id: 'room-4',
    name: 'Grand Family Villa Room',
    roomNumber: '301',
    category: 'Family Villa',
    capacity: 6,
    pricePerNight: 210,
    pricePerHour: 35,
    status: 'Reserved',
    isClean: true,
    floor: 3,
    sizeSqM: 75,
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Perfect for families or groups. Features two queen bedrooms, a spacious living lounge, dining nook, microwave, refrigerator, and 2 bathrooms.',
    amenities: ['High-Speed Wi-Fi', 'Two Bathrooms', 'Living Lounge', 'Refrigerator', 'Microwave', 'Air Conditioning'],
    houseRules: ['No smoking indoors', 'Maximum 6 guests strictly enforced'],
    cancellationPolicy: 'Free cancellation up to 7 days before check-in.'
  }
];

const defaultReservations: Reservation[] = [
  {
    id: 'res-101',
    confirmationCode: 'DIV-8921-XQ',
    roomId: 'room-2',
    roomName: 'Executive Skyline Loft',
    roomNumber: '204',
    guestName: 'Alexander Wright',
    guestEmail: 'alex.wright@example.com',
    guestPhone: '+1 (555) 234-5678',
    checkInDate: '2026-09-22',
    checkOutDate: '2026-09-25',
    numberOfGuests: 2,
    totalAmount: 462,
    status: 'upcoming',
    specialRequests: 'High floor preferred, late check-in around 8 PM.',
    createdAt: '2026-09-20 14:32',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'res-102',
    confirmationCode: 'DIV-5412-MK',
    roomId: 'room-4',
    roomName: 'Grand Family Villa Room',
    roomNumber: '301',
    guestName: 'Elena Rostova',
    guestEmail: 'elena.rostova@example.com',
    guestPhone: '+1 (555) 987-6543',
    checkInDate: '2026-09-21',
    checkOutDate: '2026-09-23',
    numberOfGuests: 5,
    totalAmount: 483,
    status: 'active',
    specialRequests: 'Extra pillows and baby crib please.',
    createdAt: '2026-09-18 09:15',
    paymentMethod: 'GCash / Mobile Money'
  }
];

function loadData(): DBData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data.rooms && data.reservations) {
        return data;
      }
    }
  } catch (e) {
    console.error("Error reading data.json, falling back to defaults", e);
  }
  const initial = { rooms: defaultRooms, reservations: defaultReservations };
  saveData(initial);
  return initial;
}

function saveData(data: DBData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing data.json", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/rooms", (req, res) => {
    const data = loadData();
    res.json(data.rooms);
  });

  app.patch("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    const { status, isClean } = req.body;
    const data = loadData();
    const room = data.rooms.find((r) => r.id === id);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (status !== undefined) room.status = status;
    if (isClean !== undefined) room.isClean = Boolean(isClean);
    saveData(data);
    res.json({ success: true, updatedID: id, room });
  });

  app.get("/api/reservations", (req, res) => {
    const data = loadData();
    res.json(data.reservations);
  });

  app.post("/api/reservations", (req, res) => {
    const newRes: Reservation = req.body;
    const data = loadData();
    data.reservations.unshift(newRes);
    // Update room status
    const room = data.rooms.find((r) => r.id === newRes.roomId);
    if (room) {
      room.status = 'Reserved';
    }
    saveData(data);
    res.json({ success: true, id: newRes.id });
  });

  app.patch("/api/reservations/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const data = loadData();
    const resItem = data.reservations.find((r) => r.id === id);
    if (!resItem) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    resItem.status = status;
    if (status === 'completed' || status === 'cancelled') {
      const room = data.rooms.find((r) => r.id === resItem.roomId);
      if (room) {
        room.status = 'Available';
      }
    }
    saveData(data);
    res.json({ success: true, id, status });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Diversion Transient Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
