import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ChevronLeft, ChevronRight, Check, Swords } from 'lucide-react';
import { GAMES } from '../utils/roster';
import { expectedMatchCount } from '../engine/roundRobin';

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 50;

const STEPS = ['Tournament Info', 'Player Setup', 'Review', 'Generate'];

export default function CreateTournament({ arena, navigate, openTournament, initialGame }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [game, setGame] = useState(initialGame || 'tekken8');
  const [players, setPlayers] = useState(['', '', '', '', '']);
  const [touched, setTouched] = useState(false);

  const trimmed = players.map((p) => p.trim());
  const errors = useMemo(() => {
    const errs = [];
    const filled = trimmed.filter(Boolean);
    if (filled.length < MIN_PLAYERS) errs.push(`Add at least ${MIN_PLAYERS} players (${filled.length}/${MIN_PLAYERS} so far).`);
    if (filled.length > MAX_PLAYERS) errs.push(`Maximum ${MAX_PLAYERS} players allowed.`);
    const seen = new Map();
    trimmed.forEach((p, i) => {
      if (!p) return;
      const key = p.toLowerCase();
      if (seen.has(key)) errs.push(`"${p}" is entered twice (rows ${seen.get(key) + 1} and ${i + 1}). Player names must be unique.`);
      else seen.set(key, i);
    });
    return errs;
  }, [trimmed]);

  const filledCount = trimmed.filter(Boolean).length;
  const canReview = errors.length === 0 && filledCount >= MIN_PLAYERS;
  const roster = GAMES[game].roster;

  const setPlayer = (i, value) => setPlayers((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  const addPlayer = () => setPlayers((prev) => (prev.length < MAX_PLAYERS ? [...prev, ''] : prev));
  const removePlayer = (i) => setPlayers((prev) => prev.filter((_, idx) => idx !== i));

  const generate = () => {
    const t = arena.create({ name: name.trim(), game, playerNames: trimmed.filter(Boolean) });
    openTournament(t.id, 'dashboard');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-black tracking-wide text-fog uppercase sm:text-3xl">Create Tournament</h1>
      <p className="mt-1 text-sm text-ash">Direct access — no login, no sign-up. Four quick steps.</p>

      {/* Step indicator */}
      <ol className="mt-6 flex flex-wrap gap-2" aria-label="Wizard steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold tracking-wide uppercase ${
              i === step
                ? 'border-ember bg-ember/10 text-fog'
                : i < step
                  ? 'border-line bg-card text-win'
                  : 'border-line bg-panel text-ash'
            }`}
          >
            {i < step ? <Check size={13} /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </li>
        ))}
      </ol>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-5 rounded-md border border-line bg-card p-4 sm:p-6"
      >
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="tname" className="mb-1.5 block text-xs font-bold tracking-wider text-ash uppercase">
                Tournament name
              </label>
              <input
                id="tname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Friday Night Fights"
                maxLength={60}
                className="w-full rounded-md border border-line bg-panel px-3.5 py-3 text-base text-fog placeholder:text-ash/60 focus:border-ember focus:outline-none"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold tracking-wider text-ash uppercase">Game</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.values(GAMES).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGame(g.id)}
                    className={`rounded-md border p-4 text-left transition-colors ${
                      game === g.id ? 'border-ember bg-ember/10' : 'border-line bg-panel hover:border-ash'
                    }`}
                    aria-pressed={game === g.id}
                  >
                    <span className="font-display text-xl font-black text-fog">{g.label}</span>
                    <span className="mt-0.5 block text-xs text-ash">{g.roster.length} fighters available</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ash">
                The roster is locked to the selected game — Tekken 7 and Tekken 8 fighters are never mixed.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-ash">
                Register between <strong className="text-fog">{MIN_PLAYERS} and {MAX_PLAYERS} players</strong>.{' '}
                <span className={filledCount >= MIN_PLAYERS ? 'font-bold text-win' : 'font-bold text-warn'}>
                  {filledCount} entered
                </span>
                {filledCount >= 2 && (
                  <span className="text-ash"> · {expectedMatchCount(filledCount)} league matches</span>
                )}
              </p>
              <button
                onClick={addPlayer}
                disabled={players.length >= MAX_PLAYERS}
                className="inline-flex items-center gap-1.5 rounded-md bg-blood px-3 py-2 text-sm font-bold text-white transition-opacity enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={15} /> Add player
              </button>
            </div>
            <div className="space-y-2">
              {players.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-7 shrink-0 text-center font-display text-sm font-black text-ash">{i + 1}</span>
                  <input
                    value={p}
                    onChange={(e) => setPlayer(i, e.target.value)}
                    placeholder={`Player ${i + 1} name`}
                    maxLength={40}
                    aria-label={`Player ${i + 1} name`}
                    className="min-w-0 flex-1 rounded-md border border-line bg-panel px-3.5 py-3 text-base text-fog placeholder:text-ash/60 focus:border-ember focus:outline-none"
                  />
                  <button
                    onClick={() => removePlayer(i)}
                    disabled={players.length <= 1}
                    className="shrink-0 rounded-md border border-line bg-panel p-3 text-ash transition-colors enabled:hover:border-blood enabled:hover:text-blood disabled:opacity-40"
                    aria-label={`Remove player ${i + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {touched && errors.length > 0 && (
              <div className="mt-4 space-y-1 rounded-md border border-warn/40 bg-warn/10 p-3" role="alert">
                {errors.map((e, i) => (
                  <p key={i} className="text-sm font-semibold text-warn">{e}</p>
                ))}
              </div>
            )}
            {filledCount > MAX_PLAYERS && (
              <p className="mt-3 text-sm font-semibold text-warn">Maximum {MAX_PLAYERS} players allowed.</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-line bg-panel p-3.5">
                <dt className="text-[10px] font-bold tracking-wider text-ash uppercase">Tournament</dt>
                <dd className="mt-0.5 font-display text-lg font-black break-words text-fog">{name.trim()}</dd>
              </div>
              <div className="rounded-md border border-line bg-panel p-3.5">
                <dt className="text-[10px] font-bold tracking-wider text-ash uppercase">Game</dt>
                <dd className="mt-0.5 font-display text-lg font-black text-fog">{GAMES[game].label}</dd>
              </div>
              <div className="rounded-md border border-line bg-panel p-3.5">
                <dt className="text-[10px] font-bold tracking-wider text-ash uppercase">Players</dt>
                <dd className="mt-0.5 font-display text-lg font-black text-fog">{filledCount}</dd>
              </div>
              <div className="rounded-md border border-line bg-panel p-3.5">
                <dt className="text-[10px] font-bold tracking-wider text-ash uppercase">League matches</dt>
                <dd className="mt-0.5 font-display text-lg font-black text-fog">{expectedMatchCount(filledCount)}</dd>
              </div>
            </dl>
            <div>
              <p className="mb-1.5 text-xs font-bold tracking-wider text-ash uppercase">Player list</p>
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {trimmed.filter(Boolean).map((p, i) => (
                  <li key={i} className="rounded-sm bg-panel px-3 py-2 text-sm font-semibold text-fog">
                    <span className="mr-2 font-display font-black text-ember">{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-ash">
              Character pool: <strong className="text-fog">{roster.length} {GAMES[game].label} fighters</strong> (
              {roster.filter((c) => c.category === 'base').length} base, {roster.filter((c) => c.category === 'dlc').length} DLC).
              Every match will draw random fighters from this roster only.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="py-4 text-center">
            <Swords size={40} className="mx-auto text-ember" />
            <h2 className="mt-3 font-display text-xl font-black text-fog">Ready to generate</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ash">
              Fixtures will be generated with the circle method — every player faces everyone exactly once across{' '}
              {expectedMatchCount(filledCount)} matches. The starting order is shuffled, and every match gets its
              random fighter draw at generation time.
            </p>
            <button
              onClick={generate}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-blood px-6 py-3.5 font-display text-base font-black tracking-wide text-white uppercase shadow-[0_0_24px_rgba(185,28,28,0.4)] transition-opacity hover:opacity-90"
            >
              <Swords size={18} /> Generate Tournament
            </button>
          </div>
        )}
      </motion.div>

      {/* Wizard nav */}
      <div className="mt-5 flex items-center justify-between gap-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-4 py-3 text-sm font-bold text-fog transition-colors enabled:hover:border-ash disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Back
        </button>
        {step < 3 && (
          <button
            onClick={() => {
              if (step === 0 && !name.trim()) return;
              if (step === 1) {
                setTouched(true);
                if (!canReview) return;
              }
              setStep((s) => s + 1);
            }}
            disabled={step === 0 && !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-ember px-5 py-3 text-sm font-black tracking-wide text-white uppercase transition-opacity enabled:hover:opacity-90 disabled:opacity-40"
          >
            Continue <ChevronRight size={16} />
          </button>
        )}
        {step === 0 && !name.trim() && <span className="sr-only">Enter a tournament name to continue</span>}
      </div>
      {step === 0 && name.trim() === '' && (
        <p className="mt-2 text-right text-xs text-ash">Enter a tournament name to continue.</p>
      )}
    </div>
  );
}
