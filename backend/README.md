# Portfolio backend

Node.js + Express API that saves contact form submissions to MongoDB. It also
serves the front end, so the whole site runs from one address.

## 1. One-time setup

1. Install **Node.js 18+**.
2. Install **MongoDB Community Server** and **MongoDB Compass** (free, from mongodb.com).
   MongoDB runs locally on `mongodb://127.0.0.1:27017` by default.
3. In this `backend` folder:

```bash
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```

## 2. Run

```bash
npm start
```

Open **http://localhost:3000** (use this address rather than opening
`index.html` directly), then send a test message from the contact form.

`npm run dev` restarts the server when files change. `npm test` runs the API
tests (no database needed).

## 3. See the submissions in MongoDB Compass

1. Open Compass and connect to `mongodb://127.0.0.1:27017`.
2. Open database **portfolio**, collection **submissions**.
3. Each message is one document: `fullName`, `email`, `projectDetails`,
   `status` (new / read / replied / archived), `createdAt`, `updatedAt`.

The database and collection are created automatically on the first submission.

## How it is protected

- Server-side validation of every field; only plain strings are accepted
  (blocks NoSQL operator injection). Limits: 2000 characters of details.
- Rate limit: 5 submissions per IP every 15 minutes.
- Hidden honeypot field to catch simple bots.
- `helmet` security headers and a strict Content Security Policy.
- Request bodies are capped at 10 KB; errors never expose server details.
- Only `css/`, `js/`, `assets/` and `index.html` are served, never `backend/`.
- `.env` is git-ignored.

## Before going live

- Use a MongoDB server with **authentication** (for example MongoDB Atlas, or a
  local user with a password) and put that connection string in `.env`.
  Never expose an unauthenticated MongoDB to the internet.
- Set `NODE_ENV=production`, serve over HTTPS, and set `TRUST_PROXY=true` if
  you are behind a proxy or hosting platform.
- Limit the database user to the `portfolio` database.
