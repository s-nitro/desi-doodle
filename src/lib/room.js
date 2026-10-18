// Every Firebase write for a room lives here. Components/hooks call these.
import { ref, get, set, update, push, onValue, onDisconnect, serverTimestamp, increment } from 'firebase/database';
import { db } from '../firebase';
import { DEFAULT_SETTINGS, MAX_PLAYERS, CHOOSE_MS, TURN_END_MS, planNext } from './game';

const R = (code) => `rooms/${code}`;
const PLAYER_COLORS = ['#e63946', '#f77f00', '#2a9d4f', '#118ab2', '#9d4edd', '#e84a7f', '#7f4f24', '#06a77d'];
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const newCode = () => Array.from({ length: 5 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
const mkPlayer = (name) => ({
  name,
  connected: true,
  joinedAt: serverTimestamp(),
  color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
});

export async function createRoom(uid, name) {
  let code = newCode();
  for (let i = 0; i < 5; i++) {
    if (!(await get(ref(db, `${R(code)}/state`))).exists()) break;
    code = newCode();
  }
  // Order matters: security rules need the player to exist before state/settings can be written.
  await set(ref(db, `${R(code)}/players/${uid}`), mkPlayer(name));
  await set(ref(db, `${R(code)}/settings`), DEFAULT_SETTINGS);
  await set(ref(db, `${R(code)}/state`), { phase: 'lobby', turn: 0, round: 0 });
  return code;
}

// Idempotent: also used to re-join after a page refresh.
export async function joinRoom(code, uid, name) {
  if (!(await get(ref(db, `${R(code)}/state`))).exists()) throw new Error(`Room ${code} not found`);
  const me = await get(ref(db, `${R(code)}/players/${uid}`));
  if (me.exists() && me.val().name) return update(ref(db, `${R(code)}/players/${uid}`), { name, connected: true });
  const all = (await get(ref(db, `${R(code)}/players`))).val() || {};
  if (Object.values(all).filter((p) => p.connected).length >= MAX_PLAYERS) throw new Error('This room is full');
  await set(ref(db, `${R(code)}/players/${uid}`), mkPlayer(name));
}

export function watchPresence(code, uid) {
  const p = ref(db, `${R(code)}/players/${uid}/connected`);
  const off = onValue(ref(db, '.info/connected'), (s) => {
    if (s.val()) {
      onDisconnect(p).set(false);
      set(p, true);
    }
  });
  return () => {
    off();
    onDisconnect(p).cancel();
  };
}

export async function leaveRoom(code, uid) {
  await onDisconnect(ref(db, `${R(code)}/players/${uid}/connected`)).cancel();
  await update(ref(db, R(code)), { [`players/${uid}`]: null, [`scores/${uid}`]: null });
}

export const updateSettings = (code, patch) => update(ref(db, `${R(code)}/settings`), patch);

export const say = (code, msg) => push(ref(db, `${R(code)}/chat`), { ...msg, ts: serverTimestamp() });

// ── host-driven state transitions ──
export function beginTurn(code, plan, now, extra = {}) {
  return update(ref(db, R(code)), {
    'state/phase': 'choosing',
    'state/round': plan.round,
    'state/order': plan.order,
    'state/turnIdx': plan.turnIdx,
    'state/drawerId': plan.drawerId,
    'state/turn': increment(1),
    'state/phaseEndsAt': now + CHOOSE_MS,
    'state/hint': null,
    'state/guessed': null,
    'state/lastWord': null,
    draw: null,
    guesses: null,
    ...extra,
  });
}

export async function startGame(code, players, settings, now) {
  const plan = planNext(null, players, settings, true);
  if (plan.end) return;
  await set(ref(db, `${R(code)}/scores`), Object.fromEntries(Object.keys(players).map((id) => [id, 0])));
  await beginTurn(code, plan, now, { 'state/used': null });
}

export const endTurn = (code, now) =>
  update(ref(db, `${R(code)}/state`), { phase: 'turnEnd', phaseEndsAt: now + TURN_END_MS });

export const finishGame = (code) =>
  update(ref(db, `${R(code)}/state`), { phase: 'gameEnd', drawerId: null, phaseEndsAt: null, hint: null });

export const playAgain = (code) =>
  update(ref(db, R(code)), {
    'state/phase': 'lobby',
    'state/drawerId': null,
    'state/hint': null,
    'state/guessed': null,
    'state/lastWord': null,
    'state/used': null,
    'state/round': 0,
    draw: null,
  });
