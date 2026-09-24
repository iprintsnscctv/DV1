import fs from 'fs';
import path from 'path';
import { defaultRooms } from '../../../server/data/seedData';

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

// GET /api/rooms
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');

  const db = getDatabase();
  let rooms = db.rooms || [];

  if (category && category !== 'All') {
    rooms = rooms.filter((r) => r.category === category);
  }
  if (status && status !== 'all') {
    rooms = rooms.filter((r) => r.status === status);
  }

  return Response.json(rooms);
}

// POST /api/rooms
export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.roomNumber || !body.pricePerNight) {
      return Response.json(
        { error: 'Missing required fields: name, roomNumber, pricePerNight' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const newRoom = {
      id: body.id || `room-${Date.now()}`,
      name: body.name,
      roomNumber: String(body.roomNumber),
      category: body.category || 'Standard Room',
      capacity: Number(body.capacity) || 2,
      bedsCount: Number(body.bedsCount) || 1,
      bathsCount: Number(body.bathsCount) || 1,
      rating: Number(body.rating) || 5.0,
      location: body.location || 'Diversion Road, Vigan City',
      pricePerNight: Number(body.pricePerNight),
      pricePerHour: Number(body.pricePerHour) || Math.round(Number(body.pricePerNight) / 10),
      status: body.status || 'Available',
      isClean: body.isClean !== undefined ? body.isClean : true,
      floor: Number(body.floor) || 1,
      sizeSqM: Number(body.sizeSqM) || 25,
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
      ],
      description: body.description || '',
      amenities: Array.isArray(body.amenities) ? body.amenities : ['High-Speed Wi-Fi', 'Air Conditioning'],
      houseRules: Array.isArray(body.houseRules) ? body.houseRules : ['No smoking inside room'],
      cancellationPolicy: body.cancellationPolicy || 'Free cancellation up to 24 hours before check-in time.',
      customRates: body.customRates || undefined,
    };

    db.rooms.push(newRoom);
    saveDatabase(db);

    return Response.json(newRoom, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to create room' }, { status: 500 });
  }
}

// PUT /api/rooms
export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return Response.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const index = db.rooms.findIndex((r) => r.id === body.id);
    if (index === -1) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    db.rooms[index] = { ...db.rooms[index], ...body };
    saveDatabase(db);

    return Response.json(db.rooms[index]);
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to update room' }, { status: 500 });
  }
}

// DELETE /api/rooms
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
      return Response.json({ error: 'Room ID is required' }, { status: 400 });
    }

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
