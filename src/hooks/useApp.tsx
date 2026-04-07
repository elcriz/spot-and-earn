import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Child, Sighting, PaymentRecord, AnimalType, ANIMAL_VALUES } from '../models/types';
import * as db from '../services/db';
import { getCurrentLocation } from '../services/geolocation';

interface AppContextType {
  children: Child[];
  sightings: Sighting[];
  paymentRecords: PaymentRecord[];
  loading: boolean;
  addChild: (name: string) => Promise<void>;
  removeChild: (id: string) => Promise<void>;
  updateChild: (child: Child) => Promise<void>;
  toggleChildActive: (id: string) => Promise<void>;
  addSighting: (animal: AnimalType) => Promise<Sighting[]>;
  deleteSighting: (id: string) => Promise<void>;
  undoLastSighting: () => Promise<void>;
  markAllAsPaid: () => Promise<void>;
  lastSightingIds: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children: childrenProp }: { children: ReactNode }) {
  const [children, setChildren] = useState<Child[]>([]);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSightingIds, setLastSightingIds] = useState<string[]>([]);

  // Load data from IndexedDB on mount
  useEffect(() => {
    async function loadData() {
      try {
        await db.initializeDefaultData();
        const [loadedChildren, loadedSightings, loadedPayments] = await Promise.all([
          db.getAllChildren(),
          db.getAllSightings(),
          db.getAllPaymentRecords(),
        ]);
        setChildren(loadedChildren);
        setSightings(loadedSightings);
        setPaymentRecords(loadedPayments);
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

    // Try to get location (non-blocking)
    const location = await getCurrentLocation();

    const newSightings: Sighting[] = activeChildren.map(child => ({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      animal,
      value: ANIMAL_VALUES[animal],
      childIds: [child.id],
      childNamesSnapshot: [child.name],
      paid: false,
      ...(location && { location }), // Only add if available
    }));

    await db.saveSightings(newSightings);
    setSightings(prev => [...prev, ...newSightings]);
    setLastSightingIds(newSightings.map(s => s.id));

    return newSightings;
  };

  const deleteSighting = async (id: string) => {
    await db.deleteSighting(id);
    setSightings(prev => prev.filter(s => s.id !== id));
    // Clear lastSightingIds if the deleted sighting is in it
    setLastSightingIds(prev => prev.filter(sId => sId !== id));
  };

  const undoLastSighting = async () => {
    if (lastSightingIds.length === 0) return;

    // Delete all sightings from last action
    await Promise.all(lastSightingIds.map(id => db.deleteSighting(id)));
    setSightings(prev => prev.filter(s => !lastSightingIds.includes(s.id)));
    setLastSightingIds([]);
  };

  const markAllAsPaid = async () => {
    const unpaidSightings = sightings.filter(s => !s.paid);

    if (unpaidSightings.length === 0) {
      return;
    }

    // Calculate balances per child
    const childBalancesMap = new Map<string, { childName: string; amount: number }>();

    unpaidSightings.forEach(sighting => {
      sighting.childIds.forEach((childId, idx) => {
        const childName = sighting.childNamesSnapshot[idx];
        const existing = childBalancesMap.get(childId);
        if (existing) {
          existing.amount += sighting.value;
        } else {
          childBalancesMap.set(childId, { childName, amount: sighting.value });
        }
      });
    });

    // Create payment record
    const paymentRecord: PaymentRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      totalAmount: unpaidSightings.reduce((sum, s) => sum + s.value, 0),
      sightingIds: unpaidSightings.map(s => s.id),
      childBalances: Array.from(childBalancesMap.entries()).map(([childId, data]) => ({
        childId,
        childName: data.childName,
        amount: data.amount,
      })),
    };

    // Update sightings to paid
    const updatedSightings = sightings.map(s => ({ ...s, paid: true }));

    // Save to database
    await Promise.all([
      db.saveSightings(updatedSightings),
      db.savePaymentRecord(paymentRecord),
    ]);

    setSightings(updatedSightings);
    setPaymentRecords(prev => [...prev, paymentRecord]);
    setLastSightingIds([]);
  };

  return (
    <AppContext.Provider
      value={{
        children,
        sightings,
        paymentRecords,
        loading,
        addChild,
        removeChild,
        updateChild,
        toggleChildActive,
        addSighting,
        deleteSighting,
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
