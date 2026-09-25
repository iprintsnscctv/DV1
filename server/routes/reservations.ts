import { Router, Request, Response } from 'express';
import { loadData, saveData } from '../db';
import { Reservation } from '../types';

const router = Router();

// GET /api/reservations - Retrieve all reservations
router.get('/', (_req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const data = loadData();
    return res.json(data.reservations);
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to retrieve reservations' });
  }
});

// GET /api/reservations/:id - Retrieve specific reservation
router.get('/:id', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const { id } = req.params;
    const data = loadData();
    const resItem = data.reservations.find((r) => r.id === id);
    if (!resItem) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    return res.json(resItem);
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to retrieve reservation' });
  }
});

// POST /api/reservations - Create a new booking
router.post('/', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const newRes: Reservation = req.body;
    if (!newRes || !newRes.id || !newRes.roomId || !newRes.guestName) {
      return res.status(400).json({ error: 'Missing required reservation fields' });
    }

    const data = loadData();
    data.reservations.unshift(newRes);

    // Sync room status to Reserved or Booked
    const room = data.rooms.find((r) => r.id === newRes.roomId);
    if (room && room.status === 'Available') {
      room.status = 'Reserved';
    }

    saveData(data);
    return res.status(201).json({ success: true, reservation: newRes });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to create reservation' });
  }
});

// PATCH /api/reservations/:id - Update reservation status (check-in, completed, cancelled)
router.patch('/:id', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const { id } = req.params;
    const { status } = req.body || {};

    const data = loadData();
    const resItem = data.reservations.find((r) => r.id === id);

    if (!resItem) {
      return res.status(404).json({ error: 'Reservation not found' });
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
    return res.json({ success: true, id, status, reservation: resItem });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to update reservation' });
  }
});

// PUT /api/reservations/:id - Full update
router.put('/:id', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const { id } = req.params;
    const updates = req.body || {};
    const data = loadData();
    const index = data.reservations.findIndex((r) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    data.reservations[index] = { ...data.reservations[index], ...updates };
    saveData(data);
    return res.json({ success: true, reservation: data.reservations[index] });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to update reservation' });
  }
});

// DELETE /api/reservations/:id - Cancel/delete reservation
router.delete('/:id', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const { id } = req.params;
    const data = loadData();
    const initialLen = data.reservations.length;
    data.reservations = data.reservations.filter((r) => r.id !== id);

    if (data.reservations.length === initialLen) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    saveData(data);
    return res.json({ success: true, message: `Reservation ${id} deleted` });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to delete reservation' });
  }
});

export default router;
