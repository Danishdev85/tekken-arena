import { useRef, useState } from 'react';
import { Upload, FileJson, Trash2, Play, LayoutDashboard, Trophy } from 'lucide-react';
import Modal from '../components/Modal';
import { computeProgress } from '../engine/tournamentProgress';
import { gameLabel } from '../utils/roster';
import { downloadJSON, readJSONFile, validateTournament } from '../utils/jsonIO';

export default function TournamentHistory({ tournaments, arena, navigate, openTournament }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [importError, setImportError] = useState('');
  const fileRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setImportError('');
    try {
      const obj = await readJSONFile(file);
      const check = validateTournament(obj);
      if (!check.ok) {
        setImportError(check.error);
        return;
      }
      const exists = tournaments.some((t) => t.id === obj.id);
      if (exists) {
        setPendingImport(obj); // ask overwrite vs copy
      } else {
        arena.importTournament(obj, 'copy');
      }
    } catch (err) {
      setImportError(err.message || 'Import failed.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black tracking-wide text-fog uppercase sm:text-3xl">Tournament History</h1>
          <p className="mt-1 text-sm text-ash">Every tournament stored in this browser. Resume, export or delete them here.</p>
        </div>
        <button
          onClick={() => fileRef.current && fileRef.current.click()}
          className="inline-flex items-center gap-2 rounded-md bg-ember px-4 py-3 text-sm font-black tracking-wide text-white uppercase hover:opacity-90"
        >
          <Upload size={16} /> Import JSON
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} aria-label="Import tournament JSON file" />
      </div>

      {importError && (
        <p className="rounded-md border border-blood/50 bg-blood/10 px-4 py-3 text-sm font-semibold text-red-300" role="alert">
          Import failed: {importError}
        </p>
      )}

      {tournaments.length === 0 ? (
        <div className="rounded-md border border-dashed border-line bg-panel p-8 text-center">
          <p className="text-sm text-ash">No tournaments stored yet.</p>
          <button onClick={() => navigate('create')} className="mt-3 rounded-md bg-blood px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">
            Create your first tournament
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...tournaments]
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((t) => {
              const prog = computeProgress(t);
              const champion = t.championId ? t.players.find((p) => p.id === t.championId) : null;
              return (
                <article key={t.id} className="flex flex-col rounded-md border border-line bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="min-w-0 font-display text-base leading-snug font-black break-words text-fog">{t.name}</h2>
                    <span className="shrink-0 rounded-sm bg-panel px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-ash uppercase">
                      {gameLabel(t.game)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ash">
                    {t.players.length} players · {new Date(t.createdAt).toLocaleDateString()} ·{' '}
                    {t.status === 'completed' ? 'Completed' : t.status === 'knockout' ? 'Knockout stage' : 'In progress'}
                  </p>
                  {champion && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-ember">
                      <Trophy size={12} /> Champion: {champion.name}
                    </p>
                  )}
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel">
                    <div className="h-full bg-gradient-to-r from-blood to-ember" style={{ width: `${prog.percent}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-ash">
                    {prog.completedMatches}/{prog.totalMatches} matches · {prog.percent}%
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => openTournament(t.id, 'dashboard')}
                      className="inline-flex items-center gap-1.5 rounded-md bg-blood px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                    >
                      <LayoutDashboard size={13} /> Open
                    </button>
                    <button
                      onClick={() => openTournament(t.id, 'matches')}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-2 text-xs font-bold text-fog hover:border-ash"
                    >
                      <Play size={13} /> Resume
                    </button>
                    <button
                      onClick={() => downloadJSON(t)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-2 text-xs font-bold text-fog hover:border-ash"
                    >
                      <FileJson size={13} /> Export
                    </button>
                    <button
                      onClick={() => setPendingDelete(t)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-blood/50 bg-panel px-3 py-2 text-xs font-bold text-blood hover:bg-blood/10"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </article>
              );
            })}
        </div>
      )}

      <Modal
        open={pendingDelete !== null}
        title="Delete this tournament?"
        confirmLabel="Delete tournament"
        danger
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          arena.remove(pendingDelete.id);
          setPendingDelete(null);
        }}
      >
        <p>
          <strong className="text-fog">{pendingDelete ? pendingDelete.name : ''}</strong> will be permanently removed
          from this browser. This cannot be undone.
        </p>
      </Modal>

      <Modal
        open={pendingImport !== null}
        title="Tournament already exists"
        confirmLabel="Overwrite stored tournament"
        danger
        onClose={() => setPendingImport(null)}
        onConfirm={() => {
          if (pendingImport) arena.importTournament(pendingImport, 'overwrite');
          setPendingImport(null);
        }}
      >
        <p>
          A tournament with the same ID (<strong className="text-fog">{pendingImport ? pendingImport.name : ''}</strong>)
          is already stored. Overwriting replaces the stored tournament with the imported file and cannot be undone.
          Cancel keeps your stored tournament untouched.
        </p>
        <button
          onClick={() => {
            if (pendingImport) arena.importTournament(pendingImport, 'copy');
            setPendingImport(null);
          }}
          className="mt-3 rounded-md border border-line bg-panel px-3.5 py-2.5 text-sm font-bold text-fog transition-colors hover:border-ember"
        >
          Import as a separate copy instead
        </button>
      </Modal>
    </div>
  );
}
