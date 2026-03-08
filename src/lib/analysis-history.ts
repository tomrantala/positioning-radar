export interface HistoryEntry {
  id: string;
  userUrl: string;
  industry: string | null;
  createdAt: string;
  locale: string;
}

const STORAGE_KEY = "positioning_radar_history";
const MAX_ENTRIES = 20;

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getStorage(): Storage {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  // Fallback for SSR / environments without localStorage
  const store: Record<string, string> = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
  };
}

// Allow injection for testing
let storageOverride: Storage | null = null;
export function _setStorageForTest(storage: Storage | null): void {
  storageOverride = storage;
}

function storage(): Storage {
  return storageOverride ?? getStorage();
}

export function saveToHistory(entry: HistoryEntry): void {
  const history = getHistory();
  const filtered = history.filter((h) => h.id !== entry.id);
  const updated = [entry, ...filtered].slice(0, MAX_ENTRIES);
  storage().setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = storage().getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  storage().removeItem(STORAGE_KEY);
}

export function removeFromHistory(id: string): void {
  const history = getHistory().filter((h) => h.id !== id);
  storage().setItem(STORAGE_KEY, JSON.stringify(history));
}
