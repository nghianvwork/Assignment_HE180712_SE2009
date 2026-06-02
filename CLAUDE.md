# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Hotel Booking web app — FER (Front-End with React) assignment, student code HE180712. React 19 + Vite SPA backed by **json-server** reading `database.json` as a fake REST API. See `PROJECT.md` for the full design spec (roles, features, data model).

The current `src/App.jsx` is still the Vite starter template and is expected to be replaced by the booking app.

## Commands

```bash
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # production build to dist/
npm run preview    # preview the production build
npm run lint       # ESLint over all .js/.jsx
```

`json-server` is not installed yet. The intended fake backend runs on **port 9999** (e.g. `npx json-server --watch database.json --port 9999`); add a `server` npm script when wiring it up. Run frontend and json-server in two separate terminals.

No test runner is configured.

## Architecture

**Data model lives in `database.json`** — five collections with these relationships:
- `hotels.ownerId` → `users.id` (a *manager* owns hotels)
- `rooms.hotelId` / `services.hotelId` → `hotels.id`
- `bookings` references `userId`, `hotelId`, `roomId`, and `serviceIds[]`

**Three roles** (`users.role`): `admin`, `manager`, `user`.
- **Critical:** json-server enforces no authorization. All access control is **client-side only** — route guards plus filtering data by `ownerId` (manager sees only their own hotels) and `userId` (user sees only their own bookings). Never assume the API restricts anything.
- Booking status flow: `pending` → `confirmed` → `cancelled`.

Planned frontend layering (see `PROJECT.md` §6): `api/axiosClient.js` (single axios instance) → `services/*` (one per collection) → `context/AuthContext.jsx` (login state + role in localStorage) → `pages/` split into `admin/`, `manager/`, and user-facing pages, gated by a `ProtectedRoute` component.

## Conventions

- **React Compiler is enabled** via `@rolldown/plugin-babel` + `reactCompilerPreset()` in `vite.config.js`. It auto-memoizes — do not add manual `useMemo`/`useCallback`/`React.memo` for performance unless profiling shows a real need.
- ESLint uses flat config (`eslint.config.js`) with `react-hooks` and `react-refresh` rules; `dist/` is ignored.
- UI library is **react-bootstrap** (per PROJECT.md). User-facing content/strings are in Vietnamese.
- Seed/sample accounts and IDs are documented in `PROJECT.md`; json-server v1 uses **string** ids — keep new records consistent with that.
