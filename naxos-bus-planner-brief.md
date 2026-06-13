# Naxos Bus Planner — Claude Code build brief

This document is a self-contained brief. Hand it to a fresh Claude Code session and it should be able to scaffold, build, and deploy the whole app without visiting any external site. Everything needed — product spec, the full timetable dataset, starter code, and deployment steps — is below.

---

## 1. What we're building

A tiny single-page web app that answers one question: **"I'm in Naxos Town — how do I get to <place> by bus, and how do I get back?"**

The official site (naxosbuses.com) presents this as a giant 7-column table that is almost unreadable on a phone. We are replacing it with a **POI-first journey planner**:

1. The user picks a destination (a beach, village, the airport, etc.).
2. The app shows two panels:
   - **Getting there** — departure times *from Naxos Town* toward that place.
   - **Getting back** — departure times *from that place* toward Naxos Town.
3. Times are filtered to the selected day (default: today), and on "today" the **next upcoming departure is highlighted**.

Key simplifying fact about the network: **every line hubs through Naxos Town (Hora).** There are essentially no village-to-village services. So "journey planning" reduces to Town → POI and POI → Town. We do not need a graph router or a per-line view (the user explicitly does not want per-line).

### Design priorities
- Mobile-first. Assume a phone held by a tourist at a bus stop.
- Fast to read. Big destination picker, big times, clear "next bus" cue.
- No backend. Static data baked into the bundle. Deploys to GitHub Pages.
- Super simple stack: **Vite + vanilla JS** (no framework, no router, no state library).

---

## 2. Tech stack & project shape

- **Vite** (vanilla template).
- Plain JS modules, one small CSS file, data in a JS module.
- Deployed to **GitHub Pages** via a GitHub Actions workflow.

```
naxos-bus/
  index.html
  vite.config.js
  package.json
  .github/workflows/deploy.yml
  src/
    main.js        # app logic + rendering
    data.js        # the full timetable dataset (provided below)
    style.css      # styles
```

### Scaffold commands
```bash
npm create vite@latest naxos-bus -- --template vanilla
cd naxos-bus
npm install
# then replace the generated files with the ones in this brief
npm run dev      # local preview
```

### vite.config.js  (GitHub Pages needs the repo name as base)
```js
import { defineConfig } from 'vite'

// IMPORTANT: set base to "/<your-repo-name>/" for project pages,
// e.g. base: '/naxos-bus/'. For a user/org page (<user>.github.io) use '/'.
export default defineConfig({
  base: '/naxos-bus/',
})
```

### package.json scripts (the relevant part)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### .github/workflows/deploy.yml  (build on push to main, publish to Pages)
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**One-time GitHub setup:** in the repo, go to Settings → Pages → Build and deployment → Source = **GitHub Actions**. Push to `main` and the site appears at `https://<user>.github.io/<repo>/`.

(Alternative if Actions is unwanted: `npm i -D gh-pages`, add `"deploy": "vite build && gh-pages -d dist"`, run `npm run deploy`, and set Pages source to the `gh-pages` branch.)

---

## 3. Data provenance (read me)

- Source: `https://naxosbuses.com/bus-schedules-july-august-copy/` (the page rendered the **18–29 May 2026** timetable) and the route page `https://naxosbuses.com/routes/agios-prokopios/`.
- The data below was **hand-transcribed** from that table, so treat it as a best-effort snapshot, not gospel. Verify anything time-critical (last bus, ferry connections) against the official site or the driver. Operator phone: +30 22850 22291.
- The return-direction times for the Agios Prokopios beach line follow a clean 5-minute cascade (Plaka :25 → Maragkas :30 → Agia Anna :35 → Agios Prokopios :40), which is how the original table encodes per-stop timing.
- To refresh later: re-read the schedule page and each `routes/<slug>/` page and regenerate `src/data.js` in the same shape.

### Day model
- Most routes run an identical timetable **Mon–Fri**, with **Saturday** and **Sunday** trimmed. A few inland routes run only on specific days (Apollon: Tue & Thu; Keramoti: Wed; Kinidaros/Danakos/Messi: Tue/Thu; etc.).
- The data schema therefore allows a `weekdays` array (fills Mon–Fri) plus optional `sat`/`sun`, and also explicit per-day keys (`mon`,`tue`,…) for the odd day-specific services. The resolver in `main.js` handles both.
- Empty/absent array for a day = **no service that day**.

---

## 4. The dataset — `src/data.js`

Paste this verbatim as `src/data.js`. Long hourly patterns are factored into shared constants at the top.

```js
// ---- shared time patterns ----
const HOURLY_08_23 = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];

// Beach line, outbound from Town: half-hourly 08:00–19:00, then hourly to 23:00 (27 deps)
const PROK_OUT = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","20:00","21:00","22:00","23:00"];
// Agia Anna Sunday outbound (reduced)
const PROK_OUT_SUN = ["08:00","09:00","10:00","11:00","12:00","13:00","13:30","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];

// Beach line, return to Town (hourly, staggered by stop)
const PROK_RET  = ["08:40","09:40","10:40","11:40","12:40","13:40","14:40","15:40","16:40","17:40","18:40","19:40","20:40","21:40","22:40","23:40"];
const AA_RET    = ["08:35","09:35","10:35","11:35","12:35","13:35","14:35","15:35","16:35","17:35","18:35","19:35","20:35","21:35","22:35","23:35"];
const MAR_RET   = ["08:30","09:30","10:30","11:30","12:30","13:30","14:30","15:30","16:30","17:30","18:30","19:30","20:30","21:30","22:30","23:30"];
const PLAKA_RET = ["08:25","09:25","10:25","11:25","12:25","13:25","14:25","15:25","16:25","17:25","18:25","19:25","20:25","21:25","22:25","23:25"];

const AIRPORT_OUT = ["08:30","09:30","10:30","11:30","12:30","13:30","14:30","15:30","16:30","17:30","18:30"];
const AIRPORT_RET = ["08:45","09:45","10:45","11:45","12:45","13:45","14:45","15:45","16:45","17:45","18:45"];

const ZAS_OUT  = ["09:30","11:00","13:30","15:00","19:10"];
const ZAS_OUT_WE = ["09:30","11:00","13:30","15:00"];
const ZAS_RET  = ["07:50","09:15","10:45","13:45","16:15"];
const ZAS_RET_SUN = ["07:50","10:45","13:45","16:15"];

const TRAGEA_OUT = ["07:30","09:30","11:00","12:00","13:30","15:00","19:10"]; // Filoti/Halki/Sagri/Damarionas
const TRAGEA_OUT_WE = ["09:30","11:00","12:00","13:30","15:00"];
const TRAGEA_RET = ["06:50","08:00","09:30","11:00","14:00","16:30"];          // Filoti/Halki
const TRAGEA_RET_SUN = ["06:50","08:00","11:00","14:00","16:30"];

// category is just for grouping/icons in the UI: 'beach' | 'village' | 'transport' | 'hike'
// travelMins: minutes Town -> POI. Only set where sourced; null otherwise.
// fromTown / toTown: { weekdays?, mon?, tue?, wed?, thu?, fri?, sat?, sun? }
export const DESTINATIONS = {
  "Agios Prokopios": {
    category:"beach", travelMins:15, line:"Agios Prokopios line",
    note:"Alight at the front of the beach.",
    fromTown:{ weekdays:PROK_OUT, sat:PROK_OUT, sun:PROK_OUT },
    toTown:{ weekdays:PROK_RET, sat:PROK_RET, sun:PROK_RET }
  },
  "Agia Anna": {
    category:"beach", travelMins:null, line:"Agios Prokopios line",
    note:"3 bus stops in Agia Anna. Many services end here.",
    fromTown:{ weekdays:PROK_OUT, sat:PROK_OUT, sun:PROK_OUT_SUN },
    toTown:{ weekdays:AA_RET, sat:AA_RET, sun:AA_RET }
  },
  "Maragkas": {
    category:"beach", travelMins:null, line:"Agios Prokopios line",
    fromTown:{ weekdays:HOURLY_08_23, sat:HOURLY_08_23, sun:HOURLY_08_23 },
    toTown:{ weekdays:MAR_RET, sat:MAR_RET, sun:MAR_RET }
  },
  "Plaka": {
    category:"beach", travelMins:null, line:"Agios Prokopios line",
    note:"Most beach services terminate here.",
    fromTown:{ weekdays:HOURLY_08_23, sat:HOURLY_08_23, sun:HOURLY_08_23 },
    toTown:{ weekdays:PLAKA_RET, sat:PLAKA_RET, sun:PLAKA_RET }
  },
  "Mikri Vigla": {
    category:"beach", travelMins:null, line:"Agios Prokopios line",
    note:"Terminus. One bus a day (14:30), Mon–Fri only. No published return — return via Plaka.",
    fromTown:{ weekdays:["14:30"] },
    toTown:{}
  },
  "Airport": {
    category:"transport", travelMins:15, line:"Airport line",
    fromTown:{ weekdays:AIRPORT_OUT, sat:AIRPORT_OUT, sun:AIRPORT_OUT },
    toTown:{ weekdays:AIRPORT_RET, sat:AIRPORT_RET, sun:AIRPORT_RET }
  },
  "Ag. Marina (Mount Zas)": {
    category:"hike", travelMins:null, line:"Filoti / Apeiranthos line",
    note:"Trailhead for the Mount Zas hike.",
    fromTown:{ weekdays:ZAS_OUT, sat:ZAS_OUT_WE, sun:ZAS_OUT_WE },
    toTown:{ weekdays:ZAS_RET, sat:ZAS_RET, sun:ZAS_RET_SUN }
  },
  "Apeiranthos": {
    category:"village", travelMins:null, line:"Filoti / Apeiranthos line",
    fromTown:{ weekdays:ZAS_OUT, sat:ZAS_OUT_WE, sun:ZAS_OUT_WE },
    toTown:{ weekdays:ZAS_RET, sat:ZAS_RET, sun:ZAS_RET_SUN }
  },
  "Filoti": {
    category:"village", travelMins:null, line:"Tragea line",
    fromTown:{ weekdays:TRAGEA_OUT, sat:TRAGEA_OUT_WE, sun:TRAGEA_OUT_WE },
    toTown:{ weekdays:TRAGEA_RET, sat:TRAGEA_RET, sun:TRAGEA_RET_SUN }
  },
  "Halki": {
    category:"village", travelMins:null, line:"Tragea line",
    note:"Tragea valley, Vallindras distillery.",
    fromTown:{ weekdays:TRAGEA_OUT, sat:["09:30","12:00","11:00","13:30","15:00"], sun:["09:30","11:00","12:00","13:30","15:00"] },
    toTown:{ weekdays:TRAGEA_RET, sat:TRAGEA_RET, sun:TRAGEA_RET_SUN }
  },
  "Sagri": {
    category:"village", travelMins:null, line:"Tragea line",
    note:"Near the Temple of Demeter (Dimitra).",
    fromTown:{ weekdays:TRAGEA_OUT, sat:TRAGEA_OUT_WE, sun:TRAGEA_OUT_WE },
    toTown:{ weekdays:["06:50","08:20","09:40","11:10","14:10","16:40"], sat:["06:50","08:20","09:40","11:10","14:10","16:40"], sun:["06:50","08:20","11:10","14:10","16:40"] }
  },
  "Damarionas - Damalas": {
    category:"village", travelMins:null, line:"Tragea line",
    fromTown:{ weekdays:TRAGEA_OUT, sat:TRAGEA_OUT_WE, sun:TRAGEA_OUT_WE },
    toTown:{ weekdays:["06:50","08:15","09:40","11:05","14:00","16:30"], sat:["06:50","08:15","09:40","11:05","14:00","16:30"], sun:["06:50","08:15","11:05","14:00","16:30"] }
  },
  "Galanado": {
    category:"village", travelMins:null, line:"Tragea line",
    fromTown:{ weekdays:["07:30","09:30","12:00","13:30","15:00"], sat:["09:30","12:00","15:00"], sun:["09:30","12:00","15:00"] },
    toTown:{ weekdays:["08:25","09:45","11:20","14:25"], sat:["09:45","11:20","14:20"], sun:["11:20","14:20"] }
  },
  "Glinado - Agersani": {
    category:"village", travelMins:null, line:"Vivlos line",
    fromTown:{ weekdays:["11:00","13:00","14:30","19:10"], sat:["11:00","13:30"], sun:["11:00","13:30"] },
    toTown:{ weekdays:["07:10","08:30","14:15","16:45"], sat:["07:10","08:30","16:45"], sun:["07:10","08:30","16:45"] }
  },
  "Vivlos (Tripodes)": {
    category:"village", travelMins:null, line:"Vivlos line",
    fromTown:{ weekdays:["11:00","13:00","14:30","19:10"], sat:["11:00","13:30"], sun:["11:00","13:30"] },
    toTown:{ weekdays:["07:10","08:30","14:15","16:45"], sat:["07:10","08:30","16:45"], sun:["07:10","08:30","16:45"] }
  },
  "Koronos": {
    category:"village", travelMins:null, line:"Apollon north line",
    fromTown:{ weekdays:["13:30","19:10"], sat:["13:30"], sun:["13:30"] },
    toTown:{ weekdays:["07:25","16:00"], sat:["07:25"], sun:["07:25"] }
  },
  "Koronida (Komiaki)": {
    category:"village", travelMins:null, line:"Apollon north line",
    fromTown:{ weekdays:["13:30","19:10"], sat:["13:30"], sun:["13:30"] },
    toTown:{ weekdays:["07:15","15:45"], sat:["07:15"], sun:["07:15"] }
  },
  "Skado": {
    category:"village", travelMins:null, line:"Apollon north line",
    fromTown:{ weekdays:["13:30","19:10"], sat:["13:30"], sun:["13:30"] },
    toTown:{ weekdays:["07:25","16:05"], sat:["07:25"], sun:["07:25"] }
  },
  "Apollon": {
    category:"village", travelMins:null, line:"Apollon north line",
    note:"Kouros of Apollonas. Tue & Thu only.",
    fromTown:{ tue:["13:30"], thu:["13:30"] },
    toTown:{ tue:["06:50","15:30"], thu:["06:50","15:30"] }
  },
  "Eggares": {
    category:"village", travelMins:null, line:"Eggares / Galini line",
    fromTown:{ weekdays:["09:30","13:30"] },
    toTown:{ weekdays:["10:00"] }
  },
  "Galini": {
    category:"village", travelMins:null, line:"Eggares / Galini line",
    fromTown:{ weekdays:["09:30","13:30"] },
    toTown:{ weekdays:["10:00"] }
  },
  "Melanes": {
    category:"village", travelMins:null, line:"Melanes line",
    fromTown:{ weekdays:["07:30","12:00"] },
    toTown:{ weekdays:["07:45","12:15"] }
  },
  "Kinidaros": {
    category:"village", travelMins:null, line:"Melanes line",
    note:"Tue & Thu only.",
    fromTown:{ tue:["12:00"], thu:["12:00"] },
    toTown:{ tue:["12:30"], thu:["12:30"] }
  },
  "Moni": {
    category:"village", travelMins:null, line:"Moni line",
    fromTown:{ weekdays:["13:30"] },
    toTown:{ weekdays:["07:45"] }
  },
  "Kastraki": {
    category:"beach", travelMins:null, line:"Southwest line",
    note:"No published return — return via Mikri Vigla / Plaka.",
    fromTown:{ weekdays:["14:30"] },
    toTown:{}
  },
  "Keramoti": {
    category:"village", travelMins:null, line:"Mountain line",
    note:"Wed only.",
    fromTown:{ wed:["13:30"] },
    toTown:{ wed:["07:20"] }
  },
  "Danakos": {
    category:"village", travelMins:null, line:"Filoti area",
    note:"Tue & Thu only.",
    fromTown:{ tue:["13:30"], thu:["13:30"] },
    toTown:{ tue:["07:45"], thu:["07:45"] }
  },
  "Messi": {
    category:"village", travelMins:null, line:"Tragea line",
    note:"Tue & Thu only.",
    fromTown:{ tue:["13:30"], thu:["13:30"] },
    toTown:{ tue:["07:00"], thu:["07:00"] }
  },
  "Potamia - Tsikalario": {
    category:"village", travelMins:null, line:"Tragea line",
    note:"Tue only.",
    fromTown:{ tue:["13:30"] },
    toTown:{ tue:["07:45"] }
  }
};

// Optional friendly POI aliases -> destination key above.
// Lets users search "Mount Zas" or "Temple of Demeter" and land on the right stop.
export const POI_ALIASES = {
  "Mount Zas (Zeus) trailhead":"Ag. Marina (Mount Zas)",
  "Temple of Demeter (Dimitra)":"Sagri",
  "Kouros of Apollonas":"Apollon",
  "Vallindras Distillery (Halki)":"Halki",
  "Plaka Beach":"Plaka",
  "Agios Prokopios Beach":"Agios Prokopios",
  "Naxos Airport (JNX)":"Airport"
};

export const SCHEDULE_META = {
  validFrom:"2026-05-18",
  validTo:"2026-05-29",
  source:"https://naxosbuses.com/bus-schedules-july-august-copy/",
  note:"Hand-transcribed snapshot. Verify last buses with the operator: +30 22850 22291."
};
```

---

## 5. App logic — `src/main.js` (starter)

This is a working starting point. Refine the styling and edge cases as needed, but the core behavior (pick POI → both directions → today + next-bus) is here.

```js
import './style.css'
import { DESTINATIONS, POI_ALIASES, SCHEDULE_META } from './data.js'

const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun']
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// Resolve a destination's times for a JS day index (0=Sun..6=Sat) -> our Mon=0 model
function jsDayToIndex(d){ return d === 0 ? 6 : d - 1 } // Sun->6, Mon->0

function timesForDay(block, dayIdx){
  if(!block) return []
  const key = DAY_KEYS[dayIdx]
  if(block[key]) return block[key]
  if(dayIdx <= 4 && block.weekdays) return block.weekdays  // Mon–Fri
  return []
}

function nowHM(){
  const d = new Date()
  return d.getHours()*60 + d.getMinutes()
}
function toMinutes(t){ const [h,m]=t.split(':').map(Number); return h*60+m }

const state = {
  dest: null,
  dayIdx: jsDayToIndex(new Date().getDay())
}

const app = document.querySelector('#app')

function render(){
  app.innerHTML = ''
  app.appendChild(header())
  app.appendChild(picker())
  if(state.dest) app.appendChild(results())
  app.appendChild(footer())
}

function header(){
  const el = document.createElement('header')
  el.innerHTML = `<h1>Naxos bus</h1>
    <p class="sub">Pick where you're going. Times both ways, next bus highlighted.</p>`
  return el
}

function picker(){
  const wrap = document.createElement('div')
  wrap.className = 'picker'
  const select = document.createElement('select')
  select.innerHTML = `<option value="">Where do you want to go?</option>` +
    Object.keys(DESTINATIONS).sort().map(k => `<option value="${k}">${k}</option>`).join('')
  select.value = state.dest || ''
  select.onchange = e => { state.dest = e.target.value || null; render() }
  wrap.appendChild(select)
  return wrap
}

function dayChips(){
  const row = document.createElement('div')
  row.className = 'days'
  const todayIdx = jsDayToIndex(new Date().getDay())
  DAY_LABELS.forEach((lbl,i)=>{
    const b = document.createElement('button')
    b.textContent = lbl + (i===todayIdx ? ' • today' : '')
    b.className = 'chip' + (i===state.dayIdx ? ' active':'')
    b.onclick = ()=>{ state.dayIdx = i; render() }
    row.appendChild(b)
  })
  return row
}

function panel(title, icon, times, isToday){
  const el = document.createElement('div')
  el.className = 'panel'
  if(!times.length){
    el.innerHTML = `<h3>${icon} ${title}</h3><p class="none">No service on this day.</p>`
    return el
  }
  const now = nowHM()
  let nextFound = false
  const pills = times.map(t=>{
    let cls = 'time'
    if(isToday){
      if(!nextFound && toMinutes(t) >= now){ cls += ' next'; nextFound = true }
      else if(toMinutes(t) < now){ cls += ' past' }
    }
    return `<span class="${cls}">${t}</span>`
  }).join('')
  el.innerHTML = `<h3>${icon} ${title}</h3><div class="pills">${pills}</div>`
  return el
}

function results(){
  const d = DESTINATIONS[state.dest]
  const wrap = document.createElement('section')
  wrap.className = 'results'
  const isToday = state.dayIdx === jsDayToIndex(new Date().getDay())

  const meta = []
  if(d.line) meta.push(d.line)
  if(d.travelMins) meta.push(`~${d.travelMins} min from town`)
  wrap.innerHTML = `<h2>${state.dest}</h2>
    <p class="meta">${meta.join(' · ')}</p>
    ${d.note ? `<p class="note">${d.note}</p>` : ''}`

  wrap.appendChild(dayChips())
  wrap.appendChild(panel('Getting there (from Naxos Town)', '↗', timesForDay(d.fromTown, state.dayIdx), isToday))
  wrap.appendChild(panel('Getting back (to Naxos Town)', '↘', timesForDay(d.toTown, state.dayIdx), isToday))
  return wrap
}

function footer(){
  const el = document.createElement('footer')
  el.innerHTML = `<p>Schedule valid ${SCHEDULE_META.validFrom} to ${SCHEDULE_META.validTo}.
    Verify last buses with the operator. Hand-transcribed — not official.</p>`
  return el
}

render()
```

`index.html` body just needs: `<div id="app"></div>` and `<script type="module" src="/src/main.js"></script>`.

---

## 6. Styles — `src/style.css` (starter)

Clean, flat, mobile-first. Tune freely.

```css
:root{
  --bg:#faf9f5; --surface:#fff; --ink:#1d1d1b; --muted:#6b6b66;
  --line:#e6e4dc; --accent:#1d9e75; --accent-bg:#e1f5ee; --past:#bcbcb6;
  --radius:12px; --mono:'SFMono-Regular',ui-monospace,Menlo,monospace;
  --sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);line-height:1.5}
#app{max-width:560px;margin:0 auto;padding:20px 16px 48px}
h1{font-size:22px;margin:0 0 2px;font-weight:600}
.sub{color:var(--muted);margin:0 0 16px;font-size:14px}
.picker select{width:100%;padding:14px;font-size:16px;border:1px solid var(--line);
  border-radius:var(--radius);background:var(--surface);color:var(--ink)}
.results{margin-top:20px}
.results h2{font-size:20px;margin:0 0 2px}
.meta{color:var(--muted);font-size:13px;margin:0 0 6px}
.note{font-size:13px;background:#fff7e6;border-radius:8px;padding:8px 10px;margin:0 0 12px}
.days{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}
.chip{font-size:13px;padding:6px 10px;border:1px solid var(--line);border-radius:999px;
  background:var(--surface);color:var(--ink);cursor:pointer}
.chip.active{background:var(--ink);color:#fff;border-color:var(--ink)}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);
  padding:14px;margin-bottom:12px}
.panel h3{font-size:15px;margin:0 0 10px;font-weight:600}
.pills{display:flex;flex-wrap:wrap;gap:6px}
.time{font-family:var(--mono);font-size:14px;padding:5px 9px;border-radius:8px;
  background:var(--bg);border:1px solid var(--line)}
.time.next{background:var(--accent-bg);border-color:var(--accent);color:#0f6e56;font-weight:600}
.time.past{color:var(--past);text-decoration:line-through}
.none{color:var(--muted);font-size:14px;margin:0}
footer{margin-top:24px;color:var(--muted);font-size:12px}
```

---

## 7. Build checklist for the Claude Code session

1. Scaffold with the Vite vanilla template; remove the demo files.
2. Create `src/data.js`, `src/main.js`, `src/style.css` from sections 4–6.
3. Update `index.html` to a single `#app` div + module script; set the page title.
4. Add `vite.config.js` with the correct `base` (`/<repo>/`).
5. Add `.github/workflows/deploy.yml`.
6. `npm run dev`, verify: picking a destination shows both directions; day chips work; "today" highlights the next bus and strikes through past ones; day-specific routes (Apollon, Keramoti) only show on their days.
7. Commit, push to `main`, set Pages source to GitHub Actions, confirm the live URL.

### Nice-to-have follow-ups (not required for v1)
- Type-to-filter search over destinations + `POI_ALIASES`.
- Group the picker by category (beaches / villages / transport / hikes).
- "Last bus back" badge so users don't get stranded.
- A small "data may be outdated — check official site" link in the footer.
- A refresh script that re-scrapes the schedule + route pages into `data.js`.
```
