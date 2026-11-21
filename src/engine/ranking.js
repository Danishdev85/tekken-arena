// Leaderboard / ranking engine.
//
// Points: win = 3, loss = 0.
// Ranking priority:
//   1. Points (equivalently wins)
//   2. Head-to-head: points earned in matches among the tied group
//   3. Overall win percentage
//   4. Tie-break (decider) match results among the tied group
// Anything still level after all four is an UNRESOLVED tie. Unresolved ties
// are never silently broken alphabetically; the UI flags them and the
// organizer resolves them with decider matches.

export const POINTS_WIN = 3;

function blankRow(player) {
  return {
    playerId: player.id,
    name: player.name,
    played: 0,
    wins: 0,
    losses: 0,
    points: 0,
    winPct: 0,
  };
}

function applyResult(row, won) {
  row.played += 1;
  if (won) {
    row.wins += 1;
    row.points += POINTS_WIN;
  } else {
    row.losses += 1;
  }
}

/** Points a player earned in matches where both sides belong to `groupIds`. */
function groupPoints(matches, playerId, groupIds) {
  let pts = 0;
  for (const m of matches) {
    if (m.winnerId !== playerId) continue;
    const other = m.player1Id === playerId ? m.player2Id : m.player1Id;
    if (groupIds.has(other)) pts += POINTS_WIN;
  }
  return pts;
}

function compareRows(a, b, ctx) {
  if (b.points !== a.points) return b.points - a.points;
  const ga = ctx.groupOf(a.playerId);
  const gb = ctx.groupOf(b.playerId);
  if (ga && ga === gb) {
    const ha = groupPoints(ctx.leagueMatches, a.playerId, ga);
    const hb = groupPoints(ctx.leagueMatches, b.playerId, ga);
    if (hb !== ha) return hb - ha;
    if (b.winPct !== a.winPct) return b.winPct - a.winPct;
    const ta = groupPoints(ctx.tiebreakMatches, a.playerId, ga);
    const tb = groupPoints(ctx.tiebreakMatches, b.playerId, ga);
    if (tb !== ta) return tb - ta;
    return 0; // genuinely unresolved
  }
  if (b.winPct !== a.winPct) return b.winPct - a.winPct;
  return 0;
}

/**
 * Compute standings.
 * @param {Array<{id,name}>} players
 * @param {Array} leagueMatches - completed league matches carry winnerId
 * @param {Array} tiebreakMatches - completed decider matches
 * @returns rows sorted by rank, each with `rank`, `tieGroupId` (shared id
 *          string for players whose relative order is unresolved, else null)
 */
export function computeStandings(players, leagueMatches, tiebreakMatches = []) {
  const rows = new Map(players.map((p) => [p.id, blankRow(p)]));
  for (const m of leagueMatches) {
    if (!m.winnerId) continue;
    const loserId = m.player1Id === m.winnerId ? m.player2Id : m.player1Id;
    if (rows.has(m.winnerId)) applyResult(rows.get(m.winnerId), true);
    if (rows.has(loserId)) applyResult(rows.get(loserId), false);
  }
  for (const row of rows.values()) {
    row.winPct = row.played > 0 ? row.wins / row.played : 0;
  }

  // Tied groups on points (the first criterion).
  const byPoints = new Map();
  for (const row of rows.values()) {
    if (!byPoints.has(row.points)) byPoints.set(row.points, new Set());
    byPoints.get(row.points).add(row.playerId);
  }
  const groupLookup = new Map();
  for (const set of byPoints.values()) {
    if (set.size > 1) for (const id of set) groupLookup.set(id, set);
  }
  const ctx = {
    leagueMatches: leagueMatches.filter((m) => m.winnerId),
    tiebreakMatches: tiebreakMatches.filter((m) => m.winnerId),
    groupOf: (id) => groupLookup.get(id) || null,
  };

  const sorted = [...rows.values()].sort((a, b) => compareRows(a, b, ctx));

  // Assign ranks and mark unresolved tie groups: adjacent players whose
  // comparison is 0 AND who share a points group stay tied.
  let tieCounter = 0;
  sorted.forEach((row, i) => {
    row.rank = i + 1;
    row.tieGroupId = null;
  });
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (compareRows(a, b, ctx) === 0 && a.points === b.points) {
      if (!a.tieGroupId) a.tieGroupId = `tie-${++tieCounter}`;
      b.tieGroupId = a.tieGroupId;
    }
  }
  return sorted;
}

/**
 * If an unresolved tie straddles the qualification boundary (rank 4/5),
 * return { playerIds, spots } describing the decider that must be played.
 * `spots` = how many of the tied players can still qualify.
 * Returns null when qualification is fully determined.
 */
export function qualificationTie(standings, qualifyCount = 4) {
  if (standings.length <= qualifyCount) return null;
  const boundary = standings[qualifyCount - 1];
  const next = standings[qualifyCount];
  if (!boundary.tieGroupId || boundary.tieGroupId !== next.tieGroupId) return null;
  const group = standings.filter((r) => r.tieGroupId === boundary.tieGroupId);
  const spotsInside = group.filter((r) => r.rank <= qualifyCount).length;
  return { playerIds: group.map((r) => r.playerId), spots: spotsInside };
}

/** True when every league match has a recorded winner. */
export function leagueComplete(matches) {
  const league = matches.filter((m) => m.phase === 'league');
  return league.length > 0 && league.every((m) => m.winnerId);
}
