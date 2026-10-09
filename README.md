# Family SOS

Emergency alert MVP. A family member presses and holds the big EMERGENCY button for 3 seconds;
every other family member gets a real push notification, and their app (if open) sounds a 30‑second
alarm with vibration. Anyone can then see the location, call, respond, and the person who triggered
it can mark themselves SAFE.

**Stack:** React 19 + Vite 5 (frontend), Express 4 (API + real-time + Web Push), PostgreSQL with Drizzle ORM.
Chosen to run on macOS Catalina 10.15.8 (Intel): no Next.js, no Turbopack, esbuild 0.21.x.

## 1. One-time setup on your Mac

1. **Node.js 20 LTS** (the last LTS line with Catalina-compatible builds). Install from nodejs.org
   or with `nvm install 20`. Check with `node -v` (should print `v20.x`).
2. **PostgreSQL** (any local version 13+). Options: Postgres.app, or Homebrew (`brew install postgresql@14`).
   Start it, then create a database:
   ```bash
   createdb family_sos
   ```
   (If `createdb` is not found with Postgres.app, open its “psql” shortcut and run `CREATE DATABASE family_sos;`.)
3. Copy the environment file and set your database URL:
   ```bash
   cp .env.example .env
   ```
   Edit `DATABASE_URL` if your username/password differ, e.g.
   `postgresql://postgres:postgres@localhost:5432/family_sos`.

## 2. Run it

```bash
npm install
npm run dev
```

- Open **http://localhost:5173** in Chrome or Safari.
- The API runs on http://localhost:3000 (proxied automatically from 5173).
- Tables are created automatically on the first start. VAPID push keys are generated automatically on first start too.

To test with two family members, open a second browser window (or a private window) and join with the invite code.

## 3. Test the full flow

1. **Create a family** (Family name + your name) → note the invite code.
2. On your Home screen tap **TURN ON ALERTS** and allow notifications.
3. On a second device or browser window, **JOIN A FAMILY** with the code, then turn on alerts there too.
4. On device A, **press and hold the red EMERGENCY button for 3 seconds**.
5. Device B receives a notification and (if the app is open) the alarm sounds and vibrates.
   **STOP ALARM** silences it on that device.
6. On device A, tap **MARK AS SAFE**. Device B is told the person is safe.

## Notes and limits (MVP)

- **Push notifications** use the browser Web Push service. They work on Chrome/Edge/Firefox (desktop and Android),
  and on iPhone only after **Share → Add to Home Screen** (iOS 16.4+).
- **Background alarm sound**: the notification itself makes the phone alert (it uses the phone's notification
  sound and vibration). The looping 30‑second siren plays when the app is open or when you tap the notification.
  iPhones do not support web vibration; the alarm there is the notification plus the in-app siren.
- **Location** is requested while you hold the button. If permission is denied, the alert still sends.
- **Real-time** updates use Server-Sent Events, so keep the app open (or tap the notification) to receive live changes.
- **Phone numbers** are optional. They enable the CALL button.
- To test on a phone over your Wi-Fi, Chrome/Safari need HTTPS for notifications and location; use a tunnel such as
  Cloudflare Tunnel or ngrok pointing at port 5173 (or at port 3000 after `npm run build && npm start`).

## Production-style run

```bash
npm run build
npm start          # serves the built app and API on http://localhost:3000
```

## Project layout

```
server/
  index.js            Express app, SSE /api/events, static hosting
  db/                 Drizzle schema, pool, table bootstrap (plain SQL, IF NOT EXISTS)
  lib/                auth tokens, family & emergency helpers, realtime registry, Web Push
  routes/             families.js (create/join/family/push), emergencies.js (trigger/history/safe/respond)
src/
  App.jsx             session, real-time connection, alarm routing
  api.js              fetch wrapper + event bus
  alarm.js            siren + vibration, 30 s auto-stop, dedupe per emergency
  push.js             enable/refresh push subscription
  geo.js              optional location with timeout
  screens/            Start, Create, Join, Home (hold button), Family, History, Emergency
public/
  sw.js               service worker: shows push notifications, opens emergency on tap
```

## Future work (not in MVP)

User accounts, multiple families per person, admin controls, distance from emergency,
emergency services integration, native Android/iOS builds.
