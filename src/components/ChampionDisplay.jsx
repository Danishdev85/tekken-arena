import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Trophy, FileDown, RotateCcw, LayoutDashboard, FileJson } from 'lucide-react';
import CharacterPortrait from './CharacterPortrait';
import { getCharacter, gameLabel } from '../utils/roster';

export default function ChampionDisplay({ tournament, standings, onDownloadPDF, onExportJSON, onRestart, onDashboard }) {
  const reduce = useReducedMotion();
  const champion = tournament.players.find((p) => p.id === tournament.championId);
  const final = tournament.matches.find((m) => m.phase === 'final');
  const finalChar = final
    ? getCharacter(tournament.game, final.player1Id === tournament.championId ? final.char1Id : final.char2Id)
    : null;
  const opponentId = final
    ? final.player1Id === tournament.championId
      ? final.player2Id
      : final.player1Id
    : null;
  const opponent = tournament.players.find((p) => p.id === opponentId);
  const champRow = standings.find((r) => r.playerId === tournament.championId);

  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: (i * 37) % 100,
        delay: (i % 9) * 0.35,
        size: 3 + (i % 4),
        duration: 3.4 + (i % 5) * 0.6,
      })),
    [],
  );

  if (!champion) return null;

  return (
    <div className="combat-bg relative overflow-hidden rounded-md border border-ember/40 px-4 py-10 text-center sm:px-8">
      {!reduce &&
        particles.map((p) => (
          <motion.span
            key={p.id}
            className="pointer-events-none absolute rounded-full bg-ember"
            style={{ left: `${p.x}%`, width: p.size, height: p.size, bottom: -8 }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -420, opacity: [0, 0.9, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35 }}>
        <Trophy size={52} className="mx-auto text-ember" />
        <p className="mt-3 text-[11px] font-bold tracking-[0.3em] text-ember uppercase">Tournament Champion</p>
        <h2 className="text-glow-red mt-2 font-display text-4xl font-black break-words text-fog sm:text-5xl">
          {champion.name}
        </h2>
        <p className="mt-2 text-sm text-ash">
          {tournament.name} · {gameLabel(tournament.game)}
        </p>
      </motion.div>

      <div className="mx-auto mt-8 flex max-w-lg flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="text-center">
          <CharacterPortrait character={finalChar} size="lg" className="mx-auto" />
          <p className="mt-2 text-xs font-bold tracking-wider text-ash uppercase">Winning fighter</p>
          <p className="font-display text-base font-bold text-fog">{finalChar ? finalChar.name : '—'}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="rounded-md border border-line bg-card px-4 py-3">
            <p className="text-[10px] font-bold tracking-wider text-ash uppercase">Final opponent</p>
            <p className="font-display text-base font-bold text-fog">{opponent ? opponent.name : '—'}</p>
          </div>
          <div className="rounded-md border border-line bg-card px-4 py-3">
            <p className="text-[10px] font-bold tracking-wider text-ash uppercase">Total wins</p>
            <p className="font-display text-base font-bold text-fog">{champRow ? champRow.wins : '—'}</p>
          </div>
          <div className="rounded-md border border-line bg-card px-4 py-3">
            <p className="text-[10px] font-bold tracking-wider text-ash uppercase">Matches played</p>
            <p className="font-display text-base font-bold text-fog">{champRow ? champRow.played : '—'}</p>
          </div>
          <div className="rounded-md border border-line bg-card px-4 py-3">
            <p className="text-[10px] font-bold tracking-wider text-ash uppercase">Win rate</p>
            <p className="font-display text-base font-bold text-fog">
              {champRow ? `${Math.round(champRow.winPct * 100)}%` : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <button onClick={onDownloadPDF} className="flex items-center gap-2 rounded-md bg-blood px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
          <FileDown size={16} /> Download results PDF
        </button>
        <button onClick={onExportJSON} className="flex items-center gap-2 rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-fog transition-colors hover:border-ash">
          <FileJson size={16} /> Export summary (JSON)
        </button>
        <button onClick={onRestart} className="flex items-center gap-2 rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-fog transition-colors hover:border-ash">
          <RotateCcw size={16} /> Restart tournament
        </button>
        <button onClick={onDashboard} className="flex items-center gap-2 rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-fog transition-colors hover:border-ash">
          <LayoutDashboard size={16} /> Return to dashboard
        </button>
      </div>
    </div>
  );
}
