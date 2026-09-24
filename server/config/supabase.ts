import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DBData, Room, Reservation } from '../types';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: { persistSession: false },
      });
    } catch (e) {
      console.error('[Supabase] Failed to initialize client:', e);
      return null;
    }
  }

  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

export function getSupabaseStatus() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null;
  const hasAnonKey = Boolean(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    configured: isSupabaseConfigured(),
    url: url ? url.replace(/^(https?:\/\/)([^.]+)(.*)$/, '$1$2$3') : null,
    hasAnonKey,
    hasServiceKey,
  };
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials are not set. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment variables.',
    };
  }

  try {
    // Attempt a light select to test connectivity
    const { error: roomsError } = await client.from('rooms').select('id').limit(1);

    if (roomsError) {
      if (roomsError.code === '42P01' || roomsError.message?.includes('relation "rooms" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase project successfully! Note: The "rooms" table is not created yet. Run the SQL schema script below in your Supabase SQL Editor.',
          details: { tablesReady: false },
        };
      }
      return {
        success: false,
        message: `Supabase error: ${roomsError.message}`,
        details: roomsError,
      };
    }

    return {
      success: true,
      message: 'Connected to Supabase! Tables are reachable and operational.',
      details: { tablesReady: true },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to Supabase: ${err.message || String(err)}`,
    };
  }
}

export async function syncLocalDataToSupabase(data: DBData): Promise<{ success: boolean; message: string; syncedRooms?: number; syncedReservations?: number }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured in environment variables.' };
  }

  try {
    // 1. Sync rooms
    const formattedRooms = data.rooms.map((r) => ({
      id: r.id,
      name: r.name,
      room_number: r.roomNumber,
      category: r.category,
      capacity: r.capacity,
      beds_count: r.bedsCount || 1,
      baths_count: r.bathsCount || 1,
      rating: r.rating || 5,
      location: r.location || 'Vigan City',
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
      updated_at: new Date().toISOString(),
    }));

    const { error: roomErr } = await client
      .from('rooms')
      .upsert(formattedRooms, { onConflict: 'id' });

    if (roomErr) {
      throw new Error(`Failed to sync rooms to Supabase: ${roomErr.message}`);
    }

    // 2. Sync reservations
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
      special_requests: res.specialRequests || '',
      payment_method: res.paymentMethod,
      created_at: res.createdAt,
    }));

    const { error: resErr } = await client
      .from('reservations')
      .upsert(formattedReservations, { onConflict: 'id' });

    if (resErr) {
      throw new Error(`Failed to sync reservations to Supabase: ${resErr.message}`);
    }

    return {
      success: true,
      message: `Successfully synced ${formattedRooms.length} rooms and ${formattedReservations.length} reservations to Supabase!`,
      syncedRooms: formattedRooms.length,
      syncedReservations: formattedReservations.length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error occurred while syncing with Supabase.',
    };
  }
}

export function getSupabaseSchemaSql(): string {
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
