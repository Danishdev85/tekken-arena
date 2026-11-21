import { GAMES } from './roster';

const VALID_PHASES = ['league', 'tiebreak', 'semifinal', 'final'];

/** Structural validation for an imported tournament object. */
export function validateTournament(obj) {
  if (!obj || typeof obj !== 'object') return { ok: false, error: 'File does not contain a tournament object.' };
  if (typeof obj.name !== 'string' || !obj.name.trim()) return { ok: false, error: 'Tournament name is missing.' };
  if (!GAMES[obj.game]) return { ok: false, error: 'Tournament game must be tekken7 or tekken8.' };
  if (!Array.isArray(obj.players) || obj.players.length < 2) return { ok: false, error: 'Tournament players are missing or too few.' };
  for (const p of obj.players) {
    if (!p || typeof p.id !== 'string' || typeof p.name !== 'string') {
      return { ok: false, error: 'A player entry is malformed.' };
    }
  }
  if (!Array.isArray(obj.matches)) return { ok: false, error: 'Tournament matches are missing.' };
  for (const m of obj.matches) {
    if (!m || typeof m.id !== 'string' || !VALID_PHASES.includes(m.phase)) {
      return { ok: false, error: 'A match entry is malformed.' };
    }
  }
  return { ok: true };
}

export function downloadJSON(tournament) {
  const blob = new Blob([JSON.stringify(tournament, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tournament.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-tournament.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch {
        reject(new Error('That file is not valid JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsText(file);
  });
}

export function newId(prefix = 't') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
