import { Room, Reservation, RoomStatus } from '../types';

const API_BASE = '/api';

export async function fetchRooms(): Promise<Room[]> {
  try {
    const res = await fetch(`${API_BASE}/rooms`);
    if (!res.ok) throw new Error(`Failed to fetch rooms: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[Frontend API] Error loading rooms from backend:', err);
    throw err;
  }
}

export async function fetchReservations(): Promise<Reservation[]> {
  try {
    const res = await fetch(`${API_BASE}/reservations`);
    if (!res.ok) throw new Error(`Failed to fetch reservations: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[Frontend API] Error loading reservations from backend:', err);
    throw err;
  }
}

export async function createReservationOnServer(reservation: Reservation): Promise<{ success: boolean; reservation: Reservation }> {
  const res = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservation),
  });
  if (!res.ok) throw new Error(`Failed to create reservation: ${res.statusText}`);
  return await res.json();
}

export async function updateReservationStatusOnServer(id: string, status: Reservation['status']): Promise<void> {
  const res = await fetch(`${API_BASE}/reservations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update reservation status: ${res.statusText}`);
}

export async function updateRoomOnServer(id: string, updates: {
  status?: RoomStatus;
  isClean?: boolean;
  pricePerNight?: number;
  pricePerHour?: number;
  customRates?: Room['customRates'];
  description?: string;
}): Promise<Room> {
  const res = await fetch(`${API_BASE}/rooms/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update room: ${res.statusText}`);
  const data = await res.json();
  return data.room;
}
