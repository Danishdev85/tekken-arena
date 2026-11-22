# TEKKEN ARENA

**Create. Fight. Rank. Dominate.**

A browser-based tournament management platform for **Tekken 7** and **Tekken 8**. Create round-robin tournaments, draw random fighters for every match, record winners, watch live rankings, resolve real ties with decider matches, and crown a champion through semifinals and a Grand Final.

No backend, no accounts, no sign-up — direct access. Everything runs in the browser and persists in LocalStorage.

## Screenshots

_Add screenshots of the Home page, Match Center versus screen, Leaderboard and Knockout Bracket here after your first deployment._

## Features

- **Two games, two rosters** — Tekken 7 (51 fighters) and Tekken 8 (43 fighters) in separate JSON datasets; rosters are never mixed and unreleased fighters are never assigned.
- **Tournament wizard** — name, game, and 5–50 players with duplicate/empty-name validation.
- **Round-robin engine** — circle-method fixtures: every player plays everyone exactly once, `N(N-1)/2` matches, byes for odd player counts (a bye is never a win).
- **Random character assignment** — each match draws a fighter per player from the selected game only; opponents always differ; per-player shuffle-without-replacement means no repeats until a player's whole pool is used, then a reshuffle. Assignments persist across refreshes. Fighters can be re-randomized until the match is started (locked).
- **Match Center** — round-grouped fixtures with pagination, a dramatic versus screen with reveal animation, organizer-recorded winners, and result correction with confirmation. Correcting a league result recalculates standings and resets any tie-break/knockout progression built on it.
- **Live leaderboard** — win = 3 points. Ranking: points, head-to-head, win percentage, then decider results. Genuine ties are flagged, never silently ordered; a tie at the top-4 boundary generates organizer decider matches.
- **Knockout stage** — Rank 1 vs Rank 4 and Rank 2 vs Rank 3 semifinals, Grand Final, and a championship screen with the winner's final fighter, stats, PDF results download and JSON export.
- **Character collection** — browse and search both rosters with base/DLC filters (browse only; fighters are never hand-picked for matches).
- **Persistence & portability** — LocalStorage storage, resume after refresh, delete with confirmation, export/import tournament JSON with validation and overwrite protection.
- **Responsive** — desktop sidebar, mobile bottom navigation, stacking versus cards, horizontally scrollable leaderboard/bracket on small screens. Animations respect `prefers-reduced-motion`.

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Run the engine unit tests:

```bash
npm run test
```

## Deployment (GitHub Pages)

The Vite base is `./`, so the build works from any Pages path. A ready-made workflow lives in `.github/workflows/deploy.yml`: push to `main`, enable **Settings → Pages → Source: GitHub Actions**, and the site deploys automatically.

## Project structure

```
src/
  components/   Navbar, MatchCard, VersusScreen, Leaderboard, Bracket,
                ChampionDisplay, CharacterCard, CharacterPortrait, Modal
  pages/        Home, CreateTournament, TournamentDashboard, MatchCenter,
                LeaderboardPage, KnockoutPage, CharacterCollection,
                TournamentHistory, Settings
  engine/       roundRobin.js, characterAssignment.js, ranking.js,
                knockout.js, tournamentProgress.js  (pure, unit-tested)
  hooks/        useTournaments.js (state + all tournament actions)
  utils/        roster.js, storage.js, exportPDF.js, jsonIO.js
  data/         tekken7.json (51 fighters), tekken8.json (43 fighters)
  styles/       globals.css (Dark Combat design tokens)
tests/          engine.test.js (Vitest)
public/assets/characters/tekken7|tekken8/   (portrait drop-in folders)
```

## Character portraits & attribution

The character portraits included in this repository are official Tekken 7 and Tekken 8 artwork, **© Bandai Namco Entertainment Inc.**, sourced from the [Tekken Wiki](https://tekken.fandom.com). All rights to these images belong to Bandai Namco Entertainment Inc. and their respective owners. They are included only for this unofficial, non-commercial fan project; no ownership or rights over them are claimed. If you are a rights holder and would like them removed, please open an issue and they will be taken down promptly.

Portrait paths follow the pattern:

```
/assets/characters/tekken7/<fighter-slug>.webp
/assets/characters/tekken8/<fighter-slug>.webp
```

Any fighter without an image shows a designed placeholder (initials on a dark card in the game's accent color) — the interface never shows a broken image.

To update a roster (for example when a new DLC fighter releases), edit `src/data/tekken7.json` or `src/data/tekken8.json`: add an entry with a unique `id`, `name`, `game`, `category` (`base` or `dlc`), `portrait` path and `available: true`.

## Fan-project disclaimer

TEKKEN ARENA is an unofficial, fan-made tool for community tournament organizers. TEKKEN, Tekken 7 and Tekken 8 are trademarks of Bandai Namco Entertainment Inc. This project is not affiliated with, sponsored, or endorsed by Bandai Namco Entertainment.

## License

The original code of this project is released under the [MIT License](LICENSE). The MIT license covers the code only — it does not grant any rights to Bandai Namco's trademarks, characters, or artwork.
