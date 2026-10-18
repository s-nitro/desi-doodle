import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth, configured } from './firebase';
import Home from './components/Home';
import Room from './components/Room';

const hashCode = () => location.hash.slice(1).toUpperCase().slice(0, 5);

export default function App() {
  const [uid, setUid] = useState(null);
  const [authErr, setAuthErr] = useState('');
  const [name, setName] = useState(() => localStorage.getItem('dd_name') || '');
  const [code, setCode] = useState(hashCode);

  useEffect(() => {
    if (!configured) return;
    const off = onAuthStateChanged(auth, (u) => u && setUid(u.uid));
    // Session persistence = every browser tab is its own player (handy for testing with 2 tabs).
    setPersistence(auth, browserSessionPersistence)
      .then(() => signInAnonymously(auth))
      .catch((e) => setAuthErr(e.message));
    return off;
  }, []);

  useEffect(() => {
    const h = () => setCode(hashCode());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const enter = (n, c) => {
    localStorage.setItem('dd_name', n);
    setName(n);
    location.hash = c;
    setCode(c);
  };
  const exit = () => {
    history.replaceState(null, '', location.pathname);
    setCode('');
  };

  if (!configured)
    return (
      <div className="center"><div className="sheet">
        <h1>Set up Firebase first</h1>
        <p>Copy <code>.env.example</code> to <code>.env</code>, fill in your Firebase web-app keys, then restart <code>npm run dev</code>. Steps are in README.md.</p>
      </div></div>
    );
  if (authErr)
    return (
      <div className="center"><div className="sheet">
        <h1>Sign-in failed</h1>
        <p>{authErr}</p>
        <p>In Firebase console → Authentication → Sign-in method, enable <b>Anonymous</b>.</p>
      </div></div>
    );
  if (!uid) return <div className="center">Loading…</div>;
  if (name && code.length === 5) return <Room key={code} code={code} uid={uid} name={name} onExit={exit} />;
  return <Home uid={uid} initialName={name} initialCode={code} onEnter={enter} />;
}
