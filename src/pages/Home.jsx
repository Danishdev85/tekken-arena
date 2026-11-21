import { motion } from 'framer-motion';
import { Swords, Trophy, Users, ChevronRight, Github, PlusCircle, ListOrdered, Shuffle, GitBranch } from 'lucide-react';
import { globalStats } from '../engine/tournamentProgress';
import { computeProgress } from '../engine/tournamentProgress';
import { GAMES, gameLabel } from '../utils/roster';

export default function Home({ tournaments, navigate, openTournament }) {
  const stats = globalStats(tournaments);
  const recent = [...tournaments].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="combat-bg relative overflow-hidden rounded-md border border-line px-5 py-12 text-center sm:px-10 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-[11px] font-bold tracking-[0.35em] text-ember uppercase">Browser Esports Tournament Platform</p>
          <h1 className="mt-3 font-display text-4xl leading-none font-black tracking-tight text-fog sm:text-6xl">
            TEKKEN <span className="text-glow-red text-ember">ARENA</span>
          </h1>
          <p className="mt-3 font-display text-base font-bold tracking-[0.2em] text-ash uppercase sm:text-lg">
            Create. Fight. Rank. Dominate.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ash sm:text-base">
            Build round-robin tournaments for Tekken 7 and Tekken 8. Every player faces everyone, every match draws
            random fighters, and the arena crowns one champion. No sign-up — jump straight in.
          </p>
          <button
            onClick={() => navigate('create')}
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-blood px-6 py-3.5 font-display text-base font-black tracking-wide text-white uppercase shadow-[0_0_28px_rgba(185,28,28,0.45)] transition-opacity hover:opacity-90"
          >
            <PlusCircle size={19} /> Create Tournament
          </button>
        </motion.div>
      </section>

      {/* GAME SELECTION */}
      <section>
        <h2 className="mb-3 font-display text-lg font-black tracking-wide text-fog uppercase">Choose your game</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.values(GAMES).map((g) => (
            <button
              key={g.id}
              onClick={() => navigate('create', { game: g.id })}
              className="group rounded-md border border-line bg-card p-5 text-left transition-colors hover:border-ember/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-black text-fog">{g.label}</span>
                <ChevronRight size={20} className="text-ash transition-transform group-hover:translate-x-1 group-hover:text-ember" />
              </div>
              <p className="mt-1 text-sm text-ash">
                {g.roster.length} fighters · {g.roster.filter((c) => c.category === 'base').length} base ·{' '}
                {g.roster.filter((c) => c.category === 'dlc').length} DLC
              </p>
              <p className="mt-3 text-xs font-bold tracking-wider text-ember uppercase">Start a {g.label} tournament</p>
            </button>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
        {[
          { icon: Swords, label: 'Tournaments created', value: stats.totalTournaments },
          { icon: Trophy, label: 'Matches played', value: stats.totalMatchesPlayed },
          { icon: Users, label: 'Champions crowned', value: stats.latestChampions.length },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-line bg-card p-4">
            <s.icon size={20} className="text-ember" />
            <p className="mt-2 font-display text-3xl font-black text-fog">{s.value}</p>
            <p className="text-xs font-semibold tracking-wider text-ash uppercase">{s.label}</p>
          </div>
        ))}
      </section>

      {/* LATEST CHAMPIONS + RECENT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-lg font-black tracking-wide text-fog uppercase">Latest champions</h2>
          {stats.latestChampions.length === 0 ? (
            <div className="rounded-md border border-dashed border-line bg-panel p-5 text-sm text-ash">
              No champions yet. Finish a tournament and the winner takes this wall.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.latestChampions.slice(0, 4).map((c) => (
                <button
                  key={c.tournamentId}
                  onClick={() => openTournament(c.tournamentId, 'knockout')}
                  className="flex w-full items-center gap-3 rounded-md border border-line bg-card p-3.5 text-left transition-colors hover:border-ember/60"
                >
                  <Trophy size={18} className="shrink-0 text-ember" />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-sm font-black text-fog">{c.championName}</span>
                    <span className="block truncate text-xs text-ash">
                      {c.tournamentName} · {gameLabel(c.game)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-black tracking-wide text-fog uppercase">Recent tournaments</h2>
          {recent.length === 0 ? (
            <div className="rounded-md border border-dashed border-line bg-panel p-5 text-sm text-ash">
              Nothing here yet. Create your first tournament to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((t) => {
                const prog = computeProgress(t);
                return (
                  <button
                    key={t.id}
                    onClick={() => openTournament(t.id, 'dashboard')}
                    className="w-full rounded-md border border-line bg-card p-3.5 text-left transition-colors hover:border-ember/60"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-display text-sm font-black text-fog">{t.name}</span>
                      <span className="shrink-0 rounded-sm bg-panel px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-ash uppercase">
                        {gameLabel(t.game)}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-xs text-ash">
                      {t.players.length} players · {prog.completedMatches}/{prog.totalMatches} matches · {prog.percent}%
                      {t.status === 'completed' ? ' · Completed' : ''}
                    </span>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-panel">
                      <span className="block h-full bg-gradient-to-r from-blood to-ember" style={{ width: `${prog.percent}%` }} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* HOW IT WORKS */}
      <section>
        <h2 className="mb-3 font-display text-lg font-black tracking-wide text-fog uppercase">How the arena works</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: PlusCircle, title: '1. Create', text: 'Name your tournament, pick Tekken 7 or Tekken 8, and register 5 to 50 players. No accounts, no sign-up.' },
            { icon: ListOrdered, title: '2. Round Robin', text: 'Everyone plays everyone exactly once. Fixtures are generated with the circle method, byes included for odd counts.' },
            { icon: Shuffle, title: '3. Random Fighters', text: 'Every match draws a random fighter for each player from that game only. No repeats until a player\u2019s whole pool is used.' },
            { icon: GitBranch, title: '4. Knockout & Champion', text: 'The top four advance to semifinals and a Grand Final. Record winners, break real ties with deciders, crown the champion.' },
          ].map((s) => (
            <div key={s.title} className="rounded-md border border-line bg-card p-4">
              <s.icon size={20} className="text-ember" />
              <p className="mt-2 font-display text-sm font-black tracking-wide text-fog uppercase">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ash">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line pt-5 pb-2 text-center text-xs leading-relaxed text-ash">
        <p>
          TEKKEN ARENA is a fan-made project. TEKKEN, Tekken 7 and Tekken 8 are trademarks of Bandai Namco
          Entertainment Inc. This tool is not affiliated with or endorsed by Bandai Namco.
        </p>
        <p className="mt-2">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-ash underline-offset-2 transition-colors hover:text-fog hover:underline"
          >
            <Github size={13} /> Project repository
          </a>
        </p>
      </footer>
    </div>
  );
}
