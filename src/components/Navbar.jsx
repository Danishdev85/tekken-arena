import { useState } from 'react';
import {
  Home, PlusCircle, LayoutDashboard, Swords, Trophy, GitBranch, Users, History, Settings, Menu, X, Zap,
} from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'create', label: 'Create Tournament', icon: PlusCircle },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, needsTournament: true },
  { key: 'matches', label: 'Match Center', icon: Swords, needsTournament: true },
  { key: 'leaderboard', label: 'Leaderboard', icon: Trophy, needsTournament: true },
  { key: 'knockout', label: 'Knockout Bracket', icon: GitBranch, needsTournament: true },
  { key: 'characters', label: 'Characters', icon: Users },
  { key: 'history', label: 'History', icon: History },
  { key: 'settings', label: 'Settings / About', icon: Settings },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blood">
        <Zap size={20} className="text-white" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-base font-black tracking-wide text-fog">
          TEKKEN <span className="text-ember">ARENA</span>
        </span>
        <span className="block text-[9px] font-bold tracking-[0.22em] text-ash uppercase">Create · Fight · Rank · Dominate</span>
      </span>
    </div>
  );
}

export function Sidebar({ route, navigate, hasTournament }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-panel lg:flex">
      <div className="border-b border-line p-4">
        <Brand />
      </div>
      <nav className="nice-scroll flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const disabled = item.needsTournament && !hasTournament;
          const active = route.view === item.key;
          return (
            <button
              key={item.key}
              disabled={disabled}
              onClick={() => navigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-blood/15 text-fog shadow-[inset_2px_0_0_0_#F97316]'
                  : disabled
                    ? 'cursor-not-allowed text-ash/40'
                    : 'text-ash hover:bg-card hover:text-fog'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-line p-4 text-[11px] leading-relaxed text-ash">
        Fan-made tool. Not affiliated with Bandai Namco Entertainment.
      </div>
    </aside>
  );
}

export function MobileHeader({ navigate }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => navigate('home')} aria-label="Tekken Arena home">
          <Brand />
        </button>
      </div>
    </header>
  );
}

export function MobileNav({ route, navigate, hasTournament }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = NAV_ITEMS.filter((i) => ['home', 'create', 'dashboard', 'matches'].includes(i.key));
  const secondary = NAV_ITEMS.filter((i) => !['home', 'create', 'dashboard', 'matches'].includes(i.key));
  const secondaryActive = secondary.some((i) => i.key === route.view);

  const itemCls = (active, disabled) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-bold ${
      disabled ? 'cursor-not-allowed text-ash/40' : active ? 'text-ember' : 'text-ash'
    }`;

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute right-3 bottom-20 left-3 rounded-md border border-line bg-card p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {secondary.map((item) => {
              const Icon = item.icon;
              const disabled = item.needsTournament && !hasTournament;
              return (
                <button
                  key={item.key}
                  disabled={disabled}
                  onClick={() => {
                    setMoreOpen(false);
                    navigate(item.key);
                  }}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold ${
                    route.view === item.key ? 'bg-blood/15 text-fog' : disabled ? 'text-ash/40' : 'text-ash'
                  }`}
                >
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <nav
        className="fixed right-0 bottom-0 left-0 z-40 flex border-t border-line bg-panel pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Mobile navigation"
      >
        {primary.map((item) => {
          const Icon = item.icon;
          const disabled = item.needsTournament && !hasTournament;
          return (
            <button
              key={item.key}
              disabled={disabled}
              onClick={() => navigate(item.key)}
              className={itemCls(route.view === item.key, disabled)}
            >
              <Icon size={20} />
              {item.key === 'dashboard' ? 'Dashboard' : item.key === 'matches' ? 'Matches' : item.label.split(' ')[0]}
            </button>
          );
        })}
        <button onClick={() => setMoreOpen((v) => !v)} className={itemCls(secondaryActive || moreOpen, false)}>
          {moreOpen ? <X size={20} /> : <Menu size={20} />}
          More
        </button>
      </nav>
    </>
  );
}
