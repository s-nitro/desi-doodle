import { useState } from 'react';
import { CATEGORIES, ALL_CATS } from '../data/words';
import { DEFAULT_SETTINGS, hostId, listPlayers } from '../lib/game';
import { startGame, updateSettings } from '../lib/room';
import Chat from './Chat';

export default function Lobby({ code, uid, name, room, offset, onLeave }) {
  const { players, state } = room;
  const s = { ...DEFAULT_SETTINGS, ...room.settings };
  const cats = s.cats || ALL_CATS;
  const isHost = hostId(players) === uid;
  const here = listPlayers(players).filter((p) => p.connected);
  const link = `${location.origin}${location.pathname}#${code}`;
  const [copied, setCopied] = useState(false);

  const toggle = (k) => {
    const next = cats.includes(k) ? cats.filter((x) => x !== k) : [...cats, k];
    if (next.length) updateSettings(code, { cats: next });
  };
  const copy = () => {
    if (navigator.share) {
      navigator.share({ title: 'Desi Doodle', text: `Join my room ${code}`, url: link }).catch(() => {});
      return;
    }
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="lobby">
      <div className="sheet">
        <h1 className="logo small">Desi Doodle</h1>
        <p className="sub">Room code</p>
        <div className="roomcode">{code}</div>
        <button className="alt" onClick={copy}>{copied ? 'Link copied' : navigator.share ? 'Share invite' : 'Copy invite link'}</button>

        <h3>Players ({here.length})</h3>
        <ul className="plist">
          {here.map((p) => (
            <li key={p.id}>
              <span className="dot" style={{ background: p.color }} />
              {p.name}{p.id === uid && ' (you)'}{p.id === hostId(players) && ' 👑'}
            </li>
          ))}
        </ul>

        <h3>Settings {!isHost && <small>(host controls these)</small>}</h3>
        <div className="row">
          <label>Rounds
            <select disabled={!isHost} value={s.rounds} onChange={(e) => updateSettings(code, { rounds: +e.target.value })}>
              {[2, 3, 4, 5, 6, 8].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label>Draw time
            <select disabled={!isHost} value={s.drawSeconds} onChange={(e) => updateSettings(code, { drawSeconds: +e.target.value })}>
              {[40, 60, 80, 100, 120].map((n) => <option key={n} value={n}>{n} sec</option>)}
            </select>
          </label>
        </div>
        <div className="cats">
          {ALL_CATS.map((k) => (
            <button key={k} disabled={!isHost} className={cats.includes(k) ? 'chip on' : 'chip'} onClick={() => toggle(k)}>
              {CATEGORIES[k].emoji} {CATEGORIES[k].label}
            </button>
          ))}
        </div>

        {isHost ? (
          <button className="hot big" disabled={here.length < 2} onClick={() => startGame(code, players, s, Date.now() + offset)}>
            {here.length < 2 ? 'Waiting for a friend…' : 'Start game'}
          </button>
        ) : (
          <p className="sub">Waiting for the host to start…</p>
        )}
        <button className="alt" onClick={onLeave}>Leave room</button>
      </div>
      <div className="sheet chatbox"><Chat code={code} uid={uid} name={name} state={state} /></div>
    </div>
  );
}
