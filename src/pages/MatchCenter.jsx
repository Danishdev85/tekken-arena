import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MatchCard, { matchStatus } from '../components/MatchCard';
import VersusScreen from '../components/VersusScreen';
import { computeProgress } from '../engine/tournamentProgress';

const PAGE_SIZE = 24;

export default function MatchCenter({ tournament, arena, route, openMatch, clearMatch }) {
  const [roundFilter, setRoundFilter] = useState('all');
  const [page, setPage] = useState(0);

  const playerName = (id) => {
    const p = tournament.players.find((x) => x.id === id);
    return p ? p.name : 'Unknown';
  };

  const selectedMatch = route.matchId ? tournament.matches.find((m) => m.id === route.matchId) : null;

  const leagueMatches = useMemo(() => tournament.matches.filter((m) => m.phase === 'league'), [tournament]);
  const tiebreakMatches = useMemo(() => tournament.matches.filter((m) => m.phase === 'tiebreak'), [tournament]);
  const rounds = useMemo(() => {
    const set = new Set(leagueMatches.map((m) => m.round));
    return [...set].sort((a, b) => a - b);
  }, [leagueMatches]);

  // The earliest round that still has an unplayed match defines "Ready".
  const readyRound = useMemo(() => {
    for (const r of rounds) {
      if (leagueMatches.some((m) => m.round === r && !m.winnerId)) return r;
    }
    return null;
  }, [rounds, leagueMatches]);

  const statusFor = (match) => {
    if (match.phase === 'league') {
      return matchStatus(match, match.round === readyRound);
    }
    // Tie-break / knockout: ready when it is the first unplayed of its phase group.
    const group = tournament.matches.filter((m) => m.phase === match.phase);
    const firstOpen = group.find((m) => !m.winnerId);
    return matchStatus(match, firstOpen && firstOpen.id === match.id);
  };

  const visible = useMemo(() => {
    let list = leagueMatches;
    if (roundFilter === 'tiebreak') list = tiebreakMatches;
    else if (roundFilter !== 'all') list = leagueMatches.filter((m) => m.round === Number(roundFilter));
    return list;
  }, [leagueMatches, tiebreakMatches, roundFilter]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const prog = computeProgress(tournament);

  if (selectedMatch) {
    return (
      <VersusScreen
        tournament={tournament}
        match={selectedMatch}
        playerName={playerName}
        onBack={clearMatch}
        onRandomize={() => arena.randomizeCharacters(tournament.id, selectedMatch.id)}
        onLock={() => arena.lockMatch(tournament.id, selectedMatch.id)}
        onSetWinner={(winnerId) => arena.setWinner(tournament.id, selectedMatch.id, winnerId)}
      />
    );
  }

  const byeForRound = (r) => {
    const info = (tournament.rounds || []).find((x) => x.round === r);
    return info && info.byePlayerId ? playerName(info.byePlayerId) : null;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-black tracking-wide text-fog uppercase sm:text-3xl">Match Center</h1>
          <p className="mt-1 text-sm text-ash">
            {tournament.name} · {prog.completedMatches}/{prog.totalMatches} matches completed ({prog.percent}%)
          </p>
        </div>
      </div>

      {/* Round filter — horizontally scrollable chip rail */}
      <div className="nice-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filter matches by round">
        <button
          onClick={() => { setRoundFilter('all'); setPage(0); }}
          className={`shrink-0 rounded-md border px-3 py-2 text-xs font-bold tracking-wide uppercase ${roundFilter === 'all' ? 'border-ember bg-ember/10 text-fog' : 'border-line bg-panel text-ash'}`}
        >
          All rounds
        </button>
        {rounds.map((r) => (
          <button
            key={r}
            onClick={() => { setRoundFilter(String(r)); setPage(0); }}
            className={`shrink-0 rounded-md border px-3 py-2 text-xs font-bold tracking-wide uppercase ${roundFilter === String(r) ? 'border-ember bg-ember/10 text-fog' : 'border-line bg-panel text-ash'}`}
          >
            Round {r}
          </button>
        ))}
        {tiebreakMatches.length > 0 && (
          <button
            onClick={() => { setRoundFilter('tiebreak'); setPage(0); }}
            className={`shrink-0 rounded-md border px-3 py-2 text-xs font-bold tracking-wide text-warn uppercase ${roundFilter === 'tiebreak' ? 'border-warn bg-warn/10' : 'border-line bg-panel'}`}
          >
            Tie-breaks
          </button>
        )}
      </div>

      {roundFilter !== 'all' && roundFilter !== 'tiebreak' && byeForRound(Number(roundFilter)) && (
        <p className="rounded-md border border-line bg-panel px-3 py-2 text-sm text-ash">
          Bye this round: <strong className="text-fog">{byeForRound(Number(roundFilter))}</strong> — a bye is not a
          match and does not count as a win.
        </p>
      )}

      {pageItems.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-panel p-6 text-center text-sm text-ash">
          No matches in this view.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((m) => (
            <MatchCard key={m.id} tournament={tournament} match={m} playerName={playerName} status={statusFor(m)} onOpen={openMatch} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-3 py-2.5 text-sm font-bold text-fog disabled:opacity-40"
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <span className="text-sm text-ash">
            Page {safePage + 1} of {pageCount} · {visible.length} matches
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-3 py-2.5 text-sm font-bold text-fog disabled:opacity-40"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
