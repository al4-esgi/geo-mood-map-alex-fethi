# GeoMood Map+ — Clean Code project (Master Archi Logicielle)

## Project intent (what we must deliver)

- Map users’ moods by combining mood input, geolocation context, and real weather at the time of the mood.
- Provide a minimal but working UI to collect data and visualize results (list/table/map).
- Use external APIs (or mocks) for weather and geolocation; optional AI for text/image sentiment.
- Follow course constraints: hexagonal architecture in final phase, clean code/SOLID, tests, CI, docs, CONTRIBUTIONS.md, PDF report.

## Core flow (what the app does)

- User captures a mood: free text + mood score (1–5) + optional image.
- App retrieves precise place (name/type/coords) via geo API (or mock).
- App retrieves real-time weather for that place/time via weather API (or mock).
- MoodScore combines user input + sentiment signals + weather modifier (and optional image sentiment).
- Data is stored locally (JSON/in-memory in Phase 1) and can be listed/exported.
- UI shows the collected moods and highlights correlations (e.g., “calmer on rainy days in parks”).

## Two-phase plan (course requirement)

- Phase 1 (now): Proof of Concept, focus on TDD loops, make features work quickly; architecture can be rough.
- Phase 2 (Dec refactor): Clean architecture (hexagonal), SOLID, proper layering, stronger tests, CI.

## Phase 1 objective: TDD-first delivery with Vitest

Goal: write tests first, make them pass with simplest code, then strengthen tests and refactor. Architecture can be minimal; prioritize learning loops.

### Targeted behaviours to test in Phase 1

- Mood entry accepts: free text, mood score (1–5), optional image URL/placeholder.
- Geolocation fetch (real or mocked) returns location name/type and coordinates.
- Weather fetch (real or mocked) returns main conditions (temp, humidity, rain flag).
- MoodScore calculation combines:
  - user text sentiment heuristic,
  - numeric mood score,
  - weather modifier (e.g., rainy/cold lowers, sunny/temperate raises),
  - optional image sentiment stub.
- Persistence stores entries locally (JSON or in-memory mock) and returns list.
- Simple list view formatter surfaces combined data.

### TDD loop to follow

1. Write a small failing test for one behaviour (e.g., MoodScore calculator).
2. Implement the minimum code to pass.
3. Refactor lightly if needed; keep architecture simple for now.
4. Add a stronger/edge-case test; repeat the cycle.

### Suggested initial test backlog (incremental)

- `moodScore`:
  - computes base from mood rating 1–5.
  - applies text sentiment keywords (e.g., {happy:+1, sad:-1}).
  - applies weather modifier (rain/cold vs sun/temperate).
  - clamps between 0–100 (or defined range).
- `geolocationService` (mock):
  - returns structured data when given coordinates.
  - handles missing API by returning fallback/mock.
- `weatherService` (mock):
  - returns structured data for given coords/time.
  - handles failure with deterministic mock.
- `persistence`:
  - saves an entry and retrieves it.
  - lists entries in insertion order.
- `formatter`:
  - renders a summary string/object combining mood, place, weather, score.

### Minimal tech setup for tests

- Test runner: Vitest.
- Testing style: BDD (`describe/it`), expect API.
- Mocks: use `vi.fn()` for adapters; keep pure functions for scoring logic.
- Data builders: small factories per entity to avoid duplication in tests.

## API options (recommended / mockable)

- Weather: OpenWeatherMap or Tomorrow.io — temp, humidity, rain.
- Geolocation: Google Geocoding or Places — place name, type (park, café, beach).
- Image: Google Vision API — objects, emotions, luminosity (can be stubbed).
- Text: Google Natural Language API — sentiment/keywords (can be stubbed).
- Rule of thumb: if offline or rate-limited, return deterministic mock responses so tests remain stable.

## Commands

- Install deps: `npm install`
- Run app: `npm run start`
- Run tests (Vitest): `npm run test`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Check (lint+type+test if configured): `npm run check`
- Add Shadcn UI components if needed: `pnpm dlx shadcn@latest add button`

## Working agreements for Phase 1

- Prefer mocks when APIs are unavailable; keep deterministic fixtures.
- Keep code simple; postpone architecture purity to Phase 2.
- Commit often with clear messages; keep CONTRIBUTIONS.md updated later.
- Document assumptions directly in tests when behaviour is defined there.

## Deliverables snapshot (later)

- `/src` feature code (may be rough in Phase 1).
- `/tests` or colocated tests with Vitest.
- `/docs` + PDF summary (final).
- `CONTRIBUTIONS.md` per contributor.
- Optional `.github/workflows/ci.yml` for CI.
