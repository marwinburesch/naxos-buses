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
