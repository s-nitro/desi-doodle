# Desi Doodle 🎨

A skribbl.io-style draw-and-guess game for friends, with a word bank built for Indian players
(school, class, shop, car… plus samosa, puja, shaadi, kabaddi). React + Vite on the front,
**Firebase Realtime Database + Anonymous Auth** for multiplayer. No custom server.

> Working with an LLM on this repo? Give it **`docs/OVERVIEW.md`** first.

## 1. Firebase setup (5 minutes, free Spark plan is enough)
1. Go to <https://console.firebase.google.com> → **Add project**.
2. **Build → Authentication → Sign-in method →** enable **Anonymous**.
3. **Build → Realtime Database → Create database.** Pick **Singapore (asia-southeast1)** for lower latency from India. Start in *locked mode* (rules get replaced in step 5).
4. **Project settings → Your apps → Web (`</>`)** → register an app and copy the config.
5. Install the CLI and push the rules in this repo:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add          # choose your project
   firebase deploy --only database
   ```

## 2. Run locally
```bash
npm install
cp .env.example .env            # paste your Firebase values (incl. the databaseURL)
npm run dev
```
Open the URL in **two browser tabs** – each tab is a separate player (auth uses session persistence on purpose).
Make a room in tab 1, join with the 5-letter code in tab 2, press **Start game**.

## 3. Deploy
- **Firebase Hosting:** `firebase init hosting` once (public dir `dist`, SPA = no), then `npm run deploy`.
- **GitHub Pages:** `vite.config.js` uses `base: './'` so a plain `npm run build` works; publish `dist/`.
  Add your site's domain under Firebase **Authentication → Settings → Authorized domains**.

## Customising words
Edit `src/data/words.js`. `shaadi|shadi|wedding` means the drawer sees *shaadi* but all three spellings count as correct.

## Known limits (by design, see OVERVIEW.md)
Honour-system trust model (fine for friends, not for strangers), rooms are not auto-deleted, free-tier connection limits apply.
