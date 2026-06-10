# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Hotel Booking web app — FER (Front-End with React) assignment, student code HE180712. React 19 + Vite SPA backed by **json-server** reading `database.json` as a fake REST API. See `PROJECT.md` for the full design spec (roles, features, data model).

The current `src/App.jsx` is still the Vite starter template and is expected to be replaced by the booking app.

## Commands

```bash
npm run dev        # Vite dev server (http://localhost:5173)
npm run server     # json-server fake backend on port 9999 (watches db/database.json)
npm run build      # production build to dist/
npm run preview    # preview the production build
npm run lint       # ESLint over all .js/.jsx
```

Run `npm run dev` and `npm run server` in two separate terminals. The frontend's API base URL comes from `VITE_API_URL` (see `.env.example`), falling back to `http://localhost:9999`.

No test runner is configured.

## Architecture

**Data model lives in `db/database.json`** — five collections with these relationships:
- `hotels.ownerId` → `users.id` (a *manager* owns hotels)
- `rooms.hotelId` / `services.hotelId` → `hotels.id`
- `bookings` references `userId`, `hotelId`, `roomId`, and `serviceIds[]`

**Three roles** (`users.role`): `admin`, `manager`, `user`.
- **Critical:** json-server enforces no authorization. All access control is **client-side only** — route guards plus filtering data by `ownerId` (manager sees only their own hotels) and `userId` (user sees only their own bookings). Never assume the API restricts anything.
- Booking status flow: `pending` → `confirmed` → `cancelled`.

Frontend layering is a flat structure grouped by file type: `services/axiosClient.js` (single axios instance, base URL from `VITE_API_URL` env, falls back to `localhost:9999`) → `services/*` (one per collection) → `context/AuthContext.jsx` (login state + role in localStorage) → `pages/` (HomePage, LoginPage, RegisterPage...) and `components/` (Navbar, Footer, ProtectedRoute, Reveal). Routes are declared directly in `App.jsx`; role-gated routes wrap elements in `ProtectedRoute`.

## Conventions

- **React Compiler is enabled** via `@rolldown/plugin-babel` + `reactCompilerPreset()` in `vite.config.js`. It auto-memoizes — do not add manual `useMemo`/`useCallback`/`React.memo` for performance unless profiling shows a real need.
- ESLint uses flat config (`eslint.config.js`) with `react-hooks` and `react-refresh` rules; `dist/` is ignored.
- UI library is **react-bootstrap** (per PROJECT.md). User-facing content/strings are in Vietnamese.
- Seed/sample accounts and IDs are documented in `PROJECT.md`; json-server v1 uses **string** ids — keep new records consistent with that.
