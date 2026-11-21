import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateRoundRobin } from '../engine/roundRobin';
import { createDecks, drawMatchCharacters, redrawCharacter, shuffle } from '../engine/characterAssignment';
import { computeStandings, qualificationTie } from '../engine/ranking';
import { seedSemifinals, seedFinal } from '../engine/knockout';
import { getRoster } from '../utils/roster';
import { loadTournaments, saveTournaments, clearAllData } from '../utils/storage';
import { newId } from '../utils/jsonIO';

let matchCounter = 0;
function matchId(prefix) {
  matchCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${matchCounter}`;
}

/** Build a brand-new tournament object (fixtures + character assignments). */
export function buildTournament({ name, game, playerNames }) {
  const roster = getRoster(game);
  const rosterIds = roster.map((c) => c.id);
  const players = playerNames.map((n, i) => ({ id: `pl-${i + 1}`, name: n }));
  const seedOrder = shuffle(players.map((p) => p.id));
  const { rounds } = generateRoundRobin(seedOrder);

  let decks = createDecks(players.map((p) => p.id), rosterIds);
  const matches = [];
  const roundInfo = [];
  let number = 0;
  for (const round of rounds) {
    const ids = [];
    for (const [p1, p2] of round.pairings) {
      const drawn = drawMatchCharacters(decks, rosterIds, p1, p2);
      decks = drawn.decks;
      number += 1;
      const m = {
        id: matchId('m'),
        phase: 'league',
        round: round.round,
        number,
        player1Id: p1,
        player2Id: p2,
        char1Id: drawn.char1,
        char2Id: drawn.char2,
        winnerId: null,
        locked: false,
      };
      matches.push(m);
      ids.push(m.id);
    }
    roundInfo.push({ round: round.round, matchIds: ids, byePlayerId: round.bye });
  }

  return {
    id: newId('t'),
    name,
    game,
    createdAt: Date.now(),
    finishedAt: null,
    status: 'league',
    players,
    rounds: roundInfo,
    matches,
    decks,
    championId: null,
  };
}

function withDrawnMatch(t, base) {
  const rosterIds = getRoster(t.game).map((c) => c.id);
  const drawn = drawMatchCharacters(t.decks, rosterIds, base.player1Id, base.player2Id);
  return {
    tournament: { ...t, decks: drawn.decks },
    match: { ...base, char1Id: drawn.char1, char2Id: drawn.char2 },
  };
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState(() => loadTournaments());

  useEffect(() => {
    saveTournaments(tournaments);
  }, [tournaments]);

  const update = useCallback((id, fn) => {
    setTournaments((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));
  }, []);

  const create = useCallback(({ name, game, playerNames }) => {
    const t = buildTournament({ name, game, playerNames });
    setTournaments((prev) => [t, ...prev]);
    return t;
  }, []);

  const remove = useCallback((id) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    clearAllData();
    setTournaments([]);
  }, []);

  const importTournament = useCallback((obj, mode) => {
    if (mode === 'overwrite') {
      setTournaments((prev) => {
        const idx = prev.findIndex((t) => t.id === obj.id);
        if (idx === -1) return [obj, ...prev];
        const next = [...prev];
        next[idx] = obj;
        return next;
      });
      return obj;
    }
    const copy = { ...obj, id: newId('t'), name: `${obj.name} (imported)` };
    setTournaments((prev) => [copy, ...prev]);
    return copy;
  }, []);

  const restart = useCallback((id) => {
    let created = null;
    setTournaments((prev) => {
      const src = prev.find((t) => t.id === id);
      if (!src) return prev;
      created = buildTournament({
        name: src.name,
        game: src.game,
        playerNames: src.players.map((p) => p.name),
      });
      return [created, ...prev];
    });
    return created;
  }, []);

  const randomizeCharacters = useCallback((tournamentId, matchIdToRandomize) => {
    update(tournamentId, (t) => {
      const match = t.matches.find((m) => m.id === matchIdToRandomize);
      if (!match || match.locked || match.winnerId) return t;
      const rosterIds = getRoster(t.game).map((c) => c.id);
      const first = redrawCharacter(t.decks, rosterIds, match.player1Id, match.char1Id, match.char2Id);
      const second = redrawCharacter(first.decks, rosterIds, match.player2Id, match.char2Id, first.char);
      return {
        ...t,
        decks: second.decks,
        matches: t.matches.map((m) =>
          m.id === match.id ? { ...m, char1Id: first.char, char2Id: second.char } : m,
        ),
      };
    });
  }, [update]);

  const lockMatch = useCallback((tournamentId, matchIdToLock) => {
    update(tournamentId, (t) => ({
      ...t,
      matches: t.matches.map((m) => (m.id === matchIdToLock ? { ...m, locked: true } : m)),
    }));
  }, [update]);

  const setWinner = useCallback((tournamentId, matchIdToSet, winnerId) => {
    update(tournamentId, (t) => {
      const match = t.matches.find((m) => m.id === matchIdToSet);
      if (!match) return t;
      let matches = t.matches.map((m) =>
        m.id === match.id ? { ...m, winnerId, locked: true } : m,
      );
      let next = { ...t, matches, championId: null, finishedAt: null };

      if (match.phase === 'league') {
        // A league result (re)recorded after later stages exist invalidates
        // everything that depended on the old standings.
        const hasLater = matches.some((m) => m.phase !== 'league');
        if (hasLater) {
          next = {
            ...next,
            matches: matches.filter((m) => m.phase === 'league'),
            status: 'league',
          };
        }
        return next;
      }

      if (match.phase === 'tiebreak') {
        return { ...next, status: t.status === 'completed' ? 'league' : t.status };
      }

      if (match.phase === 'semifinal') {
        const sf1 = matches.find((m) => m.phase === 'semifinal' && m.key === 'SF1');
        const sf2 = matches.find((m) => m.phase === 'semifinal' && m.key === 'SF2');
        // Any semifinal change resets the final and the champion.
        next = {
          ...next,
          matches: next.matches.filter((m) => m.phase !== 'final'),
          status: 'knockout',
        };
        if (sf1 && sf2 && sf1.winnerId && sf2.winnerId) {
          const pairing = seedFinal(sf1.winnerId, sf2.winnerId);
          const built = withDrawnMatch(next, {
            id: matchId('f'),
            phase: 'final',
            key: 'F',
            label: 'Grand Final',
            round: null,
            number: 1,
            player1Id: pairing.player1Id,
            player2Id: pairing.player2Id,
            winnerId: null,
            locked: false,
          });
          next = { ...built.tournament, matches: [...built.tournament.matches, built.match] };
        }
        return next;
      }

      if (match.phase === 'final') {
        return { ...next, championId: winnerId, status: 'completed', finishedAt: Date.now() };
      }

      return next;
    });
  }, [update]);

  const generateTiebreak = useCallback((tournamentId) => {
    update(tournamentId, (t) => {
      const league = t.matches.filter((m) => m.phase === 'league');
      const existing = t.matches.filter((m) => m.phase === 'tiebreak');
      const standings = computeStandings(t.players, league, existing);
      const tie = qualificationTie(standings);
      if (!tie) return t;
      const { rounds } = generateRoundRobin(tie.playerIds);
      let working = { ...t };
      const newMatches = [];
      let number = existing.length;
      for (const round of rounds) {
        for (const [p1, p2] of round.pairings) {
          number += 1;
          const built = withDrawnMatch(working, {
            id: matchId('tb'),
            phase: 'tiebreak',
            round: round.round,
            number,
            player1Id: p1,
            player2Id: p2,
            winnerId: null,
            locked: false,
          });
          working = built.tournament;
          newMatches.push(built.match);
        }
      }
      return { ...working, matches: [...working.matches, ...newMatches] };
    });
  }, [update]);

  const generateKnockout = useCallback((tournamentId) => {
    update(tournamentId, (t) => {
      if (t.matches.some((m) => m.phase === 'semifinal')) return t;
      const league = t.matches.filter((m) => m.phase === 'league');
      const tiebreak = t.matches.filter((m) => m.phase === 'tiebreak');
      const standings = computeStandings(t.players, league, tiebreak);
      const semis = seedSemifinals(standings);
      let working = { ...t, status: 'knockout' };
      const newMatches = [];
      semis.forEach((s, i) => {
        const built = withDrawnMatch(working, {
          id: matchId('sf'),
          phase: 'semifinal',
          key: s.key,
          label: s.label,
          round: null,
          number: i + 1,
          player1Id: s.player1Id,
          player2Id: s.player2Id,
          winnerId: null,
          locked: false,
        });
        working = built.tournament;
        newMatches.push(built.match);
      });
      return { ...working, matches: [...working.matches, ...newMatches] };
    });
  }, [update]);

  const api = useMemo(
    () => ({
      tournaments,
      create,
      remove,
      clearAll,
      importTournament,
      restart,
      randomizeCharacters,
      lockMatch,
      setWinner,
      generateTiebreak,
      generateKnockout,
    }),
    [tournaments, create, remove, clearAll, importTournament, restart, randomizeCharacters, lockMatch, setWinner, generateTiebreak, generateKnockout],
  );

  return api;
}
