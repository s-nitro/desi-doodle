import { useEffect, useRef, useState } from 'react';
import { ref, push, remove, update, onChildAdded, onChildRemoved } from 'firebase/database';
import { db } from '../firebase';

// Strokes are streamed as small "chunks" under rooms/<code>/draw.
// chunk = { s: strokeId, c: color, w: width, p: "x,y x,y ..." }   x,y in 0..1000 (per-mille of canvas size)
// Each chunk starts with the previous chunk's last point so lines join without gaps.
const W = 800, H = 600;
const COLORS = ['#1a1a1a', '#8a8a8a', '#ffffff', '#e63946', '#f77f00', '#fcbf49', '#2a9d4f', '#06a77d', '#118ab2', '#3a2fb5', '#9d4edd', '#e5989b', '#7f4f24'];
const SIZES = [4, 10, 22];

function paint(ctx, c) {
  const pts = c.p.split(' ').map((s) => s.split(',').map(Number));
  const X = (v) => (v * W) / 1000, Y = (v) => (v * H) / 1000;
  ctx.strokeStyle = ctx.fillStyle = c.c;
  ctx.lineWidth = c.w;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.beginPath();
  if (pts.length === 1) {
    ctx.arc(X(pts[0][0]), Y(pts[0][1]), c.w / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.moveTo(X(pts[0][0]), Y(pts[0][1]));
  for (let i = 1; i < pts.length; i++) ctx.lineTo(X(pts[i][0]), Y(pts[i][1]));
  ctx.stroke();
}

export default function Canvas({ code, turn, canDraw, children }) {
  const cv = useRef(null);
  const chunks = useRef(new Map()); // key -> chunk (in key order)
  const mine = useRef([]); // my stroke ids this turn, for undo
  const cur = useRef(null); // stroke being drawn
  const raf = useRef(0);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);

  const redraw = () => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const x = cv.current.getContext('2d');
      x.fillStyle = '#fff';
      x.fillRect(0, 0, W, H);
      chunks.current.forEach((c) => paint(x, c));
    });
  };

  useEffect(() => {
    chunks.current.clear();
    redraw();
    const r = ref(db, `rooms/${code}/draw`);
    const a = onChildAdded(r, (s) => {
      chunks.current.set(s.key, s.val());
      paint(cv.current.getContext('2d'), s.val());
    });
    const b = onChildRemoved(r, (s) => {
      chunks.current.delete(s.key);
      redraw();
    });
    return () => {
      a();
      b();
      if (cur.current) clearInterval(cur.current.timer);
    };
  }, [code]);

  useEffect(() => { mine.current = []; }, [turn]);

  const pos = (e) => {
    const r = cv.current.getBoundingClientRect();
    const k = (v) => Math.max(0, Math.min(1000, Math.round(v)));
    return [k(((e.clientX - r.left) / r.width) * 1000), k(((e.clientY - r.top) / r.height) * 1000)];
  };
  const flush = () => {
    const d = cur.current;
    if (!d || !d.buf.length || (d.sent && d.buf.length < 2)) return;
    push(ref(db, `rooms/${code}/draw`), { s: d.id, c: d.c, w: d.w, p: d.buf.map((q) => q.join(',')).join(' ') });
    d.sent = true;
    d.buf = [d.buf[d.buf.length - 1]];
  };
  const down = (e) => {
    if (!canDraw) return;
    e.preventDefault();
    cv.current.setPointerCapture(e.pointerId);
    cur.current = { id: Math.random().toString(36).slice(2, 9), c: color, w: size, buf: [pos(e)], sent: false, timer: setInterval(flush, 60) };
    flush();
  };
  const move = (e) => {
    const d = cur.current;
    if (!d) return;
    const p = pos(e), l = d.buf[d.buf.length - 1];
    if (p[0] !== l[0] || p[1] !== l[1]) d.buf.push(p);
  };
  const up = () => {
    const d = cur.current;
    if (!d) return;
    flush();
    clearInterval(d.timer);
    mine.current.push(d.id);
    cur.current = null;
  };
  const undo = () => {
    const id = mine.current.pop();
    if (!id) return;
    const patch = {};
    chunks.current.forEach((c, k) => { if (c.s === id) patch[k] = null; });
    if (Object.keys(patch).length) update(ref(db, `rooms/${code}/draw`), patch);
  };
  const clear = () => {
    mine.current = [];
    remove(ref(db, `rooms/${code}/draw`));
  };

  return (
    <>
      <div className="canvasBox">
        <canvas
          ref={cv}
          width={W}
          height={H}
          className={canDraw ? 'draw' : ''}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
        {children}
      </div>
      {canDraw && (
        <div className="tools">
          <div className="swatches">
            {COLORS.map((c) => (
              <button key={c} aria-label={`colour ${c}`} className={c === color ? 'sw on' : 'sw'} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
          <div className="sizes">
            {SIZES.map((n) => (
              <button key={n} aria-label={`brush ${n}`} className={n === size ? 'sz on' : 'sz'} onClick={() => setSize(n)}>
                <i style={{ width: n, height: n }} />
              </button>
            ))}
          </div>
          <button className="alt" onClick={undo}>Undo</button>
          <button className="alt" onClick={clear}>Clear</button>
        </div>
      )}
    </>
  );
}
