import { useState } from 'react';
import { portraitUrl } from '../utils/roster';

const GAME_ACCENT = {
  tekken7: '#B91C1C',
  tekken8: '#F97316',
};

/**
 * Character portrait with a designed placeholder fallback.
 * Tries the real portrait path first; on error (or no path) renders a
 * dark card with the character's initials in the game's accent color.
 * A missing image never shows a broken-image icon.
 */
export default function CharacterPortrait({ character, size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false);
  const sizes = {
    sm: 'h-12 w-12 text-sm',
    md: 'h-20 w-20 text-xl',
    lg: 'h-32 w-32 text-3xl',
    xl: 'h-44 w-44 text-5xl',
    card: 'h-full w-full text-4xl',
  };
  const cls = sizes[size] || sizes.md;

  if (!character) {
    return (
      <div className={`${cls} flex items-center justify-center rounded-md bg-panel text-ash ${className}`} aria-hidden>
        ?
      </div>
    );
  }

  const initials = character.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const accent = GAME_ACCENT[character.game] || '#F97316';
  const url = portraitUrl(character);

  if (!url || failed) {
    return (
      <div
        className={`${cls} relative flex items-center justify-center overflow-hidden rounded-md bg-panel ${className}`}
        style={{ boxShadow: `inset 0 0 0 1px #27272A, inset 0 -24px 32px -16px ${accent}55` }}
        role="img"
        aria-label={character.name}
      >
        <span className="font-display font-black tracking-wide" style={{ color: accent }}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={character.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${cls} rounded-md object-cover ${className}`}
      style={{ boxShadow: 'inset 0 0 0 1px #27272A' }}
    />
  );
}
