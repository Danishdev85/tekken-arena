import { Crown, AlertTriangle } from 'lucide-react';

/**
 * Standings table. Wrapped in a horizontal scroller so it never forces
 * page-level horizontal scroll on small screens.
 */
export default function Leaderboard({ standings, qualifyCount = 4, leagueComplete = false, championId = null }) {
  return (
    <div className="nice-scroll overflow-x-auto rounded-md border border-line">
      <table className="w-full min-w-[600px] border-collapse bg-card text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] tracking-wider text-ash uppercase">
            <th className="px-3 py-2.5 font-bold">Rank</th>
            <th className="px-3 py-2.5 font-bold">Player</th>
            <th className="px-3 py-2.5 text-center font-bold">P</th>
            <th className="px-3 py-2.5 text-center font-bold">W</th>
            <th className="px-3 py-2.5 text-center font-bold">L</th>
            <th className="px-3 py-2.5 text-center font-bold">Win %</th>
            <th className="px-3 py-2.5 text-center font-bold">Pts</th>
            <th className="px-3 py-2.5 font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => {
            const isLeader = row.rank === 1 && row.played > 0;
            const qualified = row.rank <= qualifyCount;
            const eliminated = leagueComplete && !qualified && !championId;
            const isChampion = championId === row.playerId;
            return (
              <tr
                key={row.playerId}
                className={`border-b border-line/60 last:border-0 ${
                  isChampion ? 'bg-ember/10' : qualified && leagueComplete ? 'bg-win/5' : ''
                } ${eliminated ? 'opacity-55' : ''}`}
              >
                <td className="px-3 py-2.5">
                  <span className={`font-display text-base font-black ${row.rank <= qualifyCount ? 'text-ember' : 'text-ash'}`}>
                    {row.rank}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-1.5 font-bold text-fog">
                    {row.name}
                    {isLeader && <Crown size={14} className="text-ember" aria-label="Current leader" />}
                    {isChampion && <Crown size={14} className="text-ember" aria-label="Champion" />}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center text-ash">{row.played}</td>
                <td className="px-3 py-2.5 text-center font-semibold text-fog">{row.wins}</td>
                <td className="px-3 py-2.5 text-center text-ash">{row.losses}</td>
                <td className="px-3 py-2.5 text-center text-ash">{Math.round(row.winPct * 100)}%</td>
                <td className="px-3 py-2.5 text-center font-display text-base font-black text-fog">{row.points}</td>
                <td className="px-3 py-2.5">
                  {row.tieGroupId ? (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-warn/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-warn uppercase">
                      <AlertTriangle size={11} /> Tied
                    </span>
                  ) : isChampion ? (
                    <span className="rounded-sm bg-ember/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-ember uppercase">Champion</span>
                  ) : leagueComplete && qualified ? (
                    <span className="rounded-sm bg-win/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-win uppercase">Qualified</span>
                  ) : eliminated ? (
                    <span className="rounded-sm bg-panel px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-ash uppercase">Eliminated</span>
                  ) : qualified ? (
                    <span className="rounded-sm bg-win/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-win uppercase">Top 4</span>
                  ) : (
                    <span className="text-[11px] text-ash">Competing</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
