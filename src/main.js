import './style.css'
import { DESTINATIONS, POI_ALIASES, SCHEDULE_META } from './data.js'

const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun']
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const CATEGORY_GROUPS = [
  { key:'beach',     label:'🏖  Beaches' },
  { key:'village',   label:'🏘  Villages' },
  { key:'transport', label:'✈  Transport' },
  { key:'hike',      label:'🥾  Hikes' },
]
const CATEGORY_ICON = { beach:'🏖', village:'🏘', transport:'✈', hike:'🥾' }

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

// Sort time strings chronologically (data is mostly sorted, but a few rows are not).
function sortTimes(times){ return [...times].sort((a,b)=>toMinutes(a)-toMinutes(b)) }

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

  let html = `<option value="">Where do you want to go?</option>`

  // Grouped by category.
  for(const group of CATEGORY_GROUPS){
    const keys = Object.keys(DESTINATIONS)
      .filter(k => DESTINATIONS[k].category === group.key)
      .sort()
    if(!keys.length) continue
    html += `<optgroup label="${group.label}">` +
      keys.map(k => `<option value="${k}">${k}</option>`).join('') +
      `</optgroup>`
  }

  // Friendly landmark aliases resolve to their underlying stop.
  const aliasNames = Object.keys(POI_ALIASES).sort()
  if(aliasNames.length){
    html += `<optgroup label="📍  Landmarks">` +
      aliasNames.map(name => {
        const target = POI_ALIASES[name]
        return `<option value="${target}">${name}</option>`
      }).join('') +
      `</optgroup>`
  }

  select.innerHTML = html
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

function panel(title, icon, rawTimes, isToday, opts={}){
  const el = document.createElement('div')
  el.className = 'panel'
  const times = sortTimes(rawTimes)
  if(!times.length){
    const fallback = opts.emptyNote || 'No service on this day.'
    el.innerHTML = `<h3>${icon} ${title}</h3><p class="none">${fallback}</p>`
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

  // "Last bus back" badge helps tourists avoid getting stranded.
  let badge = ''
  if(opts.lastBadge){
    const last = times[times.length - 1]
    const missed = isToday && now > toMinutes(last)
    badge = `<span class="lastbus${missed ? ' missed' : ''}">last back ${last}${missed ? ' · gone' : ''}</span>`
  }

  el.innerHTML = `<h3>${icon} ${title}${badge}</h3><div class="pills">${pills}</div>`
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
  const icon = CATEGORY_ICON[d.category] || ''
  wrap.innerHTML = `<h2>${icon} ${state.dest}</h2>
    <p class="meta">${meta.join(' · ')}</p>
    ${d.note ? `<p class="note">${d.note}</p>` : ''}`

  wrap.appendChild(dayChips())
  wrap.appendChild(panel('Getting there (from Naxos Town)', '↗', timesForDay(d.fromTown, state.dayIdx), isToday))
  wrap.appendChild(panel('Getting back (to Naxos Town)', '↘', timesForDay(d.toTown, state.dayIdx), isToday, {
    lastBadge: true,
    emptyNote: 'No published return for this stop — check the note above or ask the driver.'
  }))
  return wrap
}

function footer(){
  const el = document.createElement('footer')
  el.innerHTML = `<p>Schedule valid ${SCHEDULE_META.validFrom} to ${SCHEDULE_META.validTo}.
    Hand-transcribed — not official. Verify last buses with the operator.</p>
    <p><a href="${SCHEDULE_META.source}" target="_blank" rel="noopener noreferrer">Check the official site →</a></p>`
  return el
}

render()
