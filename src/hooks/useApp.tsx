import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Child, Sighting, AnimalType, ANIMAL_VALUES } from '../models/types';
import * as db from '../services/db';

interface AppContextType {
  children: Child[];
  sightings: Sighting[];
  loading: boolean;
  addChild: (name: string) => Promise<void>;
  removeChild: (id: string) => Promise<void>;
  updateChild: (child: Child) => Promise<void>;
  toggleChildActive: (id: string) => Promise<void>;
  addSighting: (animal: AnimalType) => Promise<Sighting[]>;
  undoLastSighting: () => Promise<void>;
  markAllAsPaid: () => Promise<void>;
  lastSightingIds: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children: childrenProp }: { children: ReactNode }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSightingIds, setLastSightingIds] = useState<string[]>([]);

  // Load data from IndexedDB on mount
  useEffect(() => {
    async function loadData() {
      try {
        await db.initializeDefaultData();
        const [loadedChildren, loadedSightings] = await Promise.all([
          db.getAllChildren(),
          db.getAllSightings(),
        ]);
        setChildren(loadedChildren);
        setSightings(loadedSightings);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const addChild = async (name: string) => {
    const newChild: Child = {
      id: crypto.randomUUID(),
      name,
      active: false,
    };
    await db.saveChild(newChild);
    setChildren(prev => [...prev, newChild]);
  };

  const removeChild = async (id: string) => {
    await db.deleteChild(id);
    setChildren(prev => prev.filter(c => c.id !== id));
  };

  const updateChild = async (child: Child) => {
    await db.saveChild(child);
    setChildren(prev => prev.map(c => (c.id === child.id ? child : c)));
  };

  const toggleChildActive = async (id: string) => {
    const child = children.find(c => c.id === id);
    if (child) {
      const updated = { ...child, active: !child.active };
      await updateChild(updated);
    }
  };

  const addSighting = async (animal: AnimalType): Promise<Sighting[]> => {
    const activeChildren = children.filter(c => c.active);

    if (activeChildren.length === 0) {
      return [];
    }

    const newSightings: Sighting[] = activeChildren.map(child => ({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      animal,
      value: ANIMAL_VALUES[animal],
      childIds: [child.id],
      childNamesSnapshot: [child.name],
      paid: false,
    }));

    await db.saveSightings(newSightings);
    setSightings(prev => [...prev, ...newSightings]);
    setLastSightingIds(newSightings.map(s => s.id));

    return newSightings;
  };

  const undoLastSighting = async () => {
    if (lastSightingIds.length === 0) return;

    // Delete all sightings from last action
    await Promise.all(lastSightingIds.map(id => db.deleteSighting(id)));
    setSightings(prev => prev.filter(s => !lastSightingIds.includes(s.id)));
    setLastSightingIds([]);
  };

  const markAllAsPaid = async () => {
    const updatedSightings = sightings.map(s => ({ ...s, paid: true }));
    await db.saveSightings(updatedSightings);
    setSightings(updatedSightings);
    setLastSightingIds([]);
  };

  return (
    <AppContext.Provider
      value={{
        children,
        sightings,
        loading,
        addChild,
        removeChild,
        updateChild,
        toggleChildActive,
        addSighting,
        undoLastSighting,
        markAllAsPaid,
        lastSightingIds,
      }}
    >
      {childrenProp}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
