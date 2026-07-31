import { useState, useEffect, useCallback } from 'react';
import { AppState, IncomeEntry, SavingsGoal } from '../types';

const STORAGE_KEY = 'piggy_bank_state';

const defaultState: AppState = {
  isSetupComplete: false,
  goal: null,
  entries: [],
  totalSaved: 0,
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch {}
  return defaultState;
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const completeSetup = useCallback((goal: SavingsGoal) => {
    setState(prev => ({ ...prev, isSetupComplete: true, goal }));
  }, []);

  const addEntry = useCallback((entry: Omit<IncomeEntry, 'id' | 'date'>) => {
    const newEntry: IncomeEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setState(prev => {
      const savingAmount = (entry.amount * (prev.goal?.savingPercentage ?? 50)) / 100;
      return {
        ...prev,
        entries: [newEntry, ...prev.entries],
        totalSaved: prev.totalSaved + savingAmount,
      };
    });
    return newEntry;
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  return { state, completeSetup, addEntry, resetAll };
}
