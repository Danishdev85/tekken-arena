import { Trophy } from 'lucide-react';
import CharacterPortrait from './CharacterPortrait';
import { getCharacter } from '../utils/roster';

function BracketMatch({ tournament, match, playerName, onOpen, emptyLabel }) {
  if (!match) {
    return (
      <div className="rounded-md border border-dashed border-line bg-panel p-3 text-center text-xs text-ash">
        {emptyLabel}
      </div>
    );
  }
  const c1 = getCharacter(tournament.game, match.char1Id);
  const c2 = getCharacter(tournament.game, match.char2Id);
  const row = (pid, character) => {
    const won = match.winnerId === pid;
    return (
      <div className={`flex items-center gap-2 rounded-sm px-2 py-1.5 ${won ? 'bg-win/10' : ''}`}>
        <CharacterPortrait character={character} size="sm" className="!h-8 !w-8" />
        <div className="min-w-0">
          <p className={`truncate text-sm font-bold ${won ? 'text-win' : 'text-fog'}`}>{playerName(pid)}</p>
          <p className="truncate text-[11px] text-ash">{character ? character.name : '—'}</p>
        </div>
      </div>
    );
  };
  return (
    <button
      onClick={() => onOpen(match)}
      className="w-full rounded-md border border-line bg-card p-2 text-left transition-colors hover:border-ember/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
    >
      <p className="px-1 pb-1 text-[10px] font-bold tracking-wider text-ash uppercase">{match.label}</p>
      {row(match.player1Id, c1)}
      {row(match.player2Id, c2)}
      {!match.winnerId && <p className="px-1 pt-1 text-[11px] text-ember">Tap to open match</p>}
    </button>
  );
}

/**
 * Knockout bracket. Horizontally scrollable on small screens; the page
 * itself never scrolls sideways.
 */
export default function Bracket({ tournament, sf1, sf2, final, championId, playerName, onOpen }) {
  const champion = championId ? tournament.players.find((p) => p.id === championId) : null;
  return (
    <div className="nice-scroll overflow-x-auto pb-2">
      <div className="grid min-w-[680px] grid-cols-3 items-center gap-4 md:gap-8">
        <div className="space-y-4">
          <BracketMatch tournament={tournament} match={sf1} playerName={playerName} onOpen={onOpen} emptyLabel="Semifinal 1 not generated" />
          <BracketMatch tournament={tournament} match={sf2} playerName={playerName} onOpen={onOpen} emptyLabel="Semifinal 2 not generated" />
        </div>
        <div>
          <BracketMatch tournament={tournament} match={final} playerName={playerName} onOpen={onOpen} emptyLabel="Grand Final awaits the semifinal winners" />
        </div>
        <div
          className={`rounded-md border p-4 text-center ${
            champion ? 'border-ember/60 bg-ember/10' : 'border-dashed border-line bg-panel'
          }`}
        >
          <Trophy size={28} className={champion ? 'mx-auto text-ember' : 'mx-auto text-ash'} />
          <p className="mt-2 text-[10px] font-bold tracking-widest text-ash uppercase">Champion</p>
          <p className={`mt-1 font-display text-lg font-black ${champion ? 'text-fog' : 'text-ash'}`}>
            {champion ? champion.name : 'To be decided'}
          </p>
        </div>
      </div>
    </div>
  );
}
