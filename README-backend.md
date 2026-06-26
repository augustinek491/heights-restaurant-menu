# Heights Restaurant — Next.js + Firebase Backend

This is the Next.js (App Router, TypeScript) frontend + Firebase backend for
the Heights Restaurant digital menu. The original static prototype lives
under `site/`, `data/`, `design/`, and `assets/` and is left untouched as a
reference — none of those directories are used at runtime by this app except
as read-only data/image sources for local fallback and the seed script.

## Local development

### 1. Install dependencies

```
npm install
```

### 2. Choose a backend target

**Option A — Firebase emulators (recommended for local dev):**

```
firebase emulators:start
```

Then, in a separate terminal, export the emulator hosts before starting
Next.js so `firebase-admin` talks to the emulators instead of production:

```
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
export FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
export FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
npm run dev
```

**Option B — a real (provisioned) Firebase project:**

```
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
npm run dev
```

The service account needs Firestore + Storage + Auth admin access. Download
one from Firebase Console → Project Settings → Service Accounts.

Either way, also create `.env.local` with the client-side Firebase web config
(used only by the admin login page) — these values are public, not secrets:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=heights-restaurant-menu
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Seed the database

Once Firestore/Auth/Storage APIs are enabled on the target project:

```
npm run seed
```

This reads the four `data/*.json` files and uploads the 38 images under
`assets/menu/` to Cloud Storage, then writes `menuCategories`, `menuSections`,
`menuItems`, `menuImages`, and `settings/site` to Firestore. It's idempotent —
every document ID is a deterministic slug, so re-running it updates existing
docs rather than duplicating them.

**Do not run this against the live project until Firestore/Auth APIs have
been fully enabled** — check with whoever provisioned the
`heights-restaurant-menu` project first.

### 4. Provision an admin user

Create a user (via Firebase Console, the Auth emulator UI, or your own
sign-up flow), then grant them the admin dashboard role:

```
npm run set-admin -- someone@example.com
```

They can then sign in at `/admin/login`.

## How the public menu renders without Firestore

`app/page.tsx` calls `getMenuData()` (`lib/firestore.ts`), where every
Firestore read is individually wrapped in try/catch with an empty-array or
default-settings fallback. This means:

- `next build` succeeds even with zero Firestore credentials available
  (CI, first-time setup, etc.) — it just prerenders an empty menu shell.
- Once real credentials are available and the project is seeded, the same
  code path returns real data; `export const revalidate = 60` (ISR) means
  edits made in the admin dashboard show up within a minute without a
  redeploy.

## Deployment

This app deploys via **Firebase App Hosting**, connected directly to this
repo's GitHub remote. Pushing to the connected branch (typically `main`)
triggers an automatic build + deploy — there is no manual `firebase deploy`
step for the Next.js app itself. `apphosting.yaml` at the repo root
configures the App Hosting backend (currently just `minInstances: 0`).

Firestore rules, indexes, and Storage rules (`firestore.rules`,
`firestore.indexes.json`, `storage.rules`) are deployed separately via the
Firebase CLI (`firebase deploy --only firestore:rules,firestore:indexes,storage`)
by whoever manages the Firebase project directly — this was intentionally
not run as part of this build.

## Admin CMS

- `/admin/login` — email/password sign-in (Firebase client Auth SDK),
  exchanges the resulting ID token for an HttpOnly session cookie via
  `POST /api/session`.
- `middleware.ts` — fast best-effort redirect for unauthenticated visitors to
  `/admin/**`.
- `app/admin/(protected)/layout.tsx` — the real auth boundary: verifies the
  session cookie with the Admin SDK and checks the `role === 'admin'` custom
  claim on every request to anything under the protected route group.
- `app/admin/(protected)/page.tsx` — lists all menu items grouped by
  category → section with inline-editable name/description/price fields.
- `app/admin/actions.ts` — the only legitimate write path for menu content;
  a `"use server"` Server Action that re-verifies the session server-side
  and writes via the Admin SDK (Firestore rules deny all client writes).
