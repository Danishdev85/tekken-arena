import CharacterPortrait from './CharacterPortrait';

export default function CharacterCard({ character }) {
  return (
    <div className="group overflow-hidden rounded-md border border-line bg-card">
      <div className="aspect-[4/5] w-full">
        <CharacterPortrait character={character} size="card" className="rounded-none" />
      </div>
      <div className="p-3">
        <p className="truncate font-display text-sm font-bold text-fog" title={character.name}>
          {character.name}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              character.category === 'dlc' ? 'bg-ember/15 text-ember' : 'bg-win/15 text-win'
            }`}
          >
            {character.category === 'dlc' ? 'DLC' : 'Base'}
          </span>
          <span className="text-[11px] text-ash">{character.game === 'tekken7' ? 'Tekken 7' : 'Tekken 8'}</span>
        </div>
      </div>
    </div>
  );
}
