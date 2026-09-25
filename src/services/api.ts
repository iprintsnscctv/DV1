import { Room, Reservation, Review, SupabaseConfigStatus } from '../types';

export const api = {
  // Rooms
  async getRooms(): Promise<Room[]> {
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Failed to fetch rooms');
      return await res.json();
    } catch (err) {
      console.warn('Using local fallback for rooms:', err);
      return [];
    }
  },

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update room');
    const data = await res.json();
    return data.room;
  },

  async createRoom(room: Room): Promise<Room> {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    if (!res.ok) throw new Error('Failed to create room');
    const data = await res.json();
    return data.room;
  },

  async deleteRoom(id: string): Promise<void> {
    const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete room');
  },

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    try {
      const res = await fetch('/api/reservations');
      if (!res.ok) throw new Error('Failed to fetch reservations');
      return await res.json();
    } catch (err) {
      console.warn('Using local fallback for reservations:', err);
      return [];
    }
  },

  async createReservation(reservation: Reservation): Promise<Reservation> {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservation),
    });
    if (!res.ok) throw new Error('Failed to create reservation');
    const data = await res.json();
    return data.reservation;
  },

  async updateReservationStatus(
    id: string,
    status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  ): Promise<Reservation> {
    const res = await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update reservation');
    const data = await res.json();
    return data.reservation;
  },

  // Supabase Settings
  async getSupabaseStatus(): Promise<SupabaseConfigStatus> {
    try {
      const res = await fetch('/api/settings/supabase');
      if (!res.ok) throw new Error('Failed to fetch Supabase status');
      return await res.json();
    } catch (err) {
      return {
        isConfigured: false,
        supabaseUrl: '',
        hasServiceKey: false,
        hasAnonKey: false,
        clientMode: 'mock',
      };
    }
  },

  async testSupabaseConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await fetch('/api/settings/supabase/test', { method: 'POST' });
    return await res.json();
  },

  async syncToSupabase(): Promise<{ success: boolean; message?: string; error?: string; synced?: any }> {
    const res = await fetch('/api/settings/supabase/sync', { method: 'POST' });
    return await res.json();
  },

  async getSupabaseSchema(): Promise<string> {
    try {
      const res = await fetch('/api/settings/supabase/schema');
      const data = await res.json();
      return data.sql || '';
    } catch {
      return '';
    }
  },
};
