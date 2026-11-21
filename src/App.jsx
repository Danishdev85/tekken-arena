import { useCallback, useMemo, useState } from 'react';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { useTournaments } from './hooks/useTournaments';
import { Sidebar, MobileHeader, MobileNav } from './components/Navbar';
import Home from './pages/Home';
import CreateTournament from './pages/CreateTournament';
import TournamentDashboard from './pages/TournamentDashboard';
import MatchCenter from './pages/MatchCenter';
import LeaderboardPage from './pages/LeaderboardPage';
import KnockoutPage from './pages/KnockoutPage';
import CharacterCollection from './pages/CharacterCollection';
import TournamentHistory from './pages/TournamentHistory';
import Settings from './pages/Settings';

const TOURNAMENT_VIEWS = ['dashboard', 'matches', 'leaderboard', 'knockout'];

export default function App() {
  const arena = useTournaments();
  const [route, setRoute] = useState({ view: 'home', tournamentId: null, matchId: null, game: null });

  const tournament = useMemo(() => {
    if (route.tournamentId) {
      const found = arena.tournaments.find((t) => t.id === route.tournamentId);
      if (found) return found;
    }
    return arena.tournaments[0] || null;
  }, [arena.tournaments, route.tournamentId]);

  const navigate = useCallback((view, extra = {}) => {
    setRoute((prev) => ({
      view,
      tournamentId: extra.tournamentId !== undefined ? extra.tournamentId : prev.tournamentId,
      matchId: null,
      game: extra.game !== undefined ? extra.game : null,
    }));
  }, []);

  const openTournament = useCallback((id, view = 'dashboard') => {
    setRoute({ view, tournamentId: id, matchId: null, game: null });
  }, []);

  const openMatch = useCallback((match) => {
    setRoute((prev) => ({ ...prev, view: 'matches', matchId: match.id }));
  }, []);

  const clearMatch = useCallback(() => {
    setRoute((prev) => ({ ...prev, matchId: null }));
  }, []);

  const needsTournament = TOURNAMENT_VIEWS.includes(route.view);
  const effectiveView = needsTournament && !tournament ? 'home' : route.view;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-abyss text-fog">
        <Sidebar route={route} navigate={navigate} hasTournament={Boolean(tournament)} />
        <MobileHeader navigate={navigate} />
        <main className="px-4 pt-5 pb-24 sm:px-6 lg:ml-64 lg:px-8 lg:pt-8 lg:pb-10">
          <div className="mx-auto w-full max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={effectiveView + (tournament ? tournament.id : '') + (route.matchId || '')}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
              >
                {effectiveView === 'home' && (
                  <Home tournaments={arena.tournaments} navigate={navigate} openTournament={openTournament} />
                )}
                {effectiveView === 'create' && (
                  <CreateTournament
                    arena={arena}
                    navigate={navigate}
                    openTournament={openTournament}
                    initialGame={route.game}
                  />
                )}
                {effectiveView === 'dashboard' && tournament && (
                  <TournamentDashboard tournament={tournament} arena={arena} navigate={navigate} openMatch={openMatch} />
                )}
                {effectiveView === 'matches' && tournament && (
                  <MatchCenter
                    tournament={tournament}
                    arena={arena}
                    route={route}
                    openMatch={openMatch}
                    clearMatch={clearMatch}
                  />
                )}
                {effectiveView === 'leaderboard' && tournament && (
                  <LeaderboardPage tournament={tournament} arena={arena} navigate={navigate} />
                )}
                {effectiveView === 'knockout' && tournament && (
                  <KnockoutPage tournament={tournament} arena={arena} navigate={navigate} openMatch={openMatch} />
                )}
                {effectiveView === 'characters' && <CharacterCollection />}
                {effectiveView === 'history' && (
                  <TournamentHistory
                    tournaments={arena.tournaments}
                    arena={arena}
                    navigate={navigate}
                    openTournament={openTournament}
                  />
                )}
                {effectiveView === 'settings' && (
                  <Settings arena={arena} tournaments={arena.tournaments} navigate={navigate} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <MobileNav route={route} navigate={navigate} hasTournament={Boolean(tournament)} />
      </div>
    </MotionConfig>
  );
}
