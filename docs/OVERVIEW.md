# Desi Doodle – project overview (context file for humans and LLMs)

> **How to use this file:** paste it at the start of a chat with an LLM, then describe the change you want.
> Keep it updated when architecture or data shapes change (see "Maintaining this doc").

## 1. What this is
A multiplayer draw-and-guess game (skribbl.io / Pictionary style) for friends. Differences from skribbl.io:
- **Word bank is India-friendly**: simple everyday words (school, class, shop, car) plus native words written in
  English (samosa, puja, shaadi, kabaddi). Spelling variants are accepted (`shaadi|shadi|wedding`).
- **No backend server.** Firebase Realtime Database (RTDB) + Anonymous Auth only; clients cooperate to run the game.
- Audience: small friend groups (2–10 players per room), phone or laptop.

## 2. Stack
React 18 + Vite 5 (JavaScript, no TypeScript, no router, no state library) · Firebase v10 modular SDK
(`firebase/database`, `firebase/auth`) · plain CSS (`src/styles.css`, "Indian school notebook" look) · Firebase Hosting or GitHub Pages.

## 3. File map
```
database.rules.json        RTDB security rules (deploy: firebase deploy --only database)
firebase.json              Hosting + rules config
.env(.example)             VITE_FIREBASE_* keys (incl. VITE_FIREBASE_DATABASE_URL)
src/
  main.jsx, App.jsx        Auth bootstrap (anonymous, per-tab session), hash routing (#ROOMCODE), Home vs Room
  firebase.js              initializeApp; exports auth, db, configured
  data/words.js            WORD BANK: categories → [primary, ...accepted alternates]; ANSWERS lookup
  lib/game.js              PURE helpers: constants, normalisation, Levenshtein, hostId, planNext, hints, scoring
  lib/room.js              ALL Firebase writes: create/join/leave, presence, settings, beginTurn/endTurn/finishGame/playAgain
  hooks/useRoom.js         useServerOffset, useNow (server-synced clock), useRoom (live data), useChat
  hooks/useEngines.js      useHostEngine (clock + phase transitions), useDrawerEngine (word, judging, hints)
  components/Home.jsx      name + create/join
  components/Room.jsx      joins room, presence, runs engines, renders Lobby or Game
  components/Lobby.jsx     code/link, player list, settings (host), Start
  components/Game.jsx      header (round/hint/timer), scoreboard, canvas overlays, game-over screen
  components/Canvas.jsx    drawing + realtime stroke sync + tools (colour, size, undo, clear)
  components/Chat.jsx      chat + guess entry
```

## 4. Roles (important mental model)
There is no server, so three *computed* roles exist; any client can hold them and they migrate automatically:
| Role | Who | Responsibility |
|---|---|---|
| **Host** | `hostId(players)` = connected player with earliest `joinedAt` | Runs the clock: ends turns (timeout / everyone guessed / drawer left), advances to next drawer, ends game. Also the only one whose Lobby controls are enabled. |
| **Drawer** | `state.drawerId` | Knows the secret word. Generates 3 choices, writes the word to `secret`, **judges guesses**, awards points, reveals hint letters, publishes `lastWord` at turn end. |
| **Guesser** | everyone else | Types guesses into a private queue only the drawer can read. |
Because the host is derived from presence, if the host closes their tab the next-oldest player takes over within a second or two.

## 5. Game flow (state machine on `rooms/<code>/state.phase`)
```
lobby ──Start (host)──▶ choosing ──drawer picks (or 15s auto-pick)──▶ drawing ──timeout / all guessed / drawer gone──▶ turnEnd (6s)
  ▲                         ▲                                                                                          │
  │                         └──────────────── next drawer (planNext) ◀─────────────────────────────────────────────────┘
  └── Play again (host) ◀── gameEnd ◀── no more drawers/rounds
```
1. **lobby**: players join with a 5-letter code (URL hash `#ABCDE`). Host sets rounds (2–8), draw time (40–120s), categories.
2. **choosing** (`beginTurn`): host picks next drawer from `order` (reshuffled each round, skipping disconnected players), bumps `state.turn`, clears `draw` + `guesses`. Drawer client creates 3 random unused words from selected categories.
3. **drawing**: drawer's `choose(word)` writes `secret {turn, word}`, `state.hint` (underscores), `phaseEndsAt`. Strokes stream into `draw`. Guesses → `guesses` queue → drawer judges.
4. **Judging** (drawer client): normalise (lowercase, strip non-alphanumerics) and compare with all accepted answers. Correct → guesser gets `100 + 300 × timeLeft/total` pts, drawer gets 40, `state.guessed/<uid>=true`, system chat line (the word itself is never shown). Wrong → republished as public chat; edit-distance-1 guesses also get a private "very close!" line.
5. **Hints**: drawer client reveals one letter at 40% and another at 70% of elapsed time (max half the letters).
6. **turnEnd**: drawer publishes `state.lastWord`; everyone sees the word; after 6s host starts the next turn.
7. **gameEnd**: leaderboard overlay; host can **Play again** (back to lobby, scores reset on next Start).

## 6. Realtime data model (RTDB)
```
rooms/<CODE>/
  players/<uid>   { name, color, joinedAt (server ts), connected }   // own node only; connected via onDisconnect
  settings        { rounds, drawSeconds, cats: [categoryKey...] }
  state           { phase, round, turn, turnIdx, order: [uid], drawerId, phaseEndsAt (server ms),
                    hint, lastWord, guessed: {uid:true}, used: {wordKey:true} }
  scores/<uid>    number                                              // updated with transactions by the drawer
  draw/<pushId>   { s: strokeId, c: "#hex", w: px, p: "x,y x,y ..." }  // x,y = 0..1000 per-mille; chunk starts at previous chunk's last point
  chat/<pushId>   { k: msg|ok|close|g, u, n, t, to?, ts }             // 'close' only shown to `to`; 'g' only to guessers+drawer
  guesses/<pushId>{ u, n, t }                                         // READ: drawer only. Drawer deletes after judging.
  secret          { turn, word }                                      // READ/WRITE: drawer only. Lets drawer recover after refresh.
```
Timestamps use Firebase server time via `.info/serverTimeOffset` (`useServerOffset`), so countdowns agree across devices.

## 7. Drawing sync details
- Canvas is 800×600 logical pixels, CSS-scaled (4:3). Points are normalised so every screen draws the same picture.
- While the pointer is down the drawer's client pushes a chunk every ~60 ms (a few points each). Everyone (including the drawer) renders from `onChildAdded`, so local and remote paths are identical.
- **Undo** deletes all chunks of the drawer's last stroke id; **Clear** removes `draw`. Any `child_removed` triggers a debounced full redraw.
- Fill-bucket and shapes are *not* implemented (flood-fill sync is non-trivial).

## 8. Security / trust model (read before exposing publicly)
- Anonymous Auth, **session persistence** (each browser tab = new uid; closing the tab = a new identity next time).
- Rules: only room members can write room data; players can only write their own `players/<uid>`; `guesses` and `secret` are readable only by the current drawer, so guessers can't peek at the word.
- **Not cheat-proof**: any member can still write `state` or `scores` from dev tools, and the drawer client is trusted to judge fairly. Fine for friends.
- Hardening path: move host + judging logic into Cloud Functions (needs Blaze plan), restrict `state`/`scores` writes to functions, add App Check.
- Rooms are never deleted. Add a scheduled cleanup (Cloud Function) or a manual delete if the DB grows.

## 9. Conventions for changes
- Game rules → `lib/game.js` (pure, no Firebase). Firebase writes → `lib/room.js`. Per-turn automation → `hooks/useEngines.js`. UI → `components/`.
- Prefer multi-path `update()` calls so a state change is atomic (see `beginTurn`).
- Any new RTDB path needs a matching rule in `database.rules.json`.
- Phase timers are absolute server timestamps (`phaseEndsAt`), never client countdowns.
- Words: edit `src/data/words.js` only; lowercase, `|` separates accepted spellings, first one is displayed.
- Styling: CSS variables at top of `styles.css`; keep the notebook look (ruled paper, pen-blue, marigold highlight).

## 10. Known limitations / ideas backlog
- Mobile Safari may drop the websocket when the tab is backgrounded → player marked disconnected → their turn is skipped.
- No flood-fill, shapes, or eraser size separate from brush; eraser is the white swatch.
- No kick/ban, no private-room password, no spectators, no sound effects.
- Ideas: custom word list per room, Hindi/Hinglish hint mode, difficulty levels per category, "drawer disconnected" toast,
  per-turn score summary, round timer pause, replay gallery, PWA install, Cloud Functions authoritative mode.

## 11. Local setup (short)
`npm install` → copy `.env.example` to `.env` and fill Firebase keys → enable Anonymous auth + create RTDB →
`firebase deploy --only database` → `npm run dev` → open two tabs. Full steps in `README.md`.

## 12. Maintaining this doc
When you change a data shape, phase, role responsibility or rule, update sections 4–8 in the same commit.
Suggested prompt prefix for an LLM: *"Here is the project overview. Follow its conventions. Show only changed files in full."*
