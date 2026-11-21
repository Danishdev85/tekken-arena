import { describe, it, expect } from 'vitest';
import { generateRoundRobin, validateRoundRobin, expectedMatchCount, BYE } from '../src/engine/roundRobin';
import { createDecks, drawMatchCharacters, shuffle } from '../src/engine/characterAssignment';
import { computeStandings, qualificationTie } from '../src/engine/ranking';
import { seedSemifinals, seedFinal } from '../src/engine/knockout';
import tekken7 from '../src/data/tekken7.json';
import tekken8 from '../src/data/tekken8.json';

// Deterministic RNG for repeatable tests.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ids = (n) => Array.from({ length: n }, (_, i) => `p${i + 1}`);
const players = (n) => ids(n).map((id) => ({ id, name: id.toUpperCase() }));
const match = (player1Id, player2Id, winnerId) => ({ phase: 'league', player1Id, player2Id, winnerId });

describe('round robin engine', () => {
  it.each([5, 6, 8, 10])('generates exactly N(N-1)/2 matches for %i players', (n) => {
    const { rounds, totalMatches } = generateRoundRobin(ids(n));
    expect(totalMatches).toBe(expectedMatchCount(n));
    expect(validateRoundRobin(ids(n), rounds)).toEqual({ ok: true });
  });

  it('matches the spec examples', () => {
    expect(generateRoundRobin(ids(4)).totalMatches).toBe(6);
    expect(generateRoundRobin(ids(5)).totalMatches).toBe(10);
    expect(generateRoundRobin(ids(6)).totalMatches).toBe(15);
    expect(generateRoundRobin(ids(8)).totalMatches).toBe(28);
    expect(generateRoundRobin(ids(10)).totalMatches).toBe(45);
  });

  it('gives every player exactly one bye per cycle for odd counts', () => {
    const n = 7;
    const { rounds } = generateRoundRobin(ids(n));
    const byes = rounds.map((r) => r.bye);
    expect(byes.every((b) => b && b !== BYE)).toBe(true);
    expect(new Set(byes).size).toBe(n); // everyone sits out exactly once
    for (const round of rounds) {
      const playing = new Set(round.pairings.flat());
      expect(playing.size).toBe(n - 1);
    }
  });

  it('has no byes for even counts', () => {
    const { rounds } = generateRoundRobin(ids(6));
    expect(rounds.every((r) => r.bye === null)).toBe(true);
  });

  it('scales to 50 players (1225 matches)', () => {
    const { rounds, totalMatches } = generateRoundRobin(ids(50));
    expect(totalMatches).toBe(1225);
    expect(validateRoundRobin(ids(50), rounds)).toEqual({ ok: true });
  });
});

describe('character assignment engine', () => {
  const rosterIds = tekken8.map((c) => c.id);

  it('always gives opponents different characters', () => {
    const rng = mulberry32(42);
    let decks = createDecks(ids(6), rosterIds, rng);
    for (let i = 0; i < 300; i++) {
      const drawn = drawMatchCharacters(decks, rosterIds, 'p1', 'p2', rng);
      decks = drawn.decks;
      expect(drawn.char1).not.toBe(drawn.char2);
      expect(rosterIds).toContain(drawn.char1);
      expect(rosterIds).toContain(drawn.char2);
    }
  });

  it('never repeats a character for a player until the pool is exhausted', () => {
    const rng = mulberry32(7);
    let decks = createDecks(['solo', 'opp'], rosterIds, rng);
    const seen = [];
    for (let i = 0; i < rosterIds.length; i++) {
      const drawn = drawMatchCharacters(decks, rosterIds, 'solo', 'opp', rng);
      decks = drawn.decks;
      seen.push(drawn.char1);
    }
    expect(new Set(seen).size).toBe(rosterIds.length);
    // Next draw starts a fresh cycle (a repeat is now allowed).
    const next = drawMatchCharacters(decks, rosterIds, 'solo', 'opp', rng);
    expect(rosterIds).toContain(next.char1);
  });

  it('only draws from the selected game roster', () => {
    const rng = mulberry32(3);
    const t7Ids = tekken7.map((c) => c.id);
    let decks = createDecks(['a', 'b'], t7Ids, rng);
    for (let i = 0; i < 60; i++) {
      const drawn = drawMatchCharacters(decks, t7Ids, 'a', 'b', rng);
      decks = drawn.decks;
      expect(t7Ids).toContain(drawn.char1);
      expect(t7Ids).toContain(drawn.char2);
    }
  });

  it('shuffle returns a permutation', () => {
    const rng = mulberry32(11);
    const out = shuffle([1, 2, 3, 4, 5, 6, 7, 8], rng);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('ranking engine', () => {
  it('orders by points first', () => {
    const ms = [
      match('p1', 'p2', 'p1'),
      match('p1', 'p3', 'p1'),
      match('p2', 'p3', 'p2'),
      match('p4', 'p1', 'p4'),
      match('p4', 'p2', 'p2'),
      match('p4', 'p3', 'p3'),
    ];
    const rows = computeStandings(players(4), ms);
    expect(rows[0].playerId).toBe('p1'); // 2 wins, beat p4? no — p1 has 6 pts; p2 also 6
    expect(rows.map((r) => r.points)).toEqual([6, 6, 3, 3]);
  });

  it('breaks a two-way points tie by head-to-head', () => {
    // p1 and p2 both finish on 6 points; p1 beat p2 directly.
    const ms = [
      match('p1', 'p2', 'p1'),
      match('p1', 'p3', 'p1'),
      match('p1', 'p4', 'p4'),
      match('p2', 'p3', 'p2'),
      match('p2', 'p4', 'p2'),
      match('p3', 'p4', 'p3'),
    ];
    const rows = computeStandings(players(4), ms);
    const p1 = rows.find((r) => r.playerId === 'p1');
    const p2 = rows.find((r) => r.playerId === 'p2');
    expect(p1.points).toBe(6);
    expect(p2.points).toBe(6);
    expect(p1.rank).toBeLessThan(p2.rank);
    expect(p1.tieGroupId).toBeNull();
  });

  it('flags a genuine cycle tie instead of silently ordering it', () => {
    // p1 beats p2, p2 beats p3, p3 beats p1; all beat p4. Perfect cycle.
    const ms = [
      match('p1', 'p2', 'p1'),
      match('p2', 'p3', 'p2'),
      match('p3', 'p1', 'p3'),
      match('p1', 'p4', 'p1'),
      match('p2', 'p4', 'p2'),
      match('p3', 'p4', 'p3'),
    ];
    const rows = computeStandings(players(4), ms);
    const tied = rows.filter((r) => r.tieGroupId);
    expect(tied.map((r) => r.playerId).sort()).toEqual(['p1', 'p2', 'p3']);
    expect(rows.find((r) => r.playerId === 'p4').tieGroupId).toBeNull();
  });

  it('detects a qualification tie straddling rank 4/5', () => {
    // 6 players. p1,p2,p3 clearly top. p4,p5,p6 cycle-tied at the boundary.
    const P = players(6);
    const wins = {
      p1: ['p2', 'p3', 'p4', 'p5', 'p6'],
      p2: ['p3', 'p4', 'p5', 'p6'],
      p3: ['p4', 'p5', 'p6'],
      p4: ['p5'],
      p5: ['p6'],
      p6: ['p4'],
    };
    const ms = [];
    const pairs = [['p1','p2'],['p1','p3'],['p1','p4'],['p1','p5'],['p1','p6'],['p2','p3'],['p2','p4'],['p2','p5'],['p2','p6'],['p3','p4'],['p3','p5'],['p3','p6'],['p4','p5'],['p4','p6'],['p5','p6']];
    for (const [a, b] of pairs) {
      const winner = wins[a].includes(b) ? a : b;
      ms.push(match(a, b, winner));
    }
    const rows = computeStandings(P, ms);
    const tie = qualificationTie(rows);
    expect(tie).not.toBeNull();
    expect(tie.playerIds.sort()).toEqual(['p4', 'p5', 'p6']);
    expect(tie.spots).toBe(1);
  });

  it('resolves the tie once decider results exist', () => {
    const P = players(4);
    const league = [
      match('p1', 'p2', 'p1'),
      match('p2', 'p3', 'p2'),
      match('p3', 'p1', 'p3'),
      match('p1', 'p4', 'p1'),
      match('p2', 'p4', 'p2'),
      match('p3', 'p4', 'p3'),
    ];
    const deciders = [
      { phase: 'tiebreak', player1Id: 'p1', player2Id: 'p2', winnerId: 'p1' },
      { phase: 'tiebreak', player1Id: 'p1', player2Id: 'p3', winnerId: 'p1' },
      { phase: 'tiebreak', player1Id: 'p2', player2Id: 'p3', winnerId: 'p2' },
    ];
    const rows = computeStandings(P, league, deciders);
    const tied = rows.filter((r) => r.tieGroupId);
    expect(tied).toEqual([]);
    expect(rows[0].playerId).toBe('p1');
  });
});

describe('knockout engine', () => {
  it('seeds semifinals as 1v4 and 2v3', () => {
    const standings = ['a', 'b', 'c', 'd', 'e'].map((id, i) => ({ playerId: id, rank: i + 1 }));
    const semis = seedSemifinals(standings);
    expect(semis[0]).toMatchObject({ key: 'SF1', player1Id: 'a', player2Id: 'd' });
    expect(semis[1]).toMatchObject({ key: 'SF2', player1Id: 'b', player2Id: 'c' });
  });

  it('refuses to seed a final before both semifinals are decided', () => {
    expect(() => seedFinal('a', null)).toThrow();
    expect(seedFinal('a', 'b')).toMatchObject({ player1Id: 'a', player2Id: 'b' });
  });

  it('refuses knockout seeding with fewer than 4 players', () => {
    const standings = ['a', 'b', 'c'].map((id, i) => ({ playerId: id, rank: i + 1 }));
    expect(() => seedSemifinals(standings)).toThrow();
  });
});

describe('character datasets', () => {
  it('tekken 7 has exactly the 51 specified fighters', () => {
    expect(tekken7).toHaveLength(51);
    expect(new Set(tekken7.map((c) => c.id)).size).toBe(51);
    expect(tekken7.every((c) => c.game === 'tekken7' && c.available === true)).toBe(true);
  });

  it('tekken 8 has exactly the 43 specified fighters and no Yujiro Hanma', () => {
    expect(tekken8).toHaveLength(43);
    expect(new Set(tekken8.map((c) => c.id)).size).toBe(43);
    expect(tekken8.some((c) => /yujiro/i.test(c.name))).toBe(false);
    expect(tekken8.every((c) => c.game === 'tekken8' && c.available === true)).toBe(true);
  });

  it('rosters never mix games and every entry has the required fields', () => {
    for (const c of [...tekken7, ...tekken8]) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(['base', 'dlc']).toContain(c.category);
      expect(c.portrait).toMatch(new RegExp(`^/assets/characters/${c.game}/[a-z0-9-]+\\.webp$`));
    }
    const t7Names = new Set(tekken7.map((c) => c.id));
    for (const c of tekken8) expect(t7Names.has(c.id)).toBe(false);
  });
});
