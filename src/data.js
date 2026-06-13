// Naxos bus timetables — multiple seasonal schedules.
//
// The app auto-selects the schedule whose [validFrom, validTo] range contains
// today's date, and lets the user override via a selector.
//
// Schema per destination:
//   category: 'beach' | 'village' | 'transport' | 'hike'  (grouping/icons only)
//   travelMins: minutes Town -> POI, or null if not sourced
//   line: human label for the line
//   note: optional caveat shown above the times
//   fromTown / toTown: { weekdays?, mon?, tue?, wed?, thu?, fri?, sat?, sun? }
//     - `weekdays` fills Mon–Fri; explicit per-day keys override it.
//     - empty/absent array for a day = no service that day.
//
// Times use the operator's "24:00 / 24:35" past-midnight notation verbatim.

// Build a sequence of "HH:MM" strings from start..end minutes (inclusive) by step.
// Hours may exceed 23 (e.g. 1440 -> "24:00") to match the source notation.
const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const seq = (start, end, step) => { const out = []; for (let m = start; m <= end; m += step) out.push(hhmm(m)); return out }

// ===================================================================
//  SCHEDULE 1 — Spring snapshot (18 May – 15 June 2026)
//  Hand-transcribed from the 18–29 May 2026 table.
// ===================================================================

const HOURLY_08_23 = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];

const PROK_OUT = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","20:00","21:00","22:00","23:00"];
const PROK_OUT_SUN = ["08:00","09:00","10:00","11:00","12:00","13:00","13:30","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"];

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

const TRAGEA_OUT = ["07:30","09:30","11:00","12:00","13:30","15:00","19:10"];
const TRAGEA_OUT_WE = ["09:30","11:00","12:00","13:30","15:00"];
const TRAGEA_RET = ["06:50","08:00","09:30","11:00","14:00","16:30"];
const TRAGEA_RET_SUN = ["06:50","08:00","11:00","14:00","16:30"];

const MAY_DESTINATIONS = {
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

const MAY_ALIASES = {
  "Mount Zas (Zeus) trailhead":"Ag. Marina (Mount Zas)",
  "Temple of Demeter (Dimitra)":"Sagri",
  "Kouros of Apollonas":"Apollon",
  "Vallindras Distillery (Halki)":"Halki",
  "Plaka Beach":"Plaka",
  "Agios Prokopios Beach":"Agios Prokopios",
  "Naxos Airport (JNX)":"Airport"
};

// ===================================================================
//  SCHEDULE 2 — Spring season 2 (16 – 30 June 2026)
//  Transcribed from https://naxosbuses.com/bus-schedules-spring-season-2/
// ===================================================================

// Beach lines (run all week, identical Mon–Sun). Times use 24:00 notation.
const PROK_OUT_J     = ["07:15","07:30", ...seq(8*60, 24*60, 30)];        // 07:15, 07:30, 08:00..24:00
const BEACH_OUT_J    = ["07:30", ...seq(8*60, 24*60, 30)];                // Agia Anna / Maragkas / Plaka
const PROK_RET_J     = seq(7*60+35, 24*60+35, 30);                        // 07:35..24:35
const AA_RET_J       = seq(7*60+30, 24*60+30, 30);                        // 07:30..24:30
const MAR_PLAKA_RET_J= seq(8*60, 24*60+30, 30);                           // 08:00..24:30
const AIRPORT_OUT_J  = seq(7*60+15, 19*60+15, 60);                        // hourly 07:15..19:15
const AIRPORT_RET_J  = ["07:25","08:25","08:45","09:25","09:45","10:25","10:45","11:25","11:45","12:25","12:45","13:25","13:45","14:25","14:45","15:25","15:45","16:25","16:45","17:25","17:45","18:25","18:45","19:25"];

const SW_OUT_J = ["07:30","11:00","13:30","16:30"]; // Mikri Vigla / Kastraki / Alyko

// Tragea line (Filoti / Halki / Sagri / Damarionas) — Mon–Fri identical.
const TRAGEA_OUT_J    = ["07:30","09:30","11:00","12:00","13:30","15:00","17:15","20:15"];
const TRAGEA_OUT_WE_J = ["09:30","11:00","12:00","13:30","15:00","17:15"]; // Sat & Sun
const FIL_RET_J       = ["06:50","08:00","09:30","11:00","14:00","16:30","18:45"];
const FIL_RET_SUN_J   = ["06:50","08:00","11:00","14:00","16:30","18:45"];

// Apeiranthos line (Apeiranthos / Ag. Marina / Abraam) — Mon differs from Tue–Fri (extra 19:10).
const APE_OUT_MON_J = ["07:30","09:30","11:00","13:30","15:00","17:15","20:15"];
const APE_OUT_TTF_J = ["07:30","09:30","11:00","13:30","15:00","17:15","19:10","20:15"]; // Tue–Fri
const APE_OUT_SAT_J = ["07:30","09:30","11:00","13:30","15:00","17:15"];
const APE_OUT_SUN_J = ["09:30","11:00","13:30","15:00","17:15"];
const APE_RET_J     = ["07:50","09:15","10:45","13:45","16:15","18:30"]; // Mon–Sat
const APE_RET_SUN_J = ["07:50","10:45","13:45","16:15","18:30"];

const apeOutbound = () => ({ mon:APE_OUT_MON_J, tue:APE_OUT_TTF_J, wed:APE_OUT_TTF_J, thu:APE_OUT_TTF_J, fri:APE_OUT_TTF_J, sat:APE_OUT_SAT_J, sun:APE_OUT_SUN_J });

const GAL_OUT_J = ["09:30","11:00","12:00","13:30","15:00","17:15"]; // Galanado, all week

const JUNE_DESTINATIONS = {
  "Agios Prokopios": {
    category:"beach", travelMins:15, line:"Agios Prokopios line",
    note:"Alight at the front of the beach.",
    fromTown:{ weekdays:PROK_OUT_J, sat:PROK_OUT_J, sun:PROK_OUT_J },
    toTown:{ weekdays:PROK_RET_J, sat:PROK_RET_J, sun:PROK_RET_J }
  },
  "Agia Anna": {
    category:"beach", travelMins:null, line:"Agios Prokopios line",
    note:"3 bus stops in Agia Anna.",
    fromTown:{ weekdays:BEACH_OUT_J, sat:BEACH_OUT_J, sun:BEACH_OUT_J },
    toTown:{ weekdays:AA_RET_J, sat:AA_RET_J, sun:AA_RET_J }
  },
  "Maragkas": {
    category:"beach", travelMins:null, line:"Agios Prokopios line",
    fromTown:{ weekdays:BEACH_OUT_J, sat:BEACH_OUT_J, sun:BEACH_OUT_J },
    toTown:{ weekdays:MAR_PLAKA_RET_J, sat:MAR_PLAKA_RET_J, sun:MAR_PLAKA_RET_J }
  },
  "Plaka": {
    category:"beach", travelMins:null, line:"Agios Prokopios line",
    fromTown:{ weekdays:BEACH_OUT_J, sat:BEACH_OUT_J, sun:BEACH_OUT_J },
    toTown:{ weekdays:MAR_PLAKA_RET_J, sat:MAR_PLAKA_RET_J, sun:MAR_PLAKA_RET_J }
  },
  "Mikri Vigla": {
    category:"beach", travelMins:null, line:"Southwest line",
    fromTown:{ weekdays:SW_OUT_J, sat:SW_OUT_J, sun:SW_OUT_J },
    toTown:{ weekdays:["07:50","11:20","13:50","17:00"], sat:["07:50","11:20","13:50","17:00"], sun:["07:50","11:20","13:50","17:00"] }
  },
  "Kastraki": {
    category:"beach", travelMins:null, line:"Southwest line",
    fromTown:{ weekdays:SW_OUT_J, sat:SW_OUT_J, sun:SW_OUT_J },
    toTown:{ weekdays:["08:00","11:30","14:00","17:10"], sat:["08:00","11:30","14:00","17:10"], sun:["08:00","11:30","14:00","17:10"] }
  },
  "Alyko (Hawai)": {
    category:"beach", travelMins:null, line:"Southwest line",
    note:"Alyko / Hawaii beach.",
    fromTown:{ weekdays:SW_OUT_J, sat:SW_OUT_J, sun:SW_OUT_J },
    toTown:{ weekdays:["08:10","11:40","14:10","17:20"], sat:["08:10","11:40","14:10","17:20"], sun:["08:10","11:40","14:10","17:20"] }
  },
  "Orkos": {
    category:"beach", travelMins:null, line:"Southwest line",
    fromTown:{ weekdays:["07:30","11:00","13:30"], sat:["07:30","11:00","13:30"], sun:["07:30","11:00","13:30"] },
    toTown:{ weekdays:["11:45","13:55"], sat:["11:45","13:55"], sun:["11:45","13:55"] }
  },
  "Airport": {
    category:"transport", travelMins:15, line:"Airport line",
    fromTown:{ weekdays:AIRPORT_OUT_J, sat:AIRPORT_OUT_J, sun:AIRPORT_OUT_J },
    toTown:{ weekdays:AIRPORT_RET_J, sat:AIRPORT_RET_J, sun:AIRPORT_RET_J }
  },
  "Ag. Marina (Mount Zas)": {
    category:"hike", travelMins:null, line:"Apeiranthos line",
    note:"Trailhead for the Mount Zas hike. Return uses the Apeiranthos line times.",
    fromTown:apeOutbound(),
    toTown:{ weekdays:APE_RET_J, sat:APE_RET_J, sun:APE_RET_SUN_J }
  },
  "Apeiranthos": {
    category:"village", travelMins:null, line:"Apeiranthos line",
    fromTown:apeOutbound(),
    toTown:{ weekdays:APE_RET_J, sat:APE_RET_J, sun:APE_RET_SUN_J }
  },
  "Abraam": {
    category:"beach", travelMins:null, line:"Apeiranthos line",
    note:"Abraam beach (north), served by the Apeiranthos line.",
    fromTown:apeOutbound(),
    toTown:{ weekdays:APE_RET_J, sat:APE_RET_J, sun:APE_RET_SUN_J }
  },
  "Filoti": {
    category:"village", travelMins:null, line:"Tragea line",
    fromTown:{ weekdays:TRAGEA_OUT_J, sat:TRAGEA_OUT_WE_J, sun:TRAGEA_OUT_WE_J },
    toTown:{ weekdays:FIL_RET_J, sat:FIL_RET_J, sun:FIL_RET_SUN_J }
  },
  "Halki": {
    category:"village", travelMins:null, line:"Tragea line",
    note:"Tragea valley, Vallindras distillery.",
    fromTown:{ weekdays:TRAGEA_OUT_J, sat:["09:30","12:00","11:00","13:30","15:00","17:15"], sun:TRAGEA_OUT_WE_J },
    toTown:{ weekdays:FIL_RET_J, sat:FIL_RET_J, sun:FIL_RET_SUN_J }
  },
  "Sagri": {
    category:"village", travelMins:null, line:"Tragea line",
    note:"Near the Temple of Demeter (Dimitra).",
    fromTown:{ weekdays:TRAGEA_OUT_J, sat:TRAGEA_OUT_WE_J, sun:TRAGEA_OUT_WE_J },
    toTown:{ weekdays:["06:50","08:20","09:40","11:10","14:10","16:40","18:55"], sat:["06:50","08:20","09:40","11:10","14:10","16:40","18:55"], sun:["06:50","08:20","11:10","14:10","16:40","18:55"] }
  },
  "Damarionas - Damalas": {
    category:"village", travelMins:null, line:"Tragea line",
    fromTown:{ weekdays:TRAGEA_OUT_J, sat:TRAGEA_OUT_WE_J, sun:TRAGEA_OUT_WE_J },
    toTown:{ weekdays:["06:50","08:15","09:40","11:05","14:00","16:30","18:50"], sat:["06:50","08:15","09:40","11:05","14:00","16:30","18:50"], sun:["06:50","08:15","11:05","14:00","16:30","18:50"] }
  },
  "Galanado": {
    category:"village", travelMins:null, line:"Tragea line",
    fromTown:{ weekdays:GAL_OUT_J, sat:GAL_OUT_J, sun:GAL_OUT_J },
    toTown:{ weekdays:["08:25","09:45","11:20","14:25","16:45","19:05"], sat:["09:45","11:20","14:25","16:45","19:05"], sun:["11:20","14:25","16:45","19:05"] }
  },
  "Glinado - Agersani": {
    category:"village", travelMins:null, line:"Vivlos line",
    fromTown:{ weekdays:["11:00","13:00","16:30","20:15"], sat:["11:00","13:00","16:30"], sun:["11:00","13:00","16:30"] },
    toTown:{ weekdays:["07:10","08:30","11:15","17:55"], sat:["07:10","08:30","11:15","17:55"], sun:["07:10","08:30","11:15","17:55"] }
  },
  "Vivlos (Tripodes)": {
    category:"village", travelMins:null, line:"Vivlos line",
    fromTown:{ weekdays:["11:00","13:00","16:30","20:15"], sat:["11:00","13:00","16:30"], sun:["11:00","13:00","16:30"] },
    toTown:{ weekdays:["07:10","08:30","11:15","17:55"], sat:["07:10","08:30","11:15","17:55"], sun:["07:10","08:30","11:15","17:55"] }
  },
  "Koronos": {
    category:"village", travelMins:null, line:"Apollon north line",
    fromTown:{ weekdays:["13:30","20:15"], sat:["13:30"], sun:["13:30"] },
    toTown:{ weekdays:["07:25","16:00"], sat:["07:25"], sun:["07:25"] }
  },
  "Koronida (Komiaki)": {
    category:"village", travelMins:null, line:"Apollon north line",
    fromTown:{ weekdays:["13:30","20:15"], sat:["13:30"], sun:["13:30"] },
    toTown:{ weekdays:["07:15","15:45"], sat:["07:15"], sun:["07:15"] }
  },
  "Skado": {
    category:"village", travelMins:null, line:"Apollon north line",
    fromTown:{ weekdays:["13:30","20:15"], sat:["13:30"], sun:["13:30"] },
    toTown:{ weekdays:["07:25","16:05"], sat:["07:25"], sun:["07:25"] }
  },
  "Apollon": {
    category:"village", travelMins:null, line:"Apollon north line",
    note:"Kouros of Apollonas. Mon–Fri only.",
    fromTown:{ weekdays:["13:30"] },
    toTown:{ weekdays:["06:50","15:30"] }
  },
  "Eggares": {
    category:"village", travelMins:null, line:"Eggares / Galini line",
    fromTown:{ weekdays:["09:30","14:00"] },
    toTown:{ weekdays:["10:00","14:15"] }
  },
  "Galini": {
    category:"village", travelMins:null, line:"Eggares / Galini line",
    fromTown:{ weekdays:["09:30","14:00"] },
    toTown:{ weekdays:["10:00","14:15"] }
  },
  "Melanes": {
    category:"village", travelMins:null, line:"Melanes line",
    fromTown:{ weekdays:["07:30","12:00","15:00"] },
    toTown:{ weekdays:["09:15","12:15","15:15"] }
  },
  "Kinidaros": {
    category:"village", travelMins:null, line:"Melanes line",
    note:"Mon–Fri only.",
    fromTown:{ weekdays:["08:30","12:00"] },
    toTown:{ weekdays:["09:00","12:30"] }
  },
  "Moni": {
    category:"village", travelMins:null, line:"Moni line",
    fromTown:{ weekdays:["13:30"] },
    toTown:{ weekdays:["07:45"] }
  },
  "Keramoti": {
    category:"village", travelMins:null, line:"Mountain line",
    note:"Mon only.",
    fromTown:{ mon:["13:30"] },
    toTown:{ mon:["07:20"] }
  },
  "Danakos": {
    category:"village", travelMins:null, line:"Filoti area",
    note:"Mon only.",
    fromTown:{ mon:["13:30"] },
    toTown:{ mon:["07:45"] }
  },
  "Messi": {
    category:"village", travelMins:null, line:"Tragea line",
    note:"Mon & Tue only.",
    fromTown:{ mon:["13:30"], tue:["13:30"] },
    toTown:{ mon:["07:00"], tue:["07:00"] }
  },
  "Potamia - Tsikalario": {
    category:"village", travelMins:null, line:"Tragea line",
    fromTown:{ weekdays:["13:30"] },
    toTown:{ weekdays:["07:45"] }
  }
};

const JUNE_ALIASES = {
  "Mount Zas (Zeus) trailhead":"Ag. Marina (Mount Zas)",
  "Temple of Demeter (Dimitra)":"Sagri",
  "Kouros of Apollonas":"Apollon",
  "Vallindras Distillery (Halki)":"Halki",
  "Hawaii Beach (Alyko)":"Alyko (Hawai)",
  "Plaka Beach":"Plaka",
  "Agios Prokopios Beach":"Agios Prokopios",
  "Naxos Airport (JNX)":"Airport"
};

// ===================================================================
//  Schedules — ordered; the app auto-selects by today's date.
// ===================================================================
export const SCHEDULES = [
  {
    id:"may",
    label:"Until 15 Jun",
    validFrom:"2026-05-18",
    validTo:"2026-06-15",
    source:"https://naxosbuses.com/bus-schedules-july-august-copy/",
    note:"Hand-transcribed snapshot. Verify last buses with the operator: +30 22850 22291.",
    destinations:MAY_DESTINATIONS,
    aliases:MAY_ALIASES
  },
  {
    id:"jun",
    label:"From 16 Jun",
    validFrom:"2026-06-16",
    validTo:"2026-06-30",
    source:"https://naxosbuses.com/bus-schedules-spring-season-2/",
    note:"Hand-transcribed from the spring-season-2 table. Verify last buses with the operator: +30 22850 22291.",
    destinations:JUNE_DESTINATIONS,
    aliases:JUNE_ALIASES
  }
];
