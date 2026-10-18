import { useNow } from '../hooks/useRoom';
import { hostId, listPlayers } from '../lib/game';
import { playAgain } from '../lib/room';
import Canvas from './Canvas';
import Chat from './Chat';

export default function Game({ code, uid, name, room, offset, drawer, onLeave }) {
  const { state, players, scores, settings } = room;
  const now = useNow(offset);
  const { phase } = state;
  const isDrawer = state.drawerId === uid;
  const isHost = hostId(players) === uid;
  const left = state.phaseEndsAt ? Math.max(0, Math.ceil((state.phaseEndsAt - now) / 1000)) : 0;
  const ranked = listPlayers(players, scores).sort((a, b) => b.score - a.score);
  const drawerName = players[state.drawerId]?.name || 'Someone';

  let headline;
  if (phase === 'drawing') headline = isDrawer ? <span className="word">{drawer.word}</span> : <span className="hint">{state.hint}</span>;
  else if (phase === 'choosing') headline = <span className="status">{isDrawer ? 'Pick a word' : `${drawerName} is picking a word`}</span>;
  else if (phase === 'turnEnd') headline = <span className="status">The word was <b>{state.lastWord || '—'}</b></span>;
  else headline = <span className="status">Game over</span>;

  return (
    <div className="game">
      <header className="bar sheet">
        <span className="pill">Round {state.round}/{settings?.rounds}</span>
        <div className="headline">{headline}</div>
        <span className={left <= 10 && phase === 'drawing' ? 'pill clock hurry' : 'pill clock'}>{left}s</span>
      </header>

      <aside className="players sheet">
        <ol>
          {ranked.map((p) => (
            <li key={p.id} className={p.connected ? '' : 'off'}>
              <span className="dot" style={{ background: p.color }} />
              <span className="pname">
                {p.name}{p.id === uid && ' (you)'}
                {p.id === state.drawerId && phase !== 'gameEnd' && ' ✏️'}
                {state.guessed?.[p.id] && ' ✅'}
              </span>
              <b>{p.score}</b>
            </li>
          ))}
        </ol>
        <button className="alt" onClick={onLeave}>Leave</button>
      </aside>

      <main className="stage">
        <Canvas code={code} turn={state.turn} canDraw={phase === 'drawing' && isDrawer}>
          {phase === 'choosing' && (
            <div className="overlay">
              {isDrawer ? (
                <>
                  <h2>Choose a word to draw</h2>
                  {drawer.choices.map((w) => <button key={w} className="hot big" onClick={() => drawer.choose(w)}>{w}</button>)}
                </>
              ) : (
                <h2>✏️ {drawerName} is choosing…</h2>
              )}
            </div>
          )}
          {phase === 'turnEnd' && (
            <div className="overlay">
              <h2>It was “{state.lastWord || '—'}”</h2>
              <p>Next turn starts in {left}s</p>
            </div>
          )}
          {phase === 'gameEnd' && (
            <div className="overlay">
              <h2>🏆 {ranked[0]?.name} wins!</h2>
              <ol className="podium">
                {ranked.slice(0, 5).map((p) => <li key={p.id}>{p.name} <b>{p.score}</b></li>)}
              </ol>
              {isHost ? <button className="hot big" onClick={() => playAgain(code)}>Play again</button> : <p>Waiting for the host…</p>}
            </div>
          )}
        </Canvas>
      </main>

      <aside className="chatbox sheet"><Chat code={code} uid={uid} name={name} state={state} /></aside>
    </div>
  );
}
