import fs from 'fs';
import path from 'path';
import { DBData } from './types';
import { defaultRooms, defaultReservations } from './data/seedData';

const DATA_FILE = process.env.DATA_FILE_PATH
  ? path.resolve(process.env.DATA_FILE_PATH)
  : path.resolve(process.cwd(), 'data.json');

function ensureDirExists(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.error('[DB] Failed to create directory for data file:', e);
  }
}

export function loadData(): DBData {
  try {
    ensureDirExists(DATA_FILE);
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.rooms) && Array.isArray(data.reservations)) {
        return data as DBData;
      }
    }
  } catch (e) {
    console.error('[DB] Error reading data.json, initializing from seed data:', e);
  }

  const initial: DBData = {
    rooms: defaultRooms,
    reservations: defaultReservations,
  };
  saveData(initial);
  return initial;
}

export function saveData(data: DBData): void {
  try {
    ensureDirExists(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DB] Error writing data.json:', e);
  }
}
