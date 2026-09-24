import fs from 'fs';
import path from 'path';

const DATA_FILE = process.env.DATA_FILE_PATH
  ? path.resolve(process.env.DATA_FILE_PATH)
  : path.resolve(process.cwd(), 'data.json');

const defaultReviews = [
  {
    id: 'rev-1',
    roomId: 'room-0',
    guestName: 'Maria Santos',
    rating: 5,
    comment: 'Super clean and spacious! Accommodated our big family comfortably. Just a quick tricycle ride to Calle Crisologo.',
    date: '2026-08-15',
    verified: true,
  },
  {
    id: 'rev-2',
    roomId: 'room-1',
    guestName: 'Carlos Mendoza',
    rating: 5,
    comment: 'The aircon is ice cold, high-speed WiFi works great for remote work, and parking along Diversion Road was very accessible.',
    date: '2026-08-28',
    verified: true,
  },
  {
    id: 'rev-3',
    roomId: 'room-2',
    guestName: 'Jessica Lee',
    rating: 5,
    comment: 'Very accommodating staff and quiet atmosphere at night. The price is unmatched for the amenities provided in Vigan.',
    date: '2026-09-02',
    verified: true,
  },
];

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

function getReviewsDatabase() {
  try {
    ensureDirExists(DATA_FILE);
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.reviews) && parsed.reviews.length > 0) {
        return parsed;
      }
      parsed.reviews = defaultReviews;
      saveDatabase(parsed);
      return parsed;
    }
  } catch (e) {
    console.error('[Next API] Error reading reviews from data.json:', e);
  }

  const initial = {
    rooms: [],
    reservations: [],
    reviews: defaultReviews,
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

// GET /api/reviews
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  const db = getReviewsDatabase();
  let reviews = db.reviews || defaultReviews;

  if (roomId) {
    reviews = reviews.filter((r) => r.roomId === roomId);
  }

  return Response.json(reviews);
}

// POST /api/reviews
export async function POST(request) {
  try {
    const body = await request.json();
    const { guestName, rating, comment, roomId } = body;

    if (!guestName || !rating || !comment) {
      return Response.json(
        { error: 'Missing required review fields: guestName, rating, comment' },
        { status: 400 }
      );
    }

    const db = getReviewsDatabase();
    const newReview = {
      id: `rev-${Date.now()}`,
      roomId: roomId || null,
      guestName,
      rating: Number(rating) || 5,
      comment,
      date: new Date().toISOString().split('T')[0],
      verified: true,
    };

    if (!Array.isArray(db.reviews)) {
      db.reviews = [];
    }

    db.reviews.unshift(newReview);
    saveDatabase(db);

    return Response.json(newReview, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message || 'Failed to submit review' }, { status: 500 });
  }
}
