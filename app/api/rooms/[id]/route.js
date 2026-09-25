import fs from 'fs';
import path from 'path';
import { defaultRooms } from '../../../../server/data/seedData';

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
      if (Array.isArray(parsed.rooms)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('[Next API] Error reading data.json:', e);
  }

  const initial = {
    rooms: defaultRooms,
    reservations: [],
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

// GET /api/rooms/[id]
export async function GET(_request, { params }) {
  const { id } = await params;
  const db = getDatabase();
  const room = db.rooms.find((r) => r.id === id);
  if (!room) {
    return Response.json({ error: 'Room not found' }, { status: 404 });
  }
  return Response.json(room);
}

// PATCH /api/rooms/[id]
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const db = getDatabase();
    const index = db.rooms.findIndex((r) => r.id === id);

    if (index === -1) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    const current = db.rooms[index];
    if (updates.status !== undefined) current.status = updates.status;
    if (updates.isClean !== undefined) current.isClean = Boolean(updates.isClean);
    if (updates.customRates !== undefined) current.customRates = updates.customRates;
    if (updates.pricePerNight !== undefined) current.pricePerNight = Number(updates.pricePerNight);
    if (updates.pricePerHour !== undefined) current.pricePerHour = Number(updates.pricePerHour);
    if (updates.description !== undefined) current.description = updates.description;

    saveDatabase(db);
    return Response.json({ success: true, room: current });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to update room' }, { status: 500 });
  }
}

// PUT /api/rooms/[id]
export async function PUT(request, { params }) {
  return PATCH(request, { params });
}

// DELETE /api/rooms/[id]
export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const initialLen = db.rooms.length;
    db.rooms = db.rooms.filter((r) => r.id !== id);

    if (db.rooms.length === initialLen) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    saveDatabase(db);
    return Response.json({ success: true, message: `Room ${id} deleted` });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to delete room' }, { status: 500 });
  }
}
