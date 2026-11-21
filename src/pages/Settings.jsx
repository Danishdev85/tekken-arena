import { useState } from 'react';
import { Trash2, Info, Database, Image as ImageIcon } from 'lucide-react';
import Modal from '../components/Modal';
import { GAMES } from '../utils/roster';

export default function Settings({ arena, tournaments, navigate }) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-black tracking-wide text-fog uppercase sm:text-3xl">Settings / About</h1>
        <p className="mt-1 text-sm text-ash">About TEKKEN ARENA, your stored data, and project information.</p>
      </div>

      <section className="rounded-md border border-line bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-black tracking-wide text-fog uppercase">
          <Info size={17} className="text-ember" /> About
        </h2>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-ash">
          <p>
            TEKKEN ARENA is a browser-based tournament manager for Tekken 7 and Tekken 8. Create round-robin
            tournaments for 5 to 50 players, draw random fighters for every match, track live standings, resolve real
            ties with decider matches, and crown a champion through semifinals and a Grand Final.
          </p>
          <p>
            There are no accounts and no sign-up: everything runs in your browser and is stored only on this device.
          </p>
        </div>
      </section>

      <section className="rounded-md border border-line bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-black tracking-wide text-fog uppercase">
          <Database size={17} className="text-ember" /> Your data
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ash">
          {tournaments.length === 0
            ? 'No tournaments are currently stored in this browser.'
            : `${tournaments.length} tournament${tournaments.length === 1 ? ' is' : 's are'} stored in this browser (LocalStorage). They survive refreshes and browser restarts on this device, and are never sent to a server.`}
        </p>
        <button
          onClick={() => setConfirmClear(true)}
          disabled={tournaments.length === 0}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-blood/50 bg-panel px-4 py-2.5 text-sm font-bold text-blood transition-colors enabled:hover:bg-blood/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={15} /> Clear all tournament data
        </button>
      </section>

      <section className="rounded-md border border-line bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-black tracking-wide text-fog uppercase">
          <ImageIcon size={17} className="text-ember" /> Rosters & portraits
        </h2>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-ash">
          {Object.values(GAMES).map((g) => (
            <p key={g.id}>
              <strong className="text-fog">{g.label}:</strong> {g.roster.length} fighters (
              {g.roster.filter((c) => c.category === 'base').length} base,{' '}
              {g.roster.filter((c) => c.category === 'dlc').length} DLC).
            </p>
          ))}
          <p>
            Character portraits are loaded from{' '}
            <code className="break-all text-fog">/assets/characters/&lt;game&gt;/&lt;fighter&gt;.webp</code>.
            Drop properly licensed images with those file names into the project&apos;s public assets folder and they
            appear automatically; until then, every fighter shows a designed placeholder with their initials. See the
            project README for attribution and replacement instructions.
          </p>
        </div>
      </section>

      <section className="rounded-md border border-line bg-card p-5">
        <h2 className="font-display text-base font-black tracking-wide text-fog uppercase">Disclaimer</h2>
        <p className="mt-2 text-sm leading-relaxed text-ash">
          TEKKEN ARENA is an unofficial, fan-made tool built for community tournament organizers. TEKKEN, Tekken 7
          and Tekken 8 are trademarks of Bandai Namco Entertainment Inc. This project is not affiliated with,
          sponsored, or endorsed by Bandai Namco. The original code of this project is released under the MIT License.
        </p>
      </section>

      <Modal
        open={confirmClear}
        title="Clear all tournament data?"
        confirmLabel="Clear everything"
        danger
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          arena.clearAll();
          setConfirmClear(false);
          navigate('home');
        }}
      >
        <p>
          Every stored tournament, result and ranking in this browser will be permanently deleted. Export anything
          you want to keep as JSON first. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
