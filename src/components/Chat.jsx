import { useEffect, useRef, useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';
import { useChat } from '../hooks/useRoom';
import { say } from '../lib/room';

export default function Chat({ code, uid, name, state }) {
  const msgs = useChat(code);
  const [text, setText] = useState('');
  const box = useRef(null);
  const drawing = state.phase === 'drawing';
  const isDrawer = state.drawerId === uid;
  const guessed = !!state.guessed?.[uid];

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [msgs.length]);

  // who may see what: 'close' only to its target, 'g' (post-guess chatter) only to guessers + drawer
  const visible = msgs.filter((m) => (m.k === 'close' ? m.to === uid : m.k === 'g' ? guessed || isDrawer : true));

  const send = (e) => {
    e.preventDefault();
    const t = text.trim().slice(0, 100);
    setText('');
    if (!t || (drawing && isDrawer)) return;
    if (drawing && !guessed) push(ref(db, `rooms/${code}/guesses`), { u: uid, n: name, t }); // private queue → drawer judges
    else say(code, { k: drawing ? 'g' : 'msg', u: uid, n: name, t });
  };

  return (
    <div className="chat">
      <div className="msgs" ref={box}>
        {visible.map((m) => (
          <p key={m.id} className={`m ${m.k}`}>
            {m.n && m.k !== 'ok' && <b>{m.n}: </b>}
            {m.t}
          </p>
        ))}
      </div>
      <form onSubmit={send}>
        <input
          value={text}
          maxLength={100}
          onChange={(e) => setText(e.target.value)}
          disabled={drawing && isDrawer}
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          placeholder={drawing ? (isDrawer ? "You're drawing!" : guessed ? 'You got it – chat with other guessers' : 'Type your guess…') : 'Say something…'}
        />
        <button type="submit" disabled={(drawing && isDrawer) || !text.trim()}>{drawing && !isDrawer && !guessed ? 'Guess' : 'Send'}</button>
      </form>
    </div>
  );
}
