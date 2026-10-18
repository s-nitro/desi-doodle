// Pure game helpers (no Firebase here) so the rules are easy to read and test.
import { CATEGORIES, ALL_CATS, ANSWERS } from '../data/words';

export const MAX_PLAYERS = 10;
export const CHOOSE_MS = 15000; // time the drawer gets to pick a word
export const TURN_END_MS = 6000; // pause that reveals the word between turns
export const DRAWER_PTS = 40; // drawer earns this per correct guesser
export const DEFAULT_SETTINGS = { rounds: 3, drawSeconds: 80, cats: ALL_CATS };

export const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
export const keyOf = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, '_');
export const isAlnum = (c) => /[a-z0-9]/i.test(c);
export const answersFor = (w) => ANSWERS[w] || [w];

export function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── players ──
export const listPlayers = (players, scores) =>
  Object.entries(players || {})
    .filter(([, p]) => p && p.name)
    .map(([id, p]) => ({ id, ...p, score: scores?.[id] || 0 }));
export const connectedIds = (players) => listPlayers(players).filter((p) => p.connected).map((p) => p.id);
export const isConnected = (players, id) => !!players?.[id]?.connected;
// Host = longest-present connected player. Computed, never stored, so host migration is automatic.
export const hostId = (players) =>
  listPlayers(players)
    .filter((p) => p.connected)
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0) || (a.id < b.id ? -1 : 1))[0]?.id;

// ── words & hints ──
export function pickChoices(cats, used = {}) {
  const pool = (cats?.length ? cats : ALL_CATS).flatMap((k) => (CATEGORIES[k]?.words || []).map((e) => e[0]));
  let fresh = pool.filter((w) => !used?.[keyOf(w)]);
  if (fresh.length < 3) fresh = pool;
  return shuffle(fresh).slice(0, 3);
}
export const makeHint = (w) => [...w].map((c) => (isAlnum(c) ? '_' : c)).join('');
export function revealOne(word, hint) {
  const hidden = [...hint].map((c, i) => (c === '_' ? i : -1)).filter((i) => i >= 0);
  if (!hidden.length) return hint;
  const i = hidden[Math.floor(Math.random() * hidden.length)];
  const h = [...hint];
  h[i] = [...word][i];
  return h.join('');
}
export const guessPoints = (leftMs, totalMs) => Math.round(100 + (300 * Math.max(0, leftMs)) / totalMs);

// ── turn order ──
// Returns the next drawer (and round/order), or {end:true} when all rounds are done.
export function planNext(state, players, settings, fresh) {
  let round = fresh ? 1 : state.round;
  let order = fresh ? shuffle(connectedIds(players)) : state.order || [];
  let idx = fresh ? 0 : (state.turnIdx ?? -1) + 1;
  for (;;) {
    while (idx < order.length && !isConnected(players, order[idx])) idx++;
    if (idx < order.length) return { round, order, turnIdx: idx, drawerId: order[idx] };
    round++;
    if (round > settings.rounds) return { end: true };
    order = shuffle(connectedIds(players));
    idx = 0;
    if (!order.length) return { end: true };
  }
}
