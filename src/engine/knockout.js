// Knockout stage engine.
// Top 4 qualify: Semifinal 1 = Rank 1 vs Rank 4, Semifinal 2 = Rank 2 vs Rank 3.
// Winners meet in the Grand Final. The final winner is the champion.

/**
 * Build semifinal pairings from final standings.
 * @param standings - output of computeStandings (sorted, ranks assigned)
 * @returns [{ key:'SF1', label:'Semifinal 1', player1Id, player2Id },
 *           { key:'SF2', label:'Semifinal 2', player1Id, player2Id }]
 */
export function seedSemifinals(standings) {
  if (!standings || standings.length < 4) {
    throw new Error('Knockout stage needs at least 4 qualified players');
  }
  const [r1, r2, r3, r4] = standings.slice(0, 4);
  return [
    { key: 'SF1', label: 'Semifinal 1', player1Id: r1.playerId, player2Id: r4.playerId },
    { key: 'SF2', label: 'Semifinal 2', player1Id: r2.playerId, player2Id: r3.playerId },
  ];
}

/** Build the Grand Final pairing from two semifinal winners. */
export function seedFinal(winnerSF1, winnerSF2) {
  if (!winnerSF1 || !winnerSF2) {
    throw new Error('Both semifinals must be completed before the final');
  }
  return { key: 'F', label: 'Grand Final', player1Id: winnerSF1, player2Id: winnerSF2 };
}

/**
 * Given all knockout matches, work out the bracket state.
 * @returns {{ sf1, sf2, final, championId }}
 */
export function bracketState(matches) {
  const sf1 = matches.find((m) => m.phase === 'semifinal' && m.key === 'SF1') || null;
  const sf2 = matches.find((m) => m.phase === 'semifinal' && m.key === 'SF2') || null;
  const final = matches.find((m) => m.phase === 'final') || null;
  const championId = final && final.winnerId ? final.winnerId : null;
  return { sf1, sf2, final, championId };
}
