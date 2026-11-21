// Round Robin engine — circle method.
// Every player plays every other player exactly once: N(N-1)/2 matches.
// Odd player counts use a BYE sentinel; a bye is not a match and never a win.

export const BYE = '__BYE__';

/**
 * @param {string[]} playerIds - player ids in seed order
 * @returns {{ rounds: Array<{round:number, pairings:Array<[string,string]>, bye:(string|null)}>, totalMatches:number }}
 */
export function generateRoundRobin(playerIds) {
  if (!Array.isArray(playerIds) || playerIds.length < 2) {
    throw new Error('Round robin needs at least 2 players');
  }
  const ids = [...playerIds];
  if (ids.length % 2 === 1) ids.push(BYE);

  const n = ids.length;
  const rounds = [];
  let ring = [...ids];

  for (let r = 0; r < n - 1; r++) {
    const pairings = [];
    let bye = null;
    for (let i = 0; i < n / 2; i++) {
      const a = ring[i];
      const b = ring[n - 1 - i];
      if (a === BYE) bye = b;
      else if (b === BYE) bye = a;
      else pairings.push([a, b]);
    }
    rounds.push({ round: r + 1, pairings, bye });
    // Circle rotation: keep ring[0] fixed, rotate the rest.
    ring = [ring[0], ring[n - 1], ...ring.slice(1, n - 1)];
  }

  const totalMatches = rounds.reduce((sum, r) => sum + r.pairings.length, 0);
  return { rounds, totalMatches };
}

/** Expected number of league matches for N players. */
export function expectedMatchCount(n) {
  return (n * (n - 1)) / 2;
}

/** Validate a generated fixture set: every unique pairing exactly once, nobody plays themselves. */
export function validateRoundRobin(playerIds, rounds) {
  const seen = new Set();
  const playCount = new Map(playerIds.map((id) => [id, 0]));
  for (const round of rounds) {
    for (const [a, b] of round.pairings) {
      if (a === b) return { ok: false, error: `Player ${a} faces themselves` };
      const key = [a, b].sort().join('::');
      if (seen.has(key)) return { ok: false, error: `Duplicate pairing ${key}` };
      seen.add(key);
      playCount.set(a, (playCount.get(a) || 0) + 1);
      playCount.set(b, (playCount.get(b) || 0) + 1);
    }
  }
  const expected = expectedMatchCount(playerIds.length);
  if (seen.size !== expected) {
    return { ok: false, error: `Expected ${expected} pairings, got ${seen.size}` };
  }
  for (const id of playerIds) {
    if (playCount.get(id) !== playerIds.length - 1) {
      return { ok: false, error: `Player ${id} plays ${playCount.get(id)} matches, expected ${playerIds.length - 1}` };
    }
  }
  return { ok: true };
}
