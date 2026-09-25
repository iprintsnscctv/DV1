import { Router, Request, Response } from 'express';
import { loadData, saveData } from '../db';
import { Reservation } from '../types';

const router = Router();

// GET /api/reservations - Retrieve all reservations
router.get('/', (_req: Request, res: Response) => {
  const data = loadData();
  res.json(data.reservations);
});

// POST /api/reservations - Create a new booking
router.post('/', (req: Request, res: Response) => {
  const newRes: Reservation = req.body;
  if (!newRes.id || !newRes.roomId || !newRes.guestName) {
    res.status(400).json({ error: 'Missing required reservation fields' });
    return;
  }

  const data = loadData();
  data.reservations.unshift(newRes);

  // Sync room status to Reserved or Booked
  const room = data.rooms.find((r) => r.id === newRes.roomId);
  if (room && room.status === 'Available') {
    room.status = 'Reserved';
  }

  saveData(data);
  res.status(201).json({ success: true, reservation: newRes });
});

// PATCH /api/reservations/:id - Update reservation status (check-in, completed, cancelled)
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const data = loadData();
  const resItem = data.reservations.find((r) => r.id === id);

  if (!resItem) {
    res.status(404).json({ error: 'Reservation not found' });
    return;
  }

  resItem.status = status;

  // Release room back to Available if completed or cancelled
  if (status === 'completed' || status === 'cancelled') {
    const room = data.rooms.find((r) => r.id === resItem.roomId);
    if (room && room.status !== 'Maintenance') {
      room.status = 'Available';
    }
  } else if (status === 'active') {
    const room = data.rooms.find((r) => r.id === resItem.roomId);
    if (room) {
      room.status = 'Booked';
    }
  }

  saveData(data);
  res.json({ success: true, id, status, reservation: resItem });
});

export default router;
