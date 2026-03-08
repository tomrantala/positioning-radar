import { describe, it, expect, beforeEach } from "vitest";
import {
  saveToHistory,
  getHistory,
  clearHistory,
  removeFromHistory,
  _setStorageForTest,
  HistoryEntry,
} from "./analysis-history";

function createMemoryStorage() {
  const store: Record<string, string> = {};
  return {
    store,
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
  };
}

const mockEntry: HistoryEntry = {
  id: "abc-123",
  userUrl: "https://meom.fi",
  industry: "SaaS / Software",
  createdAt: "2026-03-09T00:00:00Z",
  locale: "en",
};

describe("analysis-history", () => {
  let memStorage: ReturnType<typeof createMemoryStorage>;

  beforeEach(() => {
    memStorage = createMemoryStorage();
    _setStorageForTest(memStorage);
  });

  it("saves an entry and retrieves it", () => {
    saveToHistory(mockEntry);
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(mockEntry);
  });

  it("deduplicates by id and keeps newest first", () => {
    saveToHistory(mockEntry);
    const updated = { ...mockEntry, industry: "Updated Industry" };
    saveToHistory(updated);
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].industry).toBe("Updated Industry");
  });

  it("caps at 20 entries, dropping oldest", () => {
    for (let i = 0; i < 25; i++) {
      saveToHistory({ ...mockEntry, id: `id-${i}`, createdAt: `2026-03-${String(i + 1).padStart(2, "0")}T00:00:00Z` });
    }
    const history = getHistory();
    expect(history).toHaveLength(20);
    expect(history[0].id).toBe("id-24");
    expect(history[19].id).toBe("id-5");
  });

  it("clearHistory removes all entries", () => {
    saveToHistory(mockEntry);
    saveToHistory({ ...mockEntry, id: "xyz-456" });
    expect(getHistory()).toHaveLength(2);
    clearHistory();
    expect(getHistory()).toHaveLength(0);
  });

  it("removeFromHistory removes a single entry by id", () => {
    saveToHistory(mockEntry);
    saveToHistory({ ...mockEntry, id: "xyz-456", userUrl: "https://other.com" });
    removeFromHistory("abc-123");
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe("xyz-456");
  });

  it("returns empty array when storage contains corrupt data", () => {
    memStorage.store["positioning_radar_history"] = "not-valid-json{{{";
    expect(getHistory()).toEqual([]);
  });
});
