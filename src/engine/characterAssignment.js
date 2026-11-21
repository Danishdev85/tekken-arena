// Random character assignment engine.
//
// Rules:
// - Characters come only from the selected game's roster.
// - The two opponents in a match always receive different characters.
// - Each player draws from a personal shuffled deck (shuffle without
//   replacement), so a player never repeats a character until their whole
//   pool is exhausted; then the deck is reshuffled and drawing continues.
// - Decks are part of tournament state, so assignments persist across
//   refreshes and are shared between league, tie-break and knockout matches.

export function shuffle(ids, rng = Math.random) {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Create a fresh set of per-player decks from a roster. */
export function createDecks(playerIds, rosterIds, rng = Math.random) {
  const decks = {};
  for (const pid of playerIds) decks[pid] = shuffle(rosterIds, rng);
  return decks;
}

function drawFromDeck(decks, playerId, rosterIds, rng, excludeId = null) {
  let deck = [...(decks[playerId] || [])];
  // Reshuffle when exhausted. If we must exclude one character (the
  // opponent's pick), keep it out of this draw but return it to the deck.
  let heldBack = null;
  if (deck.length === 0) {
    deck = shuffle(rosterIds, rng);
  }
  let idx = deck.findIndex((id) => id !== excludeId);
  if (idx === -1) {
    // Deck only contains the excluded character: hold it back, reshuffle
    // the rest of the roster, draw, then put the held card back.
    heldBack = deck[0];
    deck = shuffle(rosterIds.filter((id) => id !== excludeId), rng);
    idx = 0;
  }
  const [card] = deck.splice(idx, 1);
  if (heldBack !== null) deck.push(heldBack);
  return { card, decks: { ...decks, [playerId]: deck } };
}

/**
 * Draw one character for each side of a match.
 * @returns {{ char1: string, char2: string, decks: object }} new decks (immutable update)
 */
export function drawMatchCharacters(decks, rosterIds, player1Id, player2Id, rng = Math.random) {
  const first = drawFromDeck(decks, player1Id, rosterIds, rng);
  const second = drawFromDeck(first.decks, player2Id, rosterIds, rng, first.card);
  return { char1: first.card, char2: second.card, decks: second.decks };
}

/**
 * Re-draw a single player's character for a match that is not locked yet.
 * The current character returns to the player's deck first, so a redraw
 * cannot silently burn pool cards; the new draw still avoids the old
 * character when the pool allows it, and always avoids the opponent's.
 */
export function redrawCharacter(decks, rosterIds, playerId, currentCharId, opponentCharId, rng = Math.random) {
  let deck = [...(decks[playerId] || [])];
  if (currentCharId && !deck.includes(currentCharId)) {
    const pos = Math.floor(rng() * (deck.length + 1));
    deck.splice(pos, 0, currentCharId);
  }
  const withDeck = { ...decks, [playerId]: deck };
  const avoid = new Set([opponentCharId, currentCharId].filter(Boolean));
  // Try to draw a card that is neither the opponent's nor the previous one.
  let pool = deck.filter((id) => !avoid.has(id));
  if (pool.length === 0) pool = deck.filter((id) => id !== opponentCharId);
  if (pool.length === 0) {
    // Only the opponent's character remains available in-cycle; reshuffle
    // the full roster excluding the opponent's character.
    const fresh = shuffle(rosterIds.filter((id) => id !== opponentCharId), rng);
    const card = fresh[0];
    const rest = fresh.slice(1);
    if (currentCharId && currentCharId !== card && !rest.includes(currentCharId)) rest.push(currentCharId);
    return { char: card, decks: { ...decks, [playerId]: rest } };
  }
  const card = pool[Math.floor(rng() * pool.length)];
  const remaining = deck.filter((id) => id !== card);
  return { char: card, decks: { ...decks, [playerId]: remaining } };
}
