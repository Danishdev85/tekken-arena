import { useMemo } from 'react';
import { AlertTriangle, Swords, GitBranch, CheckCircle2 } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import { computeStandings, qualificationTie } from '../engine/ranking';
import { computeProgress } from '../engine/tournamentProgress';

export default function LeaderboardPage({ tournament, arena, navigate }) {
  const league = useMemo(() => tournament.matches.filter((m) => m.phase === 'league'), [tournament]);
  const tiebreak = useMemo(() => tournament.matches.filter((m) => m.phase === 'tiebreak'), [tournament]);
  const standings = useMemo(() => computeStandings(tournament.players, league, tiebreak), [tournament, league, tiebreak]);
  const prog = computeProgress(tournament);
  const tie = prog.leagueComplete ? qualificationTie(standings) : null;
  const tiebreakOpen = tiebreak.some((m) => !m.winnerId);
  const hasSemis = tournament.matches.some((m) => m.phase === 'semifinal');
  const playerName = (id) => {
    const p = tournament.players.find((x) => x.id === id);
    return p ? p.name : 'Unknown';
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black tracking-wide text-fog uppercase sm:text-3xl">Leaderboard</h1>
        <p className="mt-1 text-sm text-ash">
          {tournament.name} · Win = 3 points. Ranking order: points, head-to-head, win percentage, then decider
          matches. Tied players are flagged — never silently reordered.
        </p>
      </div>

      <Leaderboard standings={standings} leagueComplete={prog.leagueComplete} championId={tournament.championId} />

      {!prog.leagueComplete && (
        <p className="rounded-md border border-line bg-panel px-4 py-3 text-sm text-ash">
          League in progress: {prog.leagueCompleted} of {prog.leagueTotal} matches played. The top four qualify for
          the semifinals once every league match is complete.
        </p>
      )}

      {prog.leagueComplete && tie && (
        <div className="rounded-md border border-warn/50 bg-warn/10 p-4" role="alert">
          <p className="flex items-center gap-2 font-display text-base font-black text-warn">
            <AlertTriangle size={18} /> Qualification tie — decider required
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ash">
            {tie.playerIds.map(playerName).join(', ')} are level on points, head-to-head and win percentage, and only{' '}
            {tie.spots} of them can take the remaining top-4 {tie.spots === 1 ? 'spot' : 'spots'}. The knockout bracket
            cannot be generated until the organizer runs a tie-break decider between them.
          </p>
          {tiebreakOpen ? (
            <button
              onClick={() => navigate('matches')}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-warn px-4 py-2.5 text-sm font-black tracking-wide text-black uppercase hover:opacity-90"
            >
              <Swords size={15} /> Play the decider matches
            </button>
          ) : (
            <button
              onClick={() => arena.generateTiebreak(tournament.id)}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-warn px-4 py-2.5 text-sm font-black tracking-wide text-black uppercase hover:opacity-90"
            >
              <Swords size={15} /> Generate tie-break decider
            </button>
          )}
        </div>
      )}

      {prog.leagueComplete && !tie && !hasSemis && (
        <div className="rounded-md border border-win/40 bg-win/5 p-4">
          <p className="flex items-center gap-2 font-display text-base font-black text-win">
            <CheckCircle2 size={18} /> League complete — top four decided
          </p>
          <p className="mt-1.5 text-sm text-ash">
            {standings.slice(0, 4).map((r) => r.name).join(', ')} qualify for the semifinals.
          </p>
          <button
            onClick={() => {
              arena.generateKnockout(tournament.id);
              navigate('knockout');
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-blood px-4 py-2.5 text-sm font-black tracking-wide text-white uppercase hover:opacity-90"
          >
            <GitBranch size={15} /> Generate knockout bracket
          </button>
        </div>
      )}

      {prog.leagueComplete && !tie && hasSemis && (
        <p className="rounded-md border border-line bg-panel px-4 py-3 text-sm text-ash">
          The knockout bracket has been generated. Open the bracket to play the semifinals and the Grand Final.
        </p>
      )}
    </div>
  );
}
