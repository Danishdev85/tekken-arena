import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import CharacterCard from '../components/CharacterCard';
import { GAMES } from '../utils/roster';

export default function CharacterCollection() {
  const [game, setGame] = useState('tekken8');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const roster = GAMES[game].roster;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roster.filter((c) => {
      if (category !== 'all' && c.category !== category) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [roster, query, category]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black tracking-wide text-fog uppercase sm:text-3xl">Character Collection</h1>
        <p className="mt-1 text-sm text-ash">
          Browse the rosters. This gallery is for viewing only — fighters are assigned randomly in matches, never
          picked by hand.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex rounded-md border border-line bg-panel p-1" role="tablist" aria-label="Game">
          {Object.values(GAMES).map((g) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={game === g.id}
              onClick={() => setGame(g.id)}
              className={`flex-1 rounded-sm px-4 py-2.5 font-display text-sm font-black tracking-wide uppercase sm:flex-none ${
                game === g.id ? 'bg-blood text-white' : 'text-ash hover:text-fog'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ash" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fighters by name"
            aria-label="Search fighters by name"
            className="w-full rounded-md border border-line bg-panel py-3 pr-3 pl-9 text-base text-fog placeholder:text-ash/60 focus:border-ember focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="rounded-md border border-line bg-panel px-3 py-3 text-sm font-semibold text-fog focus:border-ember focus:outline-none"
        >
          <option value="all">All fighters</option>
          <option value="base">Base roster</option>
          <option value="dlc">DLC fighters</option>
        </select>
      </div>

      <p className="text-sm text-ash">
        Showing <strong className="text-fog">{filtered.length}</strong> of {roster.length} {GAMES[game].label} fighters
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-panel p-8 text-center text-sm text-ash">
          No fighters match that search.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {filtered.map((c) => (
            <CharacterCard key={c.id} character={c} />
          ))}
        </div>
      )}
    </div>
  );
}
