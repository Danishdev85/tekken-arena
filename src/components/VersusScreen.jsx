import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shuffle, Lock, Trophy, PencilLine } from 'lucide-react';
import CharacterPortrait from './CharacterPortrait';
import Modal from './Modal';
import { getCharacter, gameLabel } from '../utils/roster';

export default function VersusScreen({ tournament, match, playerName, onBack, onRandomize, onLock, onSetWinner }) {
  const [pendingWinner, setPendingWinner] = useState(null);
  const c1 = getCharacter(tournament.game, match.char1Id);
  const c2 = getCharacter(tournament.game, match.char2Id);
  const completed = Boolean(match.winnerId);
  const canRandomize = !match.locked && !completed;

  const title =
    match.phase === 'league'
      ? `Round ${match.round} · Match ${match.number}`
      : match.phase === 'tiebreak'
        ? `Tie-break Decider ${match.number}`
        : match.label;

  const fighter = (pid, character, side) => {
    const isWinner = match.winnerId === pid;
    return (
      <motion.div
        key={`${pid}-${character ? character.id : 'none'}`}
        initial={{ opacity: 0, x: side === 'left' ? -32 : 32, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className={`flex flex-1 flex-col items-center rounded-md border p-4 text-center sm:p-6 ${
          isWinner ? 'border-win/60 bg-win/5' : 'border-line bg-card'
        }`}
      >
        <CharacterPortrait character={character} size="xl" />
        <p className="mt-3 font-display text-lg leading-tight font-black break-words text-fog sm:text-xl">
          {playerName(pid)}
        </p>
        <p className="mt-1 text-sm font-semibold text-ember">{character ? character.name : 'Unknown fighter'}</p>
        {character && (
          <span
            className={`mt-2 rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              character.category === 'dlc' ? 'bg-ember/15 text-ember' : 'bg-win/15 text-win'
            }`}
          >
            {character.category === 'dlc' ? 'DLC Fighter' : 'Base Roster'}
          </span>
        )}
        {isWinner && (
          <span className="mt-3 inline-flex items-center gap-1.5 font-display text-sm font-black tracking-wider text-win uppercase">
            <Trophy size={15} /> Winner
          </span>
        )}
      </motion.div>
    );
  };

  const chooseWinner = (pid) => {
    if (completed && match.winnerId !== pid) {
      setPendingWinner(pid); // correction needs confirmation
    } else if (!completed) {
      onSetWinner(pid);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ash transition-colors hover:text-fog">
        <ArrowLeft size={16} /> Back to matches
      </button>

      <div className="mb-5 text-center">
        <p className="text-[11px] font-bold tracking-[0.25em] text-ember uppercase">
          {tournament.name} · {gameLabel(tournament.game)}
        </p>
        <h2 className="mt-1 font-display text-2xl font-black text-fog sm:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-ash">
          {completed
            ? 'Match completed. Result can be corrected below.'
            : match.locked
              ? 'Fighters locked. Play the match, then record the winner.'
              : 'Randomize the fighters if you like, then start the match to lock them in.'}
        </p>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {fighter(match.player1Id, c1, 'left')}
        <div className="flex shrink-0 items-center justify-center">
          <span className="text-glow-red flex h-14 w-14 items-center justify-center rounded-full border border-blood/60 bg-blood/15 font-display text-lg font-black text-ember">
            VS
          </span>
        </div>
        {fighter(match.player2Id, c2, 'right')}
      </div>

      <div className="mt-6 space-y-4">
        {!completed && (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={onRandomize}
              disabled={!canRandomize}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-panel px-4 py-3 text-sm font-bold text-fog transition-colors enabled:hover:border-ember disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Shuffle size={16} /> Randomize Characters
            </button>
            {!match.locked && (
              <button
                onClick={onLock}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blood px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                <Lock size={16} /> Start Match — Lock Fighters
              </button>
            )}
          </div>
        )}

        <div className="rounded-md border border-line bg-panel p-4">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-wider text-ash uppercase">
            {completed ? <PencilLine size={13} /> : <Trophy size={13} />}
            {completed ? 'Correct the result' : 'Record the winner'}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[match.player1Id, match.player2Id].map((pid) => {
              const isWinner = match.winnerId === pid;
              return (
                <button
                  key={pid}
                  onClick={() => chooseWinner(pid)}
                  className={`rounded-md px-4 py-3 font-display text-sm font-black tracking-wide uppercase transition-colors ${
                    isWinner
                      ? 'bg-win text-white'
                      : 'border border-line bg-card text-fog hover:border-win hover:text-win'
                  }`}
                >
                  {playerName(pid)} {isWinner ? '— Winner' : 'wins'}
                </button>
              );
            })}
          </div>
          {completed && (
            <p className="mt-3 text-xs text-ash">
              Changing a league result recalculates the standings and removes any tie-break or knockout matches that
              were built on the old result.
            </p>
          )}
        </div>
      </div>

      <Modal
        open={pendingWinner !== null}
        title="Correct this result?"
        confirmLabel="Yes, change winner"
        danger
        onClose={() => setPendingWinner(null)}
        onConfirm={() => {
          onSetWinner(pendingWinner);
          setPendingWinner(null);
        }}
      >
        <p>
          The winner will change to <strong className="text-fog">{pendingWinner ? playerName(pendingWinner) : ''}</strong>.
          Standings will be recalculated, and any knockout progression built on the old result will be reset.
        </p>
      </Modal>
    </div>
  );
}
