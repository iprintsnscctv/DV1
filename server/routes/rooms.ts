import { Router, Request, Response } from 'express';
import { loadData, saveData } from '../db';
import { Room } from '../types';

const router = Router();

// GET /api/rooms - Retrieve all rooms
router.get('/', (_req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const data = loadData();
    return res.json(data.rooms);
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to retrieve rooms' });
  }
});

// GET /api/rooms/:id - Retrieve a specific room
router.get('/:id', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const { id } = req.params;
    const data = loadData();
    const room = data.rooms.find((r) => r.id === id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    return res.json(room);
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to retrieve room' });
  }
});

// POST /api/rooms - Create a new room
router.post('/', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const roomData: Room = req.body;
    if (!roomData || !roomData.id || !roomData.name || !roomData.roomNumber) {
      return res.status(400).json({ error: 'Missing required room fields' });
    }
    const data = loadData();
    data.rooms.push(roomData);
    saveData(data);
    return res.status(201).json({ success: true, room: roomData });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to create room' });
  }
});

// PATCH /api/rooms/:id - Update room status, cleanliness, or details
router.patch('/:id', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const { id } = req.params;
    const { status, isClean, customRates, pricePerNight, pricePerHour, description } = req.body || {};
    const data = loadData();
    const roomIndex = data.rooms.findIndex((r) => r.id === id);

    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = data.rooms[roomIndex];
    if (status !== undefined) room.status = status;
    if (isClean !== undefined) room.isClean = Boolean(isClean);
    if (customRates !== undefined) room.customRates = customRates;
    if (pricePerNight !== undefined) room.pricePerNight = Number(pricePerNight);
    if (pricePerHour !== undefined) room.pricePerHour = Number(pricePerHour);
    if (description !== undefined) room.description = description;

    saveData(data);
    return res.json({ success: true, room });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to update room' });
  }
});

// PUT /api/rooms/:id - Full update
router.put('/:id', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const { id } = req.params;
    const updates = req.body || {};
    const data = loadData();
    const roomIndex = data.rooms.findIndex((r) => r.id === id);

    if (roomIndex === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }

    data.rooms[roomIndex] = { ...data.rooms[roomIndex], ...updates };
    saveData(data);
    return res.json({ success: true, room: data.rooms[roomIndex] });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to update room' });
  }
});

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', (req: Request, res: Response) => {
  try {
    if (res.headersSent) return;
    const { id } = req.params;
    const data = loadData();
    const initialLen = data.rooms.length;
    data.rooms = data.rooms.filter((r) => r.id !== id);

    if (data.rooms.length === initialLen) {
      return res.status(404).json({ error: 'Room not found' });
    }

    saveData(data);
    return res.json({ success: true, message: `Room ${id} deleted` });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message || 'Failed to delete room' });
  }
});

export default router;
