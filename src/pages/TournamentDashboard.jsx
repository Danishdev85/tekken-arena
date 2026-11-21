import { Swords, Trophy, GitBranch, FileDown, FileJson, Trash2, RotateCcw, Play } from 'lucide-react';
import { computeProgress } from '../engine/tournamentProgress';
import { computeStandings } from '../engine/ranking';
import { gameLabel } from '../utils/roster';
import { downloadJSON } from '../utils/jsonIO';
import { downloadResultsPDF } from '../utils/exportPDF';
import Leaderboard from '../components/Leaderboard';
import Modal from '../components/Modal';
import { useState } from 'react';

export default function TournamentDashboard({ tournament, arena, navigate, openMatch }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const prog = computeProgress(tournament);
  const playerName = (id) => {
    const p = tournament.players.find((x) => x.id === id);
    return p ? p.name : 'Unknown';
  };
  const league = tournament.matches.filter((m) => m.phase === 'league');
  const tiebreak = tournament.matches.filter((m) => m.phase === 'tiebreak');
  const standings = computeStandings(tournament.players, league, tiebreak);
  const nextMatch = tournament.matches.find((m) => !m.winnerId);
  const champion = tournament.championId ? playerName(tournament.championId) : null;

  const statusLabel =
    tournament.status === 'completed'
      ? 'Completed'
      : tournament.status === 'knockout'
        ? 'Knockout stage'
        : prog.leagueComplete
          ? 'League complete'
          : 'League in progress';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-black tracking-wide break-words text-fog uppercase sm:text-3xl">
            {tournament.name}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ash">
            <span className="rounded-sm bg-blood/15 px-1.5 py-0.5 text-[11px] font-bold tracking-wider text-ember uppercase">
              {gameLabel(tournament.game)}
            </span>
            <span>{tournament.players.length} players</span>
            <span>·</span>
            <span>{statusLabel}</span>
            <span>·</span>
            <span>Created {new Date(tournament.createdAt).toLocaleDateString()}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadResultsPDF(tournament)} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-2.5 text-xs font-bold text-fog hover:border-ash">
            <FileDown size={14} /> PDF
          </button>
          <button onClick={() => downloadJSON(tournament)} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-2.5 text-xs font-bold text-fog hover:border-ash">
            <FileJson size={14} /> Export JSON
          </button>
          <button
            onClick={() => {
              const t = arena.restart(tournament.id);
              if (t) navigate('dashboard', { tournamentId: t.id });
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-2.5 text-xs font-bold text-fog hover:border-ash"
          >
            <RotateCcw size={14} /> Restart
          </button>
          <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 rounded-md border border-blood/50 bg-panel px-3 py-2.5 text-xs font-bold text-blood hover:bg-blood/10">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {champion && (
        <button
          onClick={() => navigate('knockout')}
          className="flex w-full items-center gap-3 rounded-md border border-ember/50 bg-ember/10 p-4 text-left transition-colors hover:border-ember"
        >
          <Trophy size={22} className="shrink-0 text-ember" />
          <span>
            <span className="block font-display text-lg font-black text-fog">{champion} is the champion</span>
            <span className="block text-sm text-ash">Open the knockout bracket to see the championship screen.</span>
          </span>
        </button>
      )}

      {/* Progress stats */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Progress', value: `${prog.percent}%` },
          { label: 'Total matches', value: prog.totalMatches },
          { label: 'Completed', value: prog.completedMatches },
          { label: 'Remaining', value: prog.remainingMatches },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-line bg-card p-4">
            <p className="font-display text-3xl font-black text-fog">{s.value}</p>
            <p className="text-xs font-semibold tracking-wider text-ash uppercase">{s.label}</p>
          </div>
        ))}
      </section>
      <div className="h-2 overflow-hidden rounded-full bg-panel" role="progressbar" aria-valuenow={prog.percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-gradient-to-r from-blood to-ember transition-all duration-500" style={{ width: `${prog.percent}%` }} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <section className="xl:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-black tracking-wide text-fog uppercase">Current standings</h2>
            <button onClick={() => navigate('leaderboard')} className="text-xs font-bold tracking-wider text-ember uppercase hover:underline">
              Full leaderboard
            </button>
          </div>
          <Leaderboard standings={standings.slice(0, 6)} leagueComplete={prog.leagueComplete} championId={tournament.championId} />
        </section>

        <section className="space-y-3 xl:col-span-2">
          <h2 className="font-display text-lg font-black tracking-wide text-fog uppercase">Up next</h2>
          {nextMatch ? (
            <button
              onClick={() => openMatch(nextMatch)}
              className="w-full rounded-md border border-ember/50 bg-card p-4 text-left transition-colors hover:border-ember"
            >
              <p className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-ember uppercase">
                <Play size={12} />
                {nextMatch.phase === 'league'
                  ? `Round ${nextMatch.round} · Match ${nextMatch.number}`
                  : nextMatch.phase === 'tiebreak'
                    ? `Tie-break Decider ${nextMatch.number}`
                    : nextMatch.label}
              </p>
              <p className="mt-2 font-display text-lg leading-snug font-black text-fog">
                {playerName(nextMatch.player1Id)} <span className="text-blood">vs</span> {playerName(nextMatch.player2Id)}
              </p>
              <p className="mt-1 text-sm text-ash">Open the match center to play this match.</p>
            </button>
          ) : (
            <div className="rounded-md border border-dashed border-line bg-panel p-4 text-sm text-ash">
              Every match in this tournament has been played.
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
            <button onClick={() => navigate('matches')} className="flex items-center justify-center gap-2 rounded-md bg-blood px-3 py-3 text-sm font-bold text-white hover:opacity-90">
              <Swords size={16} /> Matches
            </button>
            <button onClick={() => navigate('leaderboard')} className="flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 py-3 text-sm font-bold text-fog hover:border-ash">
              <Trophy size={16} /> Ranks
            </button>
            <button onClick={() => navigate('knockout')} className="flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-3 py-3 text-sm font-bold text-fog hover:border-ash">
              <GitBranch size={16} /> Bracket
            </button>
          </div>
        </section>
      </div>

      <Modal
        open={confirmDelete}
        title="Delete this tournament?"
        confirmLabel="Delete tournament"
        danger
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          arena.remove(tournament.id);
          navigate('history');
        }}
      >
        <p>
          <strong className="text-fog">{tournament.name}</strong> and all of its fixtures, results and rankings will be
          permanently removed from this browser. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
