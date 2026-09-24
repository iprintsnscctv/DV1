import fs from 'fs';
import path from 'path';
import { defaultReservations } from '../../../server/data/seedData';

const DATA_FILE = process.env.DATA_FILE_PATH
  ? path.resolve(process.env.DATA_FILE_PATH)
  : path.resolve(process.cwd(), 'data.json');

function ensureDirExists(filePath) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.error('[DB] Failed to create dir:', e);
  }
}

function getDatabase() {
  try {
    ensureDirExists(DATA_FILE);
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.reservations)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('[Next API] Error reading data.json:', e);
  }

  const initial = {
    rooms: [],
    reservations: defaultReservations,
    reviews: [],
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data) {
  try {
    ensureDirExists(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Next API] Error writing data.json:', e);
  }
}

// GET /api/bookings
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const email = searchParams.get('email');
  const status = searchParams.get('status');

  const db = getDatabase();
  let reservations = db.reservations || [];

  if (code) {
    reservations = reservations.filter(
      (r) => r.confirmationCode.toUpperCase() === code.toUpperCase()
    );
  }
  if (email) {
    reservations = reservations.filter(
      (r) => r.guestEmail.toLowerCase() === email.toLowerCase()
    );
  }
  if (status && status !== 'all') {
    reservations = reservations.filter((r) => r.status === status);
  }

  return Response.json(reservations);
}

// POST /api/bookings
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      roomId,
      roomName,
      roomNumber,
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      specialRequests,
      paymentMethod,
    } = body;

    if (!roomId || !guestName || !guestEmail || !checkInDate || !checkOutDate) {
      return Response.json(
        { error: 'Missing required reservation fields' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const confirmationCode = `VGN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newReservation = {
      id: `res-${Date.now()}`,
      confirmationCode,
      roomId,
      roomName: roomName || 'Transient Room',
      roomNumber: String(roomNumber || '1'),
      guestName,
      guestEmail,
      guestPhone: guestPhone || '',
      checkInDate,
      checkOutDate,
      numberOfGuests: Number(numberOfGuests) || 1,
      totalAmount: Number(totalAmount) || 0,
      status: 'upcoming',
      specialRequests: specialRequests || '',
      paymentMethod: paymentMethod || 'Cash at Desk',
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(db.reservations)) {
      db.reservations = [];
    }

    db.reservations.unshift(newReservation);
    saveDatabase(db);

    return Response.json(newReservation, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to create booking' }, { status: 500 });
  }
}

// PUT /api/bookings
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ error: 'Reservation ID and status are required' }, { status: 400 });
    }

    const db = getDatabase();
    const index = db.reservations.findIndex((r) => r.id === id);
    if (index === -1) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 });
    }

    db.reservations[index].status = status;
    saveDatabase(db);

    return Response.json(db.reservations[index]);
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to update booking' }, { status: 500 });
  }
}

// DELETE /api/bookings
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // no body provided
      }
    }

    if (!id) {
      return Response.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const initialLen = db.reservations.length;
    db.reservations = db.reservations.filter((r) => r.id !== id);

    if (db.reservations.length === initialLen) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 });
    }

    saveDatabase(db);
    return Response.json({ success: true, message: `Reservation ${id} deleted` });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to delete booking' }, { status: 500 });
  }
}
