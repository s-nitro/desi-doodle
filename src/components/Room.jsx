import { useEffect, useState } from 'react';
import { joinRoom, watchPresence, leaveRoom } from '../lib/room';
import { useRoom, useServerOffset } from '../hooks/useRoom';
import { useHostEngine, useDrawerEngine } from '../hooks/useEngines';
import Lobby from './Lobby';
import Game from './Game';

export default function Room({ code, uid, name, onExit }) {
  const [status, setStatus] = useState('joining');
  const [err, setErr] = useState('');

  useEffect(() => {
    let off = () => {};
    let dead = false;
    joinRoom(code, uid, name)
      .then(() => {
        if (dead) return;
        off = watchPresence(code, uid);
        setStatus('in');
      })
      .catch((e) => {
        setErr(e.message);
        setStatus('error');
      });
    return () => {
      dead = true;
      off();
    };
  }, [code, uid, name]);

  if (status === 'error')
    return (
      <div className="center">
        <div className="sheet">
          <h2>{err}</h2>
          <button onClick={onExit}>Back</button>
        </div>
      </div>
    );
  if (status !== 'in') return <div className="center">Joining {code}…</div>;
  return <RoomView code={code} uid={uid} name={name} onExit={onExit} />;
}

function RoomView({ code, uid, name, onExit }) {
  const room = useRoom(code);
  const offset = useServerOffset();
  useHostEngine({ code, uid, room, offset });
  const drawer = useDrawerEngine({ code, uid, room, offset });

  const leave = async () => {
    await leaveRoom(code, uid);
    onExit();
  };

  if (!room.loaded) return <div className="center">Loading room…</div>;
  if (!room.state) return <div className="center"><div className="sheet"><h2>Room {code} no longer exists</h2><button onClick={onExit}>Back</button></div></div>;

  const props = { code, uid, name, room, offset, onLeave: leave };
  return room.state.phase === 'lobby' ? <Lobby {...props} /> : <Game {...props} drawer={drawer} />;
}
