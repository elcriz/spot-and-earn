export type Child = {
  id: string;
  name: string;
  active: boolean;
};

export type AnimalType = 'deer' | 'hare';

export type Sighting = {
  id: string;
  timestamp: number;
  animal: AnimalType;
  value: number;
  childIds: string[];
  childNamesSnapshot: string[];
  paid: boolean;
};

export type PaymentRecord = {
  id: string;
  timestamp: number;
  totalAmount: number;
  sightingIds: string[];
  childBalances: Array<{
    childId: string;
    childName: string;
    amount: number;
  }>;
};

export type HistoryEntry =
  | { type: 'sighting'; data: Sighting }
  | { type: 'payment'; data: PaymentRecord };

export const ANIMAL_VALUES: Record<AnimalType, number> = {
  deer: 1.0,
  hare: 0.5,
};

export const ANIMAL_EMOJIS: Record<AnimalType, string> = {
  deer: '🦌',
  hare: '🐇',
};

export const ANIMAL_LABELS: Record<AnimalType, string> = {
  deer: 'Roe deer',
  hare: 'European hare',
};
