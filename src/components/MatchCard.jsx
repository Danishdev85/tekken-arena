import { Check, Lock } from 'lucide-react';
import CharacterPortrait from './CharacterPortrait';
import { getCharacter } from '../utils/roster';

export function matchStatus(match, isNextPlayable) {
  if (match.winnerId) return 'completed';
  return isNextPlayable ? 'ready' : 'upcoming';
}

const STATUS_STYLES = {
  completed: 'bg-win/15 text-win',
  ready: 'bg-ember/15 text-ember',
  upcoming: 'bg-panel text-ash',
};

export default function MatchCard({ tournament, match, playerName, status, onOpen }) {
  const c1 = getCharacter(tournament.game, match.char1Id);
  const c2 = getCharacter(tournament.game, match.char2Id);
  const title =
    match.phase === 'league'
      ? `Round ${match.round} · Match ${match.number}`
      : match.phase === 'tiebreak'
        ? `Tie-break Decider ${match.number}`
        : match.label || match.phase;

  const side = (pid, character, alignRight) => {
    const won = match.winnerId === pid;
    const lost = match.winnerId && match.winnerId !== pid;
    return (
      <div className={`flex min-w-0 flex-1 items-center gap-2.5 ${alignRight ? 'flex-row-reverse text-right' : ''}`}>
        <CharacterPortrait character={character} size="sm" className="shrink-0" />
        <div className="min-w-0">
          <p className={`truncate text-sm font-bold ${won ? 'text-win' : lost ? 'text-ash' : 'text-fog'}`}>
            {playerName(pid)}
          </p>
          <p className="truncate text-xs text-ash">{character ? character.name : '—'}</p>
        </div>
        {won && <Check size={16} className="shrink-0 text-win" aria-label="Winner" />}
      </div>
    );
  };

  return (
    <button
      onClick={() => onOpen(match)}
      className="w-full rounded-md border border-line bg-card p-3 text-left transition-colors hover:border-ember/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold tracking-wider text-ash uppercase">{title}</span>
        <span className="flex items-center gap-1.5">
          {match.locked && !match.winnerId && <Lock size={12} className="text-ash" aria-label="Characters locked" />}
          <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${STATUS_STYLES[status]}`}>
            {status}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {side(match.player1Id, c1, false)}
        <span className="shrink-0 font-display text-xs font-black text-blood">VS</span>
        {side(match.player2Id, c2, true)}
      </div>
    </button>
  );
}
