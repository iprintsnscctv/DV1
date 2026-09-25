import { Router, Request, Response } from 'express';
import { loadData, saveData } from '../db';
import { Room } from '../types';

const router = Router();

// GET /api/rooms - Retrieve all rooms
router.get('/', (_req: Request, res: Response) => {
  const data = loadData();
  res.json(data.rooms);
});

// GET /api/rooms/:id - Retrieve a specific room
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = loadData();
  const room = data.rooms.find((r) => r.id === id);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }
  res.json(room);
});

// POST /api/rooms - Create a new room
router.post('/', (req: Request, res: Response) => {
  const roomData: Room = req.body;
  if (!roomData.id || !roomData.name || !roomData.roomNumber) {
    res.status(400).json({ error: 'Missing required room fields' });
    return;
  }
  const data = loadData();
  data.rooms.push(roomData);
  saveData(data);
  res.status(201).json({ success: true, room: roomData });
});

// PATCH /api/rooms/:id - Update room status, cleanliness, or details
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, isClean, customRates, pricePerNight, pricePerHour, description } = req.body;
  const data = loadData();
  const roomIndex = data.rooms.findIndex((r) => r.id === id);

  if (roomIndex === -1) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const room = data.rooms[roomIndex];
  if (status !== undefined) room.status = status;
  if (isClean !== undefined) room.isClean = Boolean(isClean);
  if (customRates !== undefined) room.customRates = customRates;
  if (pricePerNight !== undefined) room.pricePerNight = Number(pricePerNight);
  if (pricePerHour !== undefined) room.pricePerHour = Number(pricePerHour);
  if (description !== undefined) room.description = description;

  saveData(data);
  res.json({ success: true, room });
});

export default router;
