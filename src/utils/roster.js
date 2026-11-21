import tekken7 from '../data/tekken7.json';
import tekken8 from '../data/tekken8.json';

export const GAMES = {
  tekken7: { id: 'tekken7', label: 'TEKKEN 7', roster: tekken7 },
  tekken8: { id: 'tekken8', label: 'TEKKEN 8', roster: tekken8 },
};

export function getRoster(game) {
  const g = GAMES[game];
  if (!g) throw new Error(`Unknown game: ${game}`);
  return g.roster.filter((c) => c.available);
}

export function getCharacter(game, charId) {
  const g = GAMES[game];
  if (!g) return null;
  return g.roster.find((c) => c.id === charId) || null;
}

/** Resolve a stored portrait path against the Vite base URL. */
export function portraitUrl(character) {
  if (!character || !character.portrait) return null;
  const base = import.meta.env.BASE_URL || './';
  return base.replace(/\/?$/, '/') + character.portrait.replace(/^\//, '');
}

export function gameLabel(game) {
  return GAMES[game] ? GAMES[game].label : game;
}
