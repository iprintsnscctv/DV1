// server/prod.ts
import "dotenv/config";
import path3 from "path";
import express2 from "express";

// server/app.ts
import express from "express";
import cors from "cors";
import path2 from "path";

// server/routes/rooms.ts
import { Router } from "express";

// server/db.ts
import fs from "fs";
import path from "path";

// server/data/seedData.ts
var defaultRooms = [
  {
    id: "room-0",
    name: "Room 0 - Big Family Room",
    roomNumber: "0",
    category: "Family Suites",
    capacity: 8,
    bedsCount: 2,
    bathsCount: 1,
    rating: 4.88,
    location: "Diversion Road, Vigan City",
    pricePerNight: 2e3,
    pricePerHour: 220,
    status: "Available",
    isClean: true,
    floor: 1,
    sizeSqM: 45,
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Spacious Big Family Room accommodating up to 8 pax with comfortable bedding and modern amenities.",
    amenities: ["High-Speed Wi-Fi", "Smart TV", "Air Conditioning", "Hot & Cold Shower", "Mini Refrigerator"],
    houseRules: ["No smoking inside room", "Quiet hours from 10 PM to 7 AM"],
    cancellationPolicy: "Free cancellation up to 24 hours before check-in time.",
    customRates: {
      paxTierRates: {
        monThu: { 1: 2e3, 2: 2e3, 3: 2e3, 4: 2e3, 5: 2e3, 6: 2400, 7: 2550, 8: 2700 },
        friSun: { 1: 2200, 2: 2200, 3: 2200, 4: 2200, 5: 2200, 6: 2550, 7: 2750, 8: 3e3 }
      }
    }
  },
  {
    id: "room-1",
    name: "Room 1 - Big Family Room",
    roomNumber: "1",
    category: "Family Suites",
    capacity: 8,
    bedsCount: 2,
    bathsCount: 1,
    rating: 4.92,
    location: "Diversion Road, Vigan City",
    pricePerNight: 2e3,
    pricePerHour: 250,
    status: "Available",
    isClean: true,
    floor: 1,
    sizeSqM: 45,
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Spacious Big Family Room accommodating up to 8 pax with comfortable bedding and modern amenities.",
    amenities: ["High-Speed Wi-Fi", "Smart TV", "Air Conditioning", "Hot & Cold Shower", "Mini Refrigerator"],
    houseRules: ["No smoking inside room", "Quiet hours from 10 PM to 7 AM"],
    cancellationPolicy: "Free cancellation up to 24 hours before check-in time.",
    customRates: {
      paxTierRates: {
        monThu: { 1: 2e3, 2: 2e3, 3: 2e3, 4: 2e3, 5: 2e3, 6: 2400, 7: 2550, 8: 2700 },
        friSun: { 1: 2200, 2: 2200, 3: 2200, 4: 2200, 5: 2200, 6: 2550, 7: 2750, 8: 3e3 }
      }
    }
  },
  {
    id: "room-2",
    name: "Room 2 - Big Family Room",
    roomNumber: "2",
    category: "Family Suites",
    capacity: 8,
    bedsCount: 2,
    bathsCount: 1,
    rating: 4.85,
    location: "Diversion Road, Vigan City",
    pricePerNight: 2e3,
    pricePerHour: 250,
    status: "Booked",
    isClean: false,
    floor: 1,
    sizeSqM: 45,
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Spacious Big Family Room accommodating up to 8 pax with comfortable bedding and modern amenities.",
    amenities: ["High-Speed Wi-Fi", "Smart TV", "Air Conditioning", "Hot & Cold Shower", "Mini Refrigerator"],
    houseRules: ["No smoking inside room", "Quiet hours from 10 PM to 7 AM"],
    cancellationPolicy: "Free cancellation up to 24 hours before check-in time.",
    customRates: {
      paxTierRates: {
        monThu: { 1: 2e3, 2: 2e3, 3: 2e3, 4: 2e3, 5: 2e3, 6: 2400, 7: 2550, 8: 2700 },
        friSun: { 1: 2200, 2: 2200, 3: 2200, 4: 2200, 5: 2200, 6: 2550, 7: 2750, 8: 3e3 }
      }
    }
  },
  {
    id: "room-3",
    name: "Room 3 - Deluxe Transient Room",
    roomNumber: "3",
    category: "Deluxe Rooms",
    capacity: 2,
    bedsCount: 1,
    bathsCount: 1,
    rating: 4.95,
    location: "Diversion Road, Vigan City",
    pricePerNight: 1200,
    pricePerHour: 150,
    status: "Available",
    isClean: true,
    floor: 2,
    sizeSqM: 25,
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Deluxe Room for couples or solo travelers with queen-size bed and modern ensuite bath.",
    amenities: ["High-Speed Wi-Fi", "Smart TV", "Air Conditioning", "Hot & Cold Shower", "Toiletries"],
    houseRules: ["Strictly no smoking", "Quiet hours after 10 PM"],
    cancellationPolicy: "Free cancellation up to 24 hours before check-in.",
    customRates: {
      paxTierRates: {
        monThu: { 1: 1200, 2: 1200 },
        friSun: { 1: 1350, 2: 1350 }
      }
    }
  },
  {
    id: "room-4",
    name: "Room 4 - Standard Transient Room",
    roomNumber: "4",
    category: "Standard Rooms",
    capacity: 4,
    bedsCount: 2,
    bathsCount: 1,
    rating: 4.8,
    location: "Diversion Road, Vigan City",
    pricePerNight: 1400,
    pricePerHour: 180,
    status: "Available",
    isClean: true,
    floor: 2,
    sizeSqM: 30,
    images: [
      "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Comfortable standard transient room accommodating up to 4 pax, perfect for barkadas or small families.",
    amenities: ["High-Speed Wi-Fi", "Air Conditioning", "Hot Shower", "Toiletries", "Luggage Space"],
    houseRules: ["No smoking inside", "Quiet hours after 10 PM"],
    cancellationPolicy: "Free cancellation up to 24 hours before check-in."
  },
  {
    id: "room-5",
    name: "Room 5 - Standard Transient Room",
    roomNumber: "5",
    category: "Standard Rooms",
    capacity: 4,
    bedsCount: 2,
    bathsCount: 1,
    rating: 4.82,
    location: "Diversion Road, Vigan City",
    pricePerNight: 1400,
    pricePerHour: 180,
    status: "Reserved",
    isClean: true,
    floor: 2,
    sizeSqM: 30,
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Comfortable standard transient room accommodating up to 4 pax with two double beds.",
    amenities: ["High-Speed Wi-Fi", "Air Conditioning", "Hot Shower", "Toiletries"],
    houseRules: ["No smoking inside", "Quiet hours after 10 PM"],
    cancellationPolicy: "Free cancellation up to 24 hours before check-in."
  },
  {
    id: "room-6",
    name: "Room 6 - Budget Transient Room",
    roomNumber: "6",
    category: "Standard Rooms",
    capacity: 2,
    bedsCount: 1,
    bathsCount: 1,
    rating: 4.75,
    location: "Diversion Road, Vigan City",
    pricePerNight: 950,
    pricePerHour: 120,
    status: "Available",
    isClean: true,
    floor: 2,
    sizeSqM: 20,
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Budget-friendly transient room for solo travelers or couples visiting historic Vigan.",
    amenities: ["High-Speed Wi-Fi", "Air Conditioning", "Shower", "Toiletries"],
    houseRules: ["Strictly no smoking", "Quiet hours after 10 PM"],
    cancellationPolicy: "Free cancellation up to 12 hours before check-in."
  }
];
var defaultReservations = [
  {
    id: "res-101",
    confirmationCode: "DIV-8921-XQ",
    roomId: "room-2",
    roomName: "Room 2 - Big Family Room",
    roomNumber: "2",
    guestName: "Alexander Wright",
    guestEmail: "alex.wright@example.com",
    guestPhone: "+63 917 123 4567",
    checkInDate: "2026-09-24",
    checkOutDate: "2026-09-26",
    numberOfGuests: 6,
    totalAmount: 5100,
    status: "upcoming",
    specialRequests: "Ground floor room preferred, late arrival around 7 PM.",
    createdAt: "2026-09-20 14:32",
    paymentMethod: "GCash / Online Transfer"
  },
  {
    id: "res-102",
    confirmationCode: "DIV-5412-MK",
    roomId: "room-5",
    roomName: "Room 5 - Standard Transient Room",
    roomNumber: "5",
    guestName: "Elena Rostova",
    guestEmail: "elena.rostova@example.com",
    guestPhone: "+63 920 987 6543",
    checkInDate: "2026-09-23",
    checkOutDate: "2026-09-25",
    numberOfGuests: 4,
    totalAmount: 2800,
    status: "active",
    specialRequests: "Extra blankets and electric kettle requested.",
    createdAt: "2026-09-18 09:15",
    paymentMethod: "Cash on Arrival"
  }
];

// server/db.ts
var DATA_FILE = process.env.DATA_FILE_PATH ? path.resolve(process.env.DATA_FILE_PATH) : path.resolve(process.cwd(), "data.json");
function ensureDirExists(filePath) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.error("[DB] Failed to create directory for data file:", e);
  }
}
function loadData() {
  try {
    ensureDirExists(DATA_FILE);
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data.rooms) && Array.isArray(data.reservations)) {
        return data;
      }
    }
  } catch (e) {
    console.error("[DB] Error reading data.json, initializing from seed data:", e);
  }
  const initial = {
    rooms: defaultRooms,
    reservations: defaultReservations
  };
  saveData(initial);
  return initial;
}
function saveData(data) {
  try {
    ensureDirExists(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("[DB] Error writing data.json:", e);
  }
}

// server/routes/rooms.ts
var router = Router();
router.get("/", (_req, res) => {
  const data = loadData();
  res.json(data.rooms);
});
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const data = loadData();
  const room = data.rooms.find((r) => r.id === id);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  res.json(room);
});
router.post("/", (req, res) => {
  const roomData = req.body;
  if (!roomData.id || !roomData.name || !roomData.roomNumber) {
    res.status(400).json({ error: "Missing required room fields" });
    return;
  }
  const data = loadData();
  data.rooms.push(roomData);
  saveData(data);
  res.status(201).json({ success: true, room: roomData });
});
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { status, isClean, customRates, pricePerNight, pricePerHour, description } = req.body;
  const data = loadData();
  const roomIndex = data.rooms.findIndex((r) => r.id === id);
  if (roomIndex === -1) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  const room = data.rooms[roomIndex];
  if (status !== void 0) room.status = status;
  if (isClean !== void 0) room.isClean = Boolean(isClean);
  if (customRates !== void 0) room.customRates = customRates;
  if (pricePerNight !== void 0) room.pricePerNight = Number(pricePerNight);
  if (pricePerHour !== void 0) room.pricePerHour = Number(pricePerHour);
  if (description !== void 0) room.description = description;
  saveData(data);
  res.json({ success: true, room });
});
var rooms_default = router;

// server/routes/reservations.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/", (_req, res) => {
  const data = loadData();
  res.json(data.reservations);
});
router2.post("/", (req, res) => {
  const newRes = req.body;
  if (!newRes.id || !newRes.roomId || !newRes.guestName) {
    res.status(400).json({ error: "Missing required reservation fields" });
    return;
  }
  const data = loadData();
  data.reservations.unshift(newRes);
  const room = data.rooms.find((r) => r.id === newRes.roomId);
  if (room && room.status === "Available") {
    room.status = "Reserved";
  }
  saveData(data);
  res.status(201).json({ success: true, reservation: newRes });
});
router2.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const data = loadData();
  const resItem = data.reservations.find((r) => r.id === id);
  if (!resItem) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }
  resItem.status = status;
  if (status === "completed" || status === "cancelled") {
    const room = data.rooms.find((r) => r.id === resItem.roomId);
    if (room && room.status !== "Maintenance") {
      room.status = "Available";
    }
  } else if (status === "active") {
    const room = data.rooms.find((r) => r.id === resItem.roomId);
    if (room) {
      room.status = "Booked";
    }
  }
  saveData(data);
  res.json({ success: true, id, status, reservation: resItem });
});
var reservations_default = router2;

// server/routes/settings.ts
import { Router as Router3 } from "express";

// server/config/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseClient = null;
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://xdggjrorpafpwsnixlww.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_nApChRkKMTd2y2DMV-0fng_n0PrjENb";
  if (!url || !key) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.error("[Supabase] Failed to initialize client:", e);
      return null;
    }
  }
  return supabaseClient;
}
function isSupabaseConfigured() {
  return getSupabaseClient() !== null;
}
function getSupabaseStatus() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xdggjrorpafpwsnixlww.supabase.co";
  const hasAnonKey = Boolean(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_nApChRkKMTd2y2DMV-0fng_n0PrjENb");
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return {
    configured: isSupabaseConfigured(),
    url: url ? url.replace(/^(https?:\/\/)([^.]+)(.*)$/, "$1$2$3") : null,
    hasAnonKey,
    hasServiceKey
  };
}
async function testSupabaseConnection() {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: "Supabase credentials are not set. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment variables."
    };
  }
  try {
    const { error: roomsError } = await client.from("rooms").select("id").limit(1);
    if (roomsError) {
      if (roomsError.code === "42P01" || roomsError.code === "PGRST205" || roomsError.message?.includes('relation "rooms" does not exist') || roomsError.message?.includes("Could not find the table")) {
        return {
          success: true,
          message: 'Connected to Supabase project successfully! Note: The "rooms" table is not created yet. Copy and run the SQL schema script below in your Supabase SQL Editor.',
          details: { tablesReady: false }
        };
      }
      return {
        success: false,
        message: `Supabase error: ${roomsError.message}`,
        details: roomsError
      };
    }
    return {
      success: true,
      message: "Connected to Supabase! Tables are reachable and operational.",
      details: { tablesReady: true }
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to connect to Supabase: ${err.message || String(err)}`
    };
  }
}
async function syncLocalDataToSupabase(data) {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: "Supabase is not configured in environment variables." };
  }
  try {
    const formattedRooms = data.rooms.map((r) => ({
      id: r.id,
      name: r.name,
      room_number: r.roomNumber,
      category: r.category,
      capacity: r.capacity,
      beds_count: r.bedsCount || 1,
      baths_count: r.bathsCount || 1,
      rating: r.rating || 5,
      location: r.location || "Vigan City",
      price_per_night: r.pricePerNight,
      price_per_hour: r.pricePerHour,
      status: r.status,
      is_clean: r.isClean,
      floor: r.floor,
      size_sq_m: r.sizeSqM,
      images: r.images,
      description: r.description,
      amenities: r.amenities,
      house_rules: r.houseRules,
      cancellation_policy: r.cancellationPolicy,
      custom_rates: r.customRates || null,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }));
    const { error: roomErr } = await client.from("rooms").upsert(formattedRooms, { onConflict: "id" });
    if (roomErr) {
      throw new Error(`Failed to sync rooms to Supabase: ${roomErr.message}`);
    }
    const formattedReservations = data.reservations.map((res) => ({
      id: res.id,
      confirmation_code: res.confirmationCode,
      room_id: res.roomId,
      room_name: res.roomName,
      room_number: res.roomNumber,
      guest_name: res.guestName,
      guest_email: res.guestEmail,
      guest_phone: res.guestPhone,
      check_in_date: res.checkInDate,
      check_out_date: res.checkOutDate,
      number_of_guests: res.numberOfGuests,
      total_amount: res.totalAmount,
      status: res.status,
      special_requests: res.specialRequests || "",
      payment_method: res.paymentMethod,
      created_at: res.createdAt
    }));
    const { error: resErr } = await client.from("reservations").upsert(formattedReservations, { onConflict: "id" });
    if (resErr) {
      throw new Error(`Failed to sync reservations to Supabase: ${resErr.message}`);
    }
    return {
      success: true,
      message: `Successfully synced ${formattedRooms.length} rooms and ${formattedReservations.length} reservations to Supabase!`,
      syncedRooms: formattedRooms.length,
      syncedReservations: formattedReservations.length
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Error occurred while syncing with Supabase."
    };
  }
}
function getSupabaseSchemaSql() {
  return `-- ========================================================
-- Diversion Transient Vigan - Supabase PostgreSQL Schema
-- Run this in your Supabase Project -> SQL Editor
-- ========================================================

-- 1. Create Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  category TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  beds_count INTEGER DEFAULT 1,
  baths_count INTEGER DEFAULT 1,
  rating NUMERIC DEFAULT 5.0,
  location TEXT DEFAULT 'Diversion Road, Vigan City',
  price_per_night NUMERIC NOT NULL,
  price_per_hour NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  is_clean BOOLEAN DEFAULT true,
  floor INTEGER DEFAULT 1,
  size_sq_m NUMERIC DEFAULT 25,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  house_rules JSONB DEFAULT '[]'::jsonb,
  cancellation_policy TEXT,
  custom_rates JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Reservations Table
CREATE TABLE IF NOT EXISTS public.reservations (
  id TEXT PRIMARY KEY,
  confirmation_code TEXT UNIQUE NOT NULL,
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  special_requests TEXT DEFAULT '',
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Public Access (Read rooms, create bookings)
CREATE POLICY "Public can view rooms"
  ON public.rooms FOR SELECT
  USING (true);

CREATE POLICY "Public can view reservations by confirmation or email"
  ON public.reservations FOR SELECT
  USING (true);

CREATE POLICY "Public can create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update room status via API"
  ON public.rooms FOR ALL
  USING (true);

CREATE POLICY "Public can update reservation status"
  ON public.reservations FOR UPDATE
  USING (true);
`;
}

// server/routes/settings.ts
var router3 = Router3();
router3.get("/supabase", (_req, res) => {
  const status = getSupabaseStatus();
  res.json(status);
});
router3.post("/supabase/test", async (_req, res) => {
  const result = await testSupabaseConnection();
  res.json(result);
});
router3.post("/supabase/sync", async (_req, res) => {
  const data = loadData();
  const result = await syncLocalDataToSupabase(data);
  res.json(result);
});
router3.get("/supabase/schema", (_req, res) => {
  const sql = getSupabaseSchemaSql();
  res.json({ sql });
});
var settings_default = router3;

// server/app.ts
function createApp() {
  const app2 = express();
  app2.use(cors());
  app2.use(express.json());
  const publicDir = path2.join(process.cwd(), "public");
  app2.use(express.static(publicDir));
  app2.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "diversion-vigan-api", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.use("/api/rooms", rooms_default);
  app2.use("/api/reservations", reservations_default);
  app2.use("/api/bookings", reservations_default);
  app2.use("/api/settings", settings_default);
  return app2;
}

// server/prod.ts
var PORT = Number(process.env.PORT) || 3e3;
var app = createApp();
var distPath = path3.join(process.cwd(), "dist");
app.use(express2.static(distPath));
app.get("*all", (_req, res) => {
  res.sendFile(path3.join(distPath, "index.html"));
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Diversion Vigan] Production Full-stack Server listening on http://0.0.0.0:${PORT}`);
});
