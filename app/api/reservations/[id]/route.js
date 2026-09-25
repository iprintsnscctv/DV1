import fs from 'fs';
import path from 'path';
import { defaultReservations } from '../../../../server/data/seedData';

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

// GET /api/reservations/[id]
export async function GET(_request, { params }) {
  const { id } = await params;
  const db = getDatabase();
  const resItem = db.reservations.find((r) => r.id === id);
  if (!resItem) {
    return Response.json({ error: 'Reservation not found' }, { status: 404 });
  }
  return Response.json(resItem);
}

// PATCH /api/reservations/[id]
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const db = getDatabase();
    const resItem = db.reservations.find((r) => r.id === id);

    if (!resItem) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (status !== undefined) {
      resItem.status = status;
    }

    // Release room back to Available if completed or cancelled
    if (Array.isArray(db.rooms)) {
      if (status === 'completed' || status === 'cancelled') {
        const room = db.rooms.find((r) => r.id === resItem.roomId);
        if (room && room.status !== 'Maintenance') {
          room.status = 'Available';
        }
      } else if (status === 'active') {
        const room = db.rooms.find((r) => r.id === resItem.roomId);
        if (room) {
          room.status = 'Booked';
        }
      }
    }

    saveDatabase(db);
    return Response.json({ success: true, id, status, reservation: resItem });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to update reservation' }, { status: 500 });
  }
}

// PUT /api/reservations/[id]
export async function PUT(request, { params }) {
  return PATCH(request, { params });
}

// DELETE /api/reservations/[id]
export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const initialLen = db.reservations.length;
    db.reservations = db.reservations.filter((r) => r.id !== id);

    if (db.reservations.length === initialLen) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 });
    }

    saveDatabase(db);
    return Response.json({ success: true, message: `Reservation ${id} deleted` });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to delete reservation' }, { status: 500 });
  }
}
