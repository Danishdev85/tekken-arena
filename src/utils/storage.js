const KEY = 'tekken-arena:v1';

export function loadTournaments() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tournaments)) return [];
    return parsed.tournaments;
  } catch {
    return [];
  }
}

export function saveTournaments(tournaments) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ tournaments }));
  } catch {
    // Storage full or unavailable: the app keeps working in-memory.
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
