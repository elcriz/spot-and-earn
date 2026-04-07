import { useMemo } from 'react';
import { useApp } from './useApp';
import { Child } from '../models/types';

export interface ChildBalance {
  child: Child;
  balance: number;
}

export function useBalances() {
  const { children, sightings } = useApp();

  const balances: ChildBalance[] = useMemo(() => {
    return children.map(child => {
      const balance = sightings
        .filter(s => !s.paid && s.childIds.includes(child.id))
        .reduce((sum, s) => sum + s.value, 0);

      return { child, balance };
    });
  }, [children, sightings]);

  const totalOwed = useMemo(() => {
    return balances.reduce((sum, b) => sum + b.balance, 0);
  }, [balances]);

  return { balances, totalOwed };
}
