// Tournament progress calculations.

export function computeProgress(tournament) {
  const matches = tournament.matches || [];
  const league = matches.filter((m) => m.phase === 'league');
  const leagueDone = league.filter((m) => m.winnerId).length;
  const total = matches.length;
  const completed = matches.filter((m) => m.winnerId).length;
  const knockout = matches.filter((m) => m.phase === 'semifinal' || m.phase === 'final');
  return {
    totalMatches: total,
    completedMatches: completed,
    remainingMatches: total - completed,
    leagueTotal: league.length,
    leagueCompleted: leagueDone,
    leagueComplete: league.length > 0 && leagueDone === league.length,
    knockoutTotal: knockout.length,
    knockoutCompleted: knockout.filter((m) => m.winnerId).length,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/** Global stats across every stored tournament (for the home page). */
export function globalStats(tournaments) {
  let matchesPlayed = 0;
  const champions = [];
  for (const t of tournaments) {
    matchesPlayed += (t.matches || []).filter((m) => m.winnerId).length;
    if (t.status === 'completed' && t.championId) {
      const champ = (t.players || []).find((p) => p.id === t.championId);
      if (champ) {
        champions.push({
          tournamentId: t.id,
          tournamentName: t.name,
          game: t.game,
          championName: champ.name,
          finishedAt: t.finishedAt || t.createdAt,
        });
      }
    }
  }
  champions.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
  return {
    totalTournaments: tournaments.length,
    totalMatchesPlayed: matchesPlayed,
    latestChampions: champions,
  };
}
