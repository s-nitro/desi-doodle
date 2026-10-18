// The game has no backend server, so two clients cooperate:
//   HOST   (longest-present player)  → runs the clock: phase changes, turn order.
//   DRAWER (current drawer)          → knows the secret word: picks it, judges guesses, scores, hints.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ref, get, update, remove, onChildAdded, runTransaction } from 'firebase/database';
import { db } from '../firebase';
import {
  hostId, connectedIds, isConnected, planNext, pickChoices, makeHint, revealOne, keyOf, norm, lev,
  answersFor, guessPoints, isAlnum, DRAWER_PTS,
} from '../lib/game';
import { beginTurn, endTurn, finishGame, say } from '../lib/room';

export function useHostEngine({ code, uid, room, offset }) {
  const L = useRef();
  L.current = { room, offset };
  const busy = useRef(false);
  const host = hostId(room.players) === uid;

  useEffect(() => {
    if (!host) return;
    const t = setInterval(async () => {
      if (busy.current) return;
      const { room: { state, players, settings }, offset: off } = L.current;
      if (!state || !settings) return;
      const now = Date.now() + off;
      busy.current = true;
      try {
        if (state.phase === 'choosing') {
          // drawer auto-picks at phaseEndsAt; this is only the fallback if they vanished
          if (now > state.phaseEndsAt + 4000 || !isConnected(players, state.drawerId)) await endTurn(code, now);
        } else if (state.phase === 'drawing') {
          const guessers = connectedIds(players).filter((id) => id !== state.drawerId);
          const everyoneGuessed = guessers.length > 0 && guessers.every((id) => state.guessed?.[id]);
          if (now >= state.phaseEndsAt || everyoneGuessed || !isConnected(players, state.drawerId)) await endTurn(code, now);
        } else if (state.phase === 'turnEnd' && now >= state.phaseEndsAt) {
          const plan = planNext(state, players, settings, false);
          if (plan.end) await finishGame(code);
          else await beginTurn(code, plan, now);
        }
      } finally {
        busy.current = false;
      }
    }, 500);
    return () => clearInterval(t);
  }, [host, code]);
}

export function useDrawerEngine({ code, uid, room, offset }) {
  const { state } = room;
  const isDrawer = !!state && state.drawerId === uid;
  const turn = state?.turn;
  const [choices, setChoices] = useState([]);
  const [word, setWord] = useState(null);
  const L = useRef();
  L.current = { room, offset, word, choices };
  const awarded = useRef(new Set());

  // New turn: generate choices (or recover the word from /secret after a refresh).
  useEffect(() => {
    setChoices([]);
    setWord(null);
    awarded.current = new Set();
    if (!isDrawer) return;
    const s = L.current.room.state;
    if (s.phase === 'choosing') setChoices(pickChoices(L.current.room.settings?.cats, s.used));
    else
      get(ref(db, `rooms/${code}/secret`)).then((snap) => {
        const v = snap.val();
        if (v && v.turn === s.turn) setWord(v.word);
      });
  }, [isDrawer, turn, code]);

  const choose = useCallback(async (w) => {
    const { room: { state: s, settings }, offset: off } = L.current;
    if (!s || s.phase !== 'choosing') return;
    setWord(w);
    await update(ref(db, `rooms/${code}`), {
      secret: { turn: s.turn, word: w },
      'state/phase': 'drawing',
      'state/hint': makeHint(w),
      'state/phaseEndsAt': Date.now() + off + (settings?.drawSeconds || 80) * 1000,
      [`state/used/${keyOf(w)}`]: true,
    });
  }, [code]);

  // Auto-pick if the drawer dawdles; reveal hint letters; reveal the word when the turn ends.
  useEffect(() => {
    if (!isDrawer) return;
    const t = setInterval(() => {
      const { room: { state: s, settings }, offset: off, word: w } = L.current;
      if (!s) return;
      const now = Date.now() + off;
      if (s.phase === 'choosing' && now >= s.phaseEndsAt) {
        if (L.current.choices[0]) choose(L.current.choices[0]);
      }
      if (s.phase === 'drawing' && w && s.hint) {
        const total = (settings?.drawSeconds || 80) * 1000;
        const f = 1 - (s.phaseEndsAt - now) / total;
        const letters = [...w].filter(isAlnum).length;
        const shown = [...s.hint].filter(isAlnum).length;
        const target = Math.min(Math.floor(letters / 2), f >= 0.7 ? 2 : f >= 0.4 ? 1 : 0);
        if (shown < target) update(ref(db, `rooms/${code}/state`), { hint: revealOne(w, s.hint) });
      }
      if (s.phase === 'turnEnd' && w && !s.lastWord) update(ref(db, `rooms/${code}/state`), { lastWord: w });
    }, 700);
    return () => clearInterval(t);
  }, [isDrawer, code, choose]);

  // Judge guesses. Guesses go into a queue only the drawer can read, so the answer never leaks in chat.
  useEffect(() => {
    if (!isDrawer || state?.phase !== 'drawing' || !word) return;
    return onChildAdded(ref(db, `rooms/${code}/guesses`), async (snap) => {
      const g = snap.val();
      remove(snap.ref);
      const { room: { state: s, settings }, offset: off, word: w } = L.current;
      if (!g || !w || s.phase !== 'drawing' || g.u === uid || s.guessed?.[g.u] || awarded.current.has(g.u)) return;
      const guess = norm(g.t);
      const answers = answersFor(w).map(norm);
      if (answers.includes(guess)) {
        awarded.current.add(g.u);
        const pts = guessPoints(s.phaseEndsAt - (Date.now() + off), (settings?.drawSeconds || 80) * 1000);
        await Promise.all([
          runTransaction(ref(db, `rooms/${code}/scores/${g.u}`), (v) => (v || 0) + pts),
          runTransaction(ref(db, `rooms/${code}/scores/${uid}`), (v) => (v || 0) + DRAWER_PTS),
          update(ref(db, `rooms/${code}/state/guessed`), { [g.u]: true }),
          say(code, { k: 'ok', t: `${g.n} guessed the word! (+${pts})` }),
        ]);
      } else {
        say(code, { k: 'msg', u: g.u, n: g.n, t: g.t });
        if (guess.length > 3 && answers.some((a) => lev(guess, a) === 1))
          say(code, { k: 'close', to: g.u, t: `"${g.t}" is very close!` });
      }
    });
  }, [isDrawer, state?.phase, turn, word, code, uid]);

  return { isDrawer, choices, choose, word };
}
