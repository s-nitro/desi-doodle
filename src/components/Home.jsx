import { useState } from "react";
import { createRoom } from "../lib/room";

export default function Home({ uid, initialName, initialCode, onEnter }) {
  const [name, setName] = useState(initialName);
  const [code, setCode] = useState(initialCode);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const go = async (create) => {
    const n = name.trim();
    if (!n) return setErr("Type your name first");
    const c = code.trim().toUpperCase();
    if (!create && c.length !== 5) return setErr("Room codes are 5 letters");
    setBusy(true);
    setErr("");
    try {
      onEnter(n, create ? await createRoom(uid, n) : c);
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };

  return (
    <div className="center">
      <div className="sheet home">
        <h1 className="logo">Desi Doodle</h1>
        <p className="sub">
          Draw it. Guess it. Words you actually use – school, samosa, shaadi.
        </p>
        <label>Your name</label>
        <input
          value={name}
          maxLength={20}
          placeholder="e.g. Shubham"
          onChange={(e) => setName(e.target.value)}
        />
        {name === "shubham" && (
          <button className="hot big" disabled={busy} onClick={() => go(true)}>
            Make a new room
          </button>
        )}
        <div className="or">or join friends</div>
        <div className="row">
          <input
            value={code}
            maxLength={5}
            placeholder="ROOM"
            className="codeinput"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && go(false)}
          />
          <button disabled={busy} onClick={() => go(false)}>
            Join
          </button>
        </div>
        {err && <p className="err">{err}</p>}
      </div>
    </div>
  );
}
