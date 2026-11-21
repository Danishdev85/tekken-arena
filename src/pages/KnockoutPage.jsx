import { useMemo } from 'react';
import { GitBranch, AlertTriangle } from 'lucide-react';
import Bracket from '../components/Bracket';
import ChampionDisplay from '../components/ChampionDisplay';
import { bracketState } from '../engine/knockout';
import { computeStandings, qualificationTie } from '../engine/ranking';
import { computeProgress } from '../engine/tournamentProgress';
import { downloadJSON } from '../utils/jsonIO';
import { downloadResultsPDF } from '../utils/exportPDF';

export default function KnockoutPage({ tournament, arena, navigate, openMatch }) {
  const { sf1, sf2, final, championId } = bracketState(tournament.matches);
  const prog = computeProgress(tournament);
  const league = useMemo(() => tournament.matches.filter((m) => m.phase === 'league'), [tournament]);
  const tiebreak = useMemo(() => tournament.matches.filter((m) => m.phase === 'tiebreak'), [tournament]);
  const standings = useMemo(() => computeStandings(tournament.players, league, tiebreak), [tournament, league, tiebreak]);
  const tie = prog.leagueComplete ? qualificationTie(standings) : null;
  const playerName = (id) => {
    const p = tournament.players.find((x) => x.id === id);
    return p ? p.name : 'Unknown';
  };
  const hasSemis = Boolean(sf1 && sf2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black tracking-wide text-fog uppercase sm:text-3xl">Knockout Bracket</h1>
        <p className="mt-1 text-sm text-ash">
          Semifinal 1: Rank 1 vs Rank 4 · Semifinal 2: Rank 2 vs Rank 3 · Winners meet in the Grand Final.
        </p>
      </div>

      {championId && (
        <ChampionDisplay
          tournament={tournament}
          standings={standings}
          onDownloadPDF={() => downloadResultsPDF(tournament)}
          onExportJSON={() => downloadJSON(tournament)}
          onRestart={() => {
            const t = arena.restart(tournament.id);
            if (t) navigate('dashboard', { tournamentId: t.id });
          }}
          onDashboard={() => navigate('dashboard')}
        />
      )}

      {!prog.leagueComplete && (
        <div className="rounded-md border border-line bg-panel p-5 text-sm leading-relaxed text-ash">
          The knockout stage unlocks when every league match is complete. Currently {prog.leagueCompleted} of{' '}
          {prog.leagueTotal} league matches are played.
        </div>
      )}

      {prog.leagueComplete && tie && (
        <div className="rounded-md border border-warn/50 bg-warn/10 p-4" role="alert">
          <p className="flex items-center gap-2 font-display text-base font-black text-warn">
            <AlertTriangle size={18} /> Qualification tie must be resolved first
          </p>
          <p className="mt-1.5 text-sm text-ash">
            A tie at the top-4 boundary is blocking the bracket. Resolve it with a tie-break decider from the
            leaderboard page.
          </p>
          <button
            onClick={() => navigate('leaderboard')}
            className="mt-3 rounded-md bg-warn px-4 py-2.5 text-sm font-black tracking-wide text-black uppercase hover:opacity-90"
          >
            Go to leaderboard
          </button>
        </div>
      )}

      {prog.leagueComplete && !tie && !hasSemis && (
        <div className="rounded-md border border-line bg-card p-5 text-center">
          <GitBranch size={30} className="mx-auto text-ember" />
          <p className="mt-2 font-display text-lg font-black text-fog">The league is complete</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ash">
            Top four: {standings.slice(0, 4).map((r) => r.name).join(', ')}. Generate the bracket to seed the
            semifinals.
          </p>
          <button
            onClick={() => arena.generateKnockout(tournament.id)}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-blood px-5 py-3 text-sm font-black tracking-wide text-white uppercase hover:opacity-90"
          >
            <GitBranch size={16} /> Generate knockout bracket
          </button>
        </div>
      )}

      {(hasSemis || prog.leagueComplete) && (
        <Bracket
          tournament={tournament}
          sf1={sf1}
          sf2={sf2}
          final={final}
          championId={championId}
          playerName={playerName}
          onOpen={openMatch}
        />
      )}

      {hasSemis && !final && sf1.winnerId && sf2.winnerId && (
        <p className="text-sm text-ash">Both semifinals are decided — the Grand Final has been added to the bracket.</p>
      )}
    </div>
  );
}
