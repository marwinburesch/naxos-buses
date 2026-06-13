import './style.css'
import { SCHEDULES } from './data.js'

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
function sortTimes(times){ return [...times].sort((a,b)=>toMinutes(a)-toMinutes(b)) }

// Local YYYY-MM-DD for today, to compare against schedule validFrom/validTo.
function todayISO(){
  const d = new Date()
  const p = n => String(n).padStart(2,'0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}

// Pick the schedule covering today; otherwise the nearest (first if before all, last if after all).
function pickScheduleForToday(){
  const iso = todayISO()
  const inRange = SCHEDULES.find(s => iso >= s.validFrom && iso <= s.validTo)
  if(inRange) return inRange
  const sorted = [...SCHEDULES].sort((a,b)=> a.validFrom < b.validFrom ? -1 : 1)
  if(iso < sorted[0].validFrom) return sorted[0]
  return sorted[sorted.length - 1]
}

function fmtRange(s){
  // "2026-06-16" -> "16 Jun"
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const f = iso => { const [,m,d] = iso.split('-'); return `${Number(d)} ${MON[Number(m)-1]}` }
  return `${f(s.validFrom)} – ${f(s.validTo)}`
}

const autoSchedule = pickScheduleForToday()

const state = {
  scheduleId: autoSchedule.id,
  dest: null,
  dayIdx: jsDayToIndex(new Date().getDay())
}

function activeSchedule(){ return SCHEDULES.find(s => s.id === state.scheduleId) || SCHEDULES[0] }
function scheduleCoversToday(s){ const iso = todayISO(); return iso >= s.validFrom && iso <= s.validTo }

const app = document.querySelector('#app')

function render(){
  app.innerHTML = ''
  app.appendChild(header())
  if(SCHEDULES.length > 1) app.appendChild(scheduleSwitcher())
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

function scheduleSwitcher(){
  const wrap = document.createElement('div')
  wrap.className = 'schedules'
  SCHEDULES.forEach(s => {
    const b = document.createElement('button')
    const isNow = scheduleCoversToday(s)
    b.className = 'sched-chip' + (s.id === state.scheduleId ? ' active' : '')
    b.innerHTML = `<span class="sched-label">${s.label}</span>` +
      `<span class="sched-range">${fmtRange(s)}${isNow ? ' · now' : ''}</span>`
    b.onclick = () => {
      state.scheduleId = s.id
      // Drop the selected destination if it doesn't exist in the chosen schedule.
      if(state.dest && !s.destinations[state.dest]) state.dest = null
      render()
    }
    wrap.appendChild(b)
  })
  return wrap
}

function picker(){
  const wrap = document.createElement('div')
  wrap.className = 'picker'
  const select = document.createElement('select')
  const { destinations, aliases } = activeSchedule()

  let html = `<option value="">Where do you want to go?</option>`

  for(const group of CATEGORY_GROUPS){
    const keys = Object.keys(destinations)
      .filter(k => destinations[k].category === group.key)
      .sort()
    if(!keys.length) continue
    html += `<optgroup label="${group.label}">` +
      keys.map(k => `<option value="${k}">${k}</option>`).join('') +
      `</optgroup>`
  }

  const aliasNames = Object.keys(aliases || {})
    .filter(name => destinations[aliases[name]])  // only aliases valid in this schedule
    .sort()
  if(aliasNames.length){
    html += `<optgroup label="📍  Landmarks">` +
      aliasNames.map(name => `<option value="${aliases[name]}">${name}</option>`).join('') +
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

function panel(title, icon, rawTimes, highlightNow, opts={}){
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
    if(highlightNow){
      if(!nextFound && toMinutes(t) >= now){ cls += ' next'; nextFound = true }
      else if(toMinutes(t) < now){ cls += ' past' }
    }
    return `<span class="${cls}">${t}</span>`
  }).join('')

  let badge = ''
  if(opts.lastBadge){
    const last = times[times.length - 1]
    const missed = highlightNow && now > toMinutes(last)
    badge = `<span class="lastbus${missed ? ' missed' : ''}">last back ${last}${missed ? ' · gone' : ''}</span>`
  }

  el.innerHTML = `<h3>${icon} ${title}${badge}</h3><div class="pills">${pills}</div>`
  return el
}

function results(){
  const sched = activeSchedule()
  const d = sched.destinations[state.dest]
  const wrap = document.createElement('section')
  wrap.className = 'results'
  // Highlight the next bus only when viewing the live schedule AND the selected day is today.
  const isToday = state.dayIdx === jsDayToIndex(new Date().getDay())
  const highlightNow = isToday && scheduleCoversToday(sched)

  const meta = []
  if(d.line) meta.push(d.line)
  if(d.travelMins) meta.push(`~${d.travelMins} min from town`)
  const icon = CATEGORY_ICON[d.category] || ''
  wrap.innerHTML = `<h2>${icon} ${state.dest}</h2>
    <p class="meta">${meta.join(' · ')}</p>
    ${d.note ? `<p class="note">${d.note}</p>` : ''}`

  wrap.appendChild(dayChips())
  wrap.appendChild(panel('Getting there (from Naxos Town)', '↗', timesForDay(d.fromTown, state.dayIdx), highlightNow))
  wrap.appendChild(panel('Getting back (to Naxos Town)', '↘', timesForDay(d.toTown, state.dayIdx), highlightNow, {
    lastBadge: true,
    emptyNote: 'No published return for this stop — check the note above or ask the driver.'
  }))
  return wrap
}

function footer(){
  const sched = activeSchedule()
  const el = document.createElement('footer')
  el.innerHTML = `<p>Showing the <strong>${sched.label.toLowerCase()}</strong> schedule (${fmtRange(sched)}).
    Hand-transcribed — not official. Verify last buses with the operator.</p>
    <p><a href="${sched.source}" target="_blank" rel="noopener noreferrer">Check the official site →</a></p>`
  return el
}

render()
