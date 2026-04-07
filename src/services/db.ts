import { openDB, IDBPDatabase } from 'idb';
import { Child, Sighting } from '../models/types';

const DB_NAME = 'spot-and-earn-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create children store
      if (!db.objectStoreNames.contains('children')) {
        db.createObjectStore('children', { keyPath: 'id' });
      }

      // Create sightings store with indexes
      if (!db.objectStoreNames.contains('sightings')) {
        const sightingsStore = db.createObjectStore('sightings', { keyPath: 'id' });
        sightingsStore.createIndex('by-timestamp', 'timestamp');
        sightingsStore.createIndex('by-paid', 'paid');
      }
    },
  });

  return dbInstance;
}

// Children operations
export async function getAllChildren(): Promise<Child[]> {
  const db = await getDB();
  return db.getAll('children');
}

export async function saveChild(child: Child): Promise<void> {
  const db = await getDB();
  await db.put('children', child);
}

export async function deleteChild(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('children', id);
}

export async function saveChildren(children: Child[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('children', 'readwrite');
  await Promise.all([
    ...children.map(child => tx.store.put(child)),
    tx.done,
  ]);
}

// Sightings operations
export async function getAllSightings(): Promise<Sighting[]> {
  const db = await getDB();
  return db.getAll('sightings');
}

export async function saveSighting(sighting: Sighting): Promise<void> {
  const db = await getDB();
  await db.put('sightings', sighting);
}

export async function deleteSighting(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('sightings', id);
}

export async function saveSightings(sightings: Sighting[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sightings', 'readwrite');
  await Promise.all([
    ...sightings.map(sighting => tx.store.put(sighting)),
    tx.done,
  ]);
}

export async function getSightingsByTimestamp(): Promise<Sighting[]> {
  const db = await getDB();
  const index = db.transaction('sightings').store.index('by-timestamp');
  return index.getAll();
}

// Initialize database with default children
export async function initializeDefaultData(): Promise<void> {
  const db = await getDB();
  const existingChildren = await db.getAll('children');

  if (existingChildren.length === 0) {
    const defaultChildren: Child[] = [
      { id: crypto.randomUUID(), name: 'Luc', active: true },
      { id: crypto.randomUUID(), name: 'Finn', active: true },
      { id: crypto.randomUUID(), name: 'Sarah', active: false },
    ];

    await saveChildren(defaultChildren);
  }
}
