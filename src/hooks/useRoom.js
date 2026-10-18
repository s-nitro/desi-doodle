import { useEffect, useState } from 'react';
import { ref, onValue, onChildAdded, query, limitToLast } from 'firebase/database';
import { db } from '../firebase';

// Difference between this device's clock and Firebase's server clock.
export function useServerOffset() {
  const [off, setOff] = useState(0);
  useEffect(() => onValue(ref(db, '.info/serverTimeOffset'), (s) => setOff(s.val() || 0)), []);
  return off;
}

// A ticking "server now" in ms.
export function useNow(offset, every = 250) {
  const [now, setNow] = useState(Date.now() + offset);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), every);
    return () => clearInterval(t);
  }, [offset, every]);
  return now;
}

// Live room data: state, settings, players, scores.
export function useRoom(code) {
  const [room, setRoom] = useState({ state: null, settings: null, players: {}, scores: {}, loaded: false });
  useEffect(() => {
    setRoom({ state: null, settings: null, players: {}, scores: {}, loaded: false });
    const subs = ['state', 'settings', 'players', 'scores'].map((k) =>
      onValue(ref(db, `rooms/${code}/${k}`), (s) =>
        setRoom((r) => ({
          ...r,
          [k]: s.val() ?? (k === 'players' || k === 'scores' ? {} : null),
          loaded: k === 'state' ? true : r.loaded,
        }))
      )
    );
    return () => subs.forEach((off) => off());
  }, [code]);
  return room;
}

export function useChat(code) {
  const [msgs, setMsgs] = useState([]);
  useEffect(() => {
    setMsgs([]);
    const q = query(ref(db, `rooms/${code}/chat`), limitToLast(80));
    return onChildAdded(q, (s) => setMsgs((m) => [...m.slice(-79), { id: s.key, ...s.val() }]));
  }, [code]);
  return msgs;
}
