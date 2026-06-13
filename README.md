# Naxos Bus Planner

A tiny, mobile-first single-page app that answers one question: **"I'm in Naxos Town — how do I get to a place by bus, and how do I get back?"**

The official [naxosbuses.com](https://naxosbuses.com) schedule is a 7-column table that's hard to read on a phone. This replaces it with a POI-first journey planner: pick a destination and see departures **from Naxos Town** and **back to town**, filtered to a day, with the next upcoming bus highlighted.

Because every line hubs through Naxos Town (Hora), there's no village-to-village routing to worry about — it's just Town → POI and POI → Town.

## Stack

- **Vite** + vanilla JS (no framework, no router, no state library)
- Static timetable baked into the bundle (`src/data.js`)
- Deployed to **GitHub Pages** via GitHub Actions

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Deploy

Live at **https://marwinburesch.github.io/naxos-buses/**.

Deployment publishes the built `dist/` to the `gh-pages` branch, which GitHub Pages serves:

```bash
npm run deploy   # builds and pushes dist/ to the gh-pages branch
```

GitHub Pages is configured to build from the `gh-pages` branch (Settings → Pages).

> An automated "build on push to `main`" GitHub Actions workflow is available but
> not yet enabled — it requires a token with the `workflow` scope to commit. See
> the open issue in this repo for the workflow file and one-step enablement.

> The Vite `base` in `vite.config.js` is `/naxos-buses/` to match the repo name. Change it if you rename the repo or host it elsewhere.

## Data

`src/data.js` holds **multiple seasonal schedules** in a `SCHEDULES` array, each with a `validFrom`/`validTo` range. The app **auto-selects the schedule covering today's date** and shows a switcher so the user can preview the others (the one covering today is marked "· now").

Current schedules:
- **Until 15 Jun** (18 May – 15 Jun 2026)
- **From 16 Jun** (16 – 30 Jun 2026), from the [spring-season-2 table](https://naxosbuses.com/bus-schedules-spring-season-2/)

All timetables were **hand-transcribed** — treat them as best-effort, not gospel. Verify time-critical trips (last bus, ferry connections) with the operator: **+30 22850 22291**.

To add/refresh a schedule: re-read the relevant naxosbuses.com schedule page and add (or update) an entry in `SCHEDULES`. Per destination, the schema allows a `weekdays` array (fills Mon–Fri) plus optional `sat`/`sun`, and explicit per-day keys (`mon`…`sun`) for day-specific services. An empty/absent array for a day means no service. Times use the operator's `24:00`/`24:35` past-midnight notation.

## Disclaimer

Unofficial. Not affiliated with the bus operator.
