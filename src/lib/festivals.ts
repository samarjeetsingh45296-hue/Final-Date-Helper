import { MONTH_NAMES, toISODate } from "./calendar";

export type FestivalCategory =
  | "national"
  | "hindu"
  | "muslim"
  | "christian"
  | "sikh"
  | "jain"
  | "buddhist"
  | "cultural";

export interface Festival {
  /** Stable slug, unique per date */
  id: string;
  name: string;
  /** Compact label for tight spaces (day cards); falls back to `name`. */
  shortName: string;
  description: string;
  icon: string;
  category: FestivalCategory;
  /** ISO date `YYYY-MM-DD` */
  date: string;
  /** Flags a public holiday / gazetted holiday in India */
  isHoliday: boolean;
  /**
   * Lunar & lunisolar festivals shift each year and can differ by a day
   * depending on region or moon sighting. Flagged so the UI can say so.
   */
  isApproximate?: boolean;
}

interface FestivalMeta {
  name: string;
  shortName?: string;
  description: string;
  icon: string;
  category: FestivalCategory;
  isHoliday: boolean;
}

export const CATEGORY_LABEL: Record<FestivalCategory, string> = {
  national: "National",
  hindu: "Hindu",
  muslim: "Islamic",
  christian: "Christian",
  sikh: "Sikh",
  jain: "Jain",
  buddhist: "Buddhist",
  cultural: "Cultural",
};

/* -------------------------------------------------------------------------- */
/*  Festival definitions                                                      */
/* -------------------------------------------------------------------------- */

const META = {
  newYear: {
    name: "New Year's Day",
    description: "The first day of the Gregorian year, celebrated worldwide.",
    icon: "🎉",
    category: "cultural",
    isHoliday: false,
  },
  makarSankranti: {
    name: "Makar Sankranti",
    description: "Harvest festival marking the Sun's transit into Capricorn. Kites, sesame sweets and Pongal in the south.",
    icon: "🪁",
    category: "hindu",
    isHoliday: false,
  },
  republicDay: {
    name: "Republic Day",
    description: "Commemorates the adoption of the Constitution of India in 1950.",
    icon: "🇮🇳",
    category: "national",
    isHoliday: true,
  },
  mahaShivaratri: {
    name: "Maha Shivaratri",
    description: "The great night of Shiva, observed with fasting, vigil and prayer.",
    icon: "🔱",
    category: "hindu",
    isHoliday: true,
  },
  holi: {
    name: "Holi",
    description: "The festival of colours celebrating the arrival of spring and the triumph of good over evil.",
    icon: "🎨",
    category: "hindu",
    isHoliday: true,
  },
  eidUlFitr: {
    name: "Eid al-Fitr",
    description: "Marks the end of Ramadan, the month of fasting. Celebrated with prayer, feasts and charity.",
    icon: "🌙",
    category: "muslim",
    isHoliday: true,
  },
  ramNavami: {
    name: "Ram Navami",
    description: "Celebrates the birth of Lord Rama, the seventh avatar of Vishnu.",
    icon: "🏹",
    category: "hindu",
    isHoliday: true,
  },
  mahavirJayanti: {
    name: "Mahavir Jayanti",
    description: "Birth anniversary of Lord Mahavira, the 24th Tirthankara of Jainism.",
    icon: "🕊️",
    category: "jain",
    isHoliday: true,
  },
  goodFriday: {
    name: "Good Friday",
    description: "Commemorates the crucifixion of Jesus Christ. Observed with solemn services.",
    icon: "✝️",
    category: "christian",
    isHoliday: true,
  },
  easter: {
    name: "Easter Sunday",
    description: "Celebrates the resurrection of Jesus Christ, the most important feast in Christianity.",
    icon: "🐣",
    category: "christian",
    isHoliday: false,
  },
  baisakhi: {
    name: "Baisakhi",
    description: "Punjabi harvest festival and the founding day of the Khalsa in 1699.",
    icon: "🌾",
    category: "sikh",
    isHoliday: false,
  },
  ambedkarJayanti: {
    name: "Ambedkar Jayanti",
    description: "Birth anniversary of Dr. B. R. Ambedkar, architect of the Indian Constitution.",
    icon: "📜",
    category: "national",
    isHoliday: true,
  },
  buddhaPurnima: {
    name: "Buddha Purnima",
    description: "Marks the birth, enlightenment and passing of Gautama Buddha.",
    icon: "☸️",
    category: "buddhist",
    isHoliday: true,
  },
  eidUlAdha: {
    name: "Eid al-Adha",
    description: "The festival of sacrifice, honouring Ibrahim's devotion. Observed with prayer and sharing.",
    icon: "🕌",
    category: "muslim",
    isHoliday: true,
  },
  muharram: {
    name: "Muharram (Ashura)",
    shortName: "Muharram",
    description: "The tenth day of the Islamic new year, a day of remembrance and reflection.",
    icon: "🌒",
    category: "muslim",
    isHoliday: true,
  },
  rathYatra: {
    name: "Rath Yatra",
    description: "The grand chariot festival of Lord Jagannath in Puri, Odisha.",
    icon: "🛕",
    category: "hindu",
    isHoliday: false,
  },
  independenceDay: {
    name: "Independence Day",
    description: "Celebrates India's independence from British rule on 15 August 1947.",
    icon: "🇮🇳",
    category: "national",
    isHoliday: true,
  },
  rakshaBandhan: {
    name: "Raksha Bandhan",
    description: "Celebrates the bond between siblings with the tying of the rakhi.",
    icon: "🎀",
    category: "hindu",
    isHoliday: false,
  },
  janmashtami: {
    name: "Janmashtami",
    description: "Celebrates the birth of Lord Krishna with midnight prayers and dahi handi.",
    icon: "🪈",
    category: "hindu",
    isHoliday: true,
  },
  ganeshChaturthi: {
    name: "Ganesh Chaturthi",
    description: "Ten-day celebration welcoming Lord Ganesha, ending with the grand visarjan.",
    icon: "🐘",
    category: "hindu",
    isHoliday: true,
  },
  onam: {
    name: "Onam",
    description: "Kerala's harvest festival honouring King Mahabali, with pookalam and sadya feasts.",
    icon: "🌸",
    category: "cultural",
    isHoliday: false,
  },
  milad: {
    name: "Milad un-Nabi",
    description: "Commemorates the birth of Prophet Muhammad.",
    icon: "☪️",
    category: "muslim",
    isHoliday: true,
  },
  teachersDay: {
    name: "Teachers' Day",
    description: "Birth anniversary of Dr. Sarvepalli Radhakrishnan, honouring teachers across India.",
    icon: "🎓",
    category: "cultural",
    isHoliday: false,
  },
  gandhiJayanti: {
    name: "Mahatma Gandhi Jayanti",
    shortName: "Gandhi Jayanti",
    description: "Birth anniversary of Mahatma Gandhi, observed as the International Day of Non-Violence.",
    icon: "🕯️",
    category: "national",
    isHoliday: true,
  },
  navratri: {
    name: "Navratri Begins",
    description: "Nine nights of devotion to the Goddess Durga, celebrated with garba and dandiya.",
    icon: "💃",
    category: "hindu",
    isHoliday: false,
  },
  dussehra: {
    name: "Dussehra",
    description: "Vijayadashami — the victory of Rama over Ravana and Durga over Mahishasura.",
    icon: "🏹",
    category: "hindu",
    isHoliday: true,
  },
  karvaChauth: {
    name: "Karva Chauth",
    description: "A day-long fast observed by married women for the well-being of their spouses.",
    icon: "🌕",
    category: "hindu",
    isHoliday: false,
  },
  dhanteras: {
    name: "Dhanteras",
    description: "The first day of Diwali, auspicious for buying gold and new beginnings.",
    icon: "🪙",
    category: "hindu",
    isHoliday: false,
  },
  diwali: {
    name: "Diwali",
    description: "The festival of lights — diyas, sweets, fireworks and Lakshmi Puja.",
    icon: "🪔",
    category: "hindu",
    isHoliday: true,
  },
  bhaiDooj: {
    name: "Bhai Dooj",
    description: "Celebrates the bond between brothers and sisters, closing the Diwali festivities.",
    icon: "🤝",
    category: "hindu",
    isHoliday: false,
  },
  chhath: {
    name: "Chhath Puja",
    description: "Ancient festival dedicated to the Sun God, observed with rituals at riverbanks.",
    icon: "🌅",
    category: "hindu",
    isHoliday: false,
  },
  childrensDay: {
    name: "Children's Day",
    description: "Birth anniversary of Pandit Jawaharlal Nehru, celebrated for children across India.",
    icon: "🎈",
    category: "cultural",
    isHoliday: false,
  },
  guruNanak: {
    name: "Guru Nanak Jayanti",
    shortName: "Guru Nanak",
    description: "Birth anniversary of Guru Nanak Dev Ji, founder of Sikhism.",
    icon: "🙏",
    category: "sikh",
    isHoliday: true,
  },
  christmas: {
    name: "Christmas",
    description: "Celebrates the birth of Jesus Christ with carols, gifts and gatherings.",
    icon: "🎄",
    category: "christian",
    isHoliday: true,
  },
} satisfies Record<string, FestivalMeta>;

type MetaKey = keyof typeof META;

/* -------------------------------------------------------------------------- */
/*  Fixed-date festivals (same Gregorian date every year)                     */
/* -------------------------------------------------------------------------- */

const FIXED: Array<{ key: MetaKey; month: number; day: number }> = [
  { key: "newYear", month: 0, day: 1 },
  { key: "makarSankranti", month: 0, day: 14 },
  { key: "republicDay", month: 0, day: 26 },
  { key: "baisakhi", month: 3, day: 13 },
  { key: "ambedkarJayanti", month: 3, day: 14 },
  { key: "independenceDay", month: 7, day: 15 },
  { key: "teachersDay", month: 8, day: 5 },
  { key: "gandhiJayanti", month: 9, day: 2 },
  { key: "childrensDay", month: 10, day: 14 },
  { key: "christmas", month: 11, day: 25 },
];

/* -------------------------------------------------------------------------- */
/*  Lunar / lunisolar festivals — tabulated per year                          */
/*  Format: "M-D" using 1-based month. Dates follow the widely published      */
/*  Indian calendar and may shift ±1 day by region or moon sighting.          */
/* -------------------------------------------------------------------------- */

const LUNAR: Record<number, Partial<Record<MetaKey, string>>> = {
  2024: {
    mahaShivaratri: "3-8",
    holi: "3-25",
    eidUlFitr: "4-11",
    ramNavami: "4-17",
    mahavirJayanti: "4-21",
    buddhaPurnima: "5-23",
    eidUlAdha: "6-17",
    rathYatra: "7-7",
    muharram: "7-17",
    rakshaBandhan: "8-19",
    janmashtami: "8-26",
    ganeshChaturthi: "9-7",
    onam: "9-15",
    milad: "9-16",
    navratri: "10-3",
    dussehra: "10-12",
    karvaChauth: "10-20",
    dhanteras: "10-29",
    diwali: "10-31",
    bhaiDooj: "11-3",
    chhath: "11-7",
    guruNanak: "11-15",
  },
  2025: {
    mahaShivaratri: "2-26",
    holi: "3-14",
    eidUlFitr: "3-31",
    ramNavami: "4-6",
    mahavirJayanti: "4-10",
    buddhaPurnima: "5-12",
    eidUlAdha: "6-7",
    rathYatra: "6-27",
    muharram: "7-6",
    rakshaBandhan: "8-9",
    janmashtami: "8-16",
    ganeshChaturthi: "8-27",
    onam: "9-5",
    milad: "9-5",
    navratri: "9-22",
    dussehra: "10-2",
    karvaChauth: "10-10",
    dhanteras: "10-18",
    diwali: "10-20",
    bhaiDooj: "10-23",
    chhath: "10-27",
    guruNanak: "11-5",
  },
  2026: {
    mahaShivaratri: "2-15",
    holi: "3-4",
    eidUlFitr: "3-20",
    ramNavami: "3-26",
    mahavirJayanti: "3-31",
    buddhaPurnima: "5-1",
    eidUlAdha: "5-27",
    muharram: "6-26",
    rathYatra: "7-16",
    milad: "8-26",
    onam: "8-26",
    rakshaBandhan: "8-28",
    janmashtami: "9-4",
    ganeshChaturthi: "9-14",
    navratri: "10-11",
    dussehra: "10-20",
    karvaChauth: "10-29",
    dhanteras: "11-6",
    diwali: "11-8",
    bhaiDooj: "11-11",
    chhath: "11-15",
    guruNanak: "11-24",
  },
  2027: {
    mahaShivaratri: "3-6",
    eidUlFitr: "3-10",
    holi: "3-22",
    ramNavami: "4-15",
    mahavirJayanti: "4-20",
    eidUlAdha: "5-17",
    buddhaPurnima: "5-20",
    muharram: "6-16",
    rathYatra: "7-5",
    milad: "8-15",
    rakshaBandhan: "8-17",
    janmashtami: "8-25",
    ganeshChaturthi: "9-4",
    onam: "9-14",
    navratri: "9-30",
    dussehra: "10-9",
    karvaChauth: "10-18",
    dhanteras: "10-26",
    diwali: "10-29",
    bhaiDooj: "11-1",
    chhath: "11-4",
    guruNanak: "11-14",
  },
  2028: {
    mahaShivaratri: "2-23",
    eidUlFitr: "2-27",
    holi: "3-11",
    ramNavami: "4-3",
    mahavirJayanti: "4-8",
    eidUlAdha: "5-5",
    buddhaPurnima: "5-8",
    muharram: "6-4",
    rathYatra: "6-23",
    rakshaBandhan: "8-5",
    milad: "8-4",
    janmashtami: "8-13",
    ganeshChaturthi: "8-23",
    onam: "9-2",
    navratri: "9-19",
    dussehra: "9-27",
    karvaChauth: "10-7",
    dhanteras: "10-15",
    diwali: "10-17",
    bhaiDooj: "10-20",
    chhath: "10-24",
    guruNanak: "11-2",
  },
  2029: {
    mahaShivaratri: "2-11",
    eidUlFitr: "2-14",
    holi: "3-1",
    ramNavami: "3-23",
    mahavirJayanti: "3-28",
    eidUlAdha: "4-24",
    buddhaPurnima: "4-27",
    muharram: "5-25",
    rathYatra: "7-12",
    milad: "7-24",
    onam: "8-22",
    rakshaBandhan: "8-24",
    janmashtami: "9-1",
    ganeshChaturthi: "9-11",
    navratri: "10-8",
    dussehra: "10-17",
    karvaChauth: "10-26",
    dhanteras: "11-3",
    diwali: "11-5",
    bhaiDooj: "11-8",
    chhath: "11-12",
    guruNanak: "11-21",
  },
  2030: {
    eidUlFitr: "2-4",
    mahaShivaratri: "3-2",
    holi: "3-20",
    ramNavami: "4-12",
    eidUlAdha: "4-13",
    mahavirJayanti: "4-16",
    muharram: "5-14",
    buddhaPurnima: "5-17",
    rathYatra: "7-1",
    milad: "7-13",
    rakshaBandhan: "8-13",
    janmashtami: "8-21",
    ganeshChaturthi: "9-1",
    onam: "9-8",
    navratri: "9-27",
    dussehra: "10-6",
    karvaChauth: "10-15",
    dhanteras: "10-24",
    diwali: "10-26",
    bhaiDooj: "10-29",
    chhath: "11-2",
    guruNanak: "11-9",
  },
};

/* -------------------------------------------------------------------------- */
/*  Computed: Easter (Anonymous Gregorian algorithm) → Good Friday            */
/* -------------------------------------------------------------------------- */

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/* -------------------------------------------------------------------------- */
/*  Engine                                                                    */
/* -------------------------------------------------------------------------- */

function make(key: MetaKey, year: number, month: number, day: number, approx = false): Festival {
  const meta: FestivalMeta = META[key];
  const date = toISODate(year, month, day);
  return {
    id: `${key}-${date}`,
    date,
    name: meta.name,
    shortName: meta.shortName ?? meta.name,
    description: meta.description,
    icon: meta.icon,
    category: meta.category,
    isHoliday: meta.isHoliday,
    isApproximate: approx || undefined,
  };
}

const yearCache = new Map<number, Festival[]>();

/** All festivals in a year, sorted by date. Memoised per year. */
export function getFestivalsForYear(year: number): Festival[] {
  const cached = yearCache.get(year);
  if (cached) return cached;

  const list: Festival[] = [];

  for (const f of FIXED) list.push(make(f.key, year, f.month, f.day));

  const easter = easterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  list.push(make("goodFriday", year, goodFriday.getMonth(), goodFriday.getDate()));
  list.push(make("easter", year, easter.getMonth(), easter.getDate()));

  const lunar = LUNAR[year];
  if (lunar) {
    for (const [key, md] of Object.entries(lunar) as Array<[MetaKey, string]>) {
      const [m, d] = md.split("-").map(Number);
      list.push(make(key, year, m - 1, d, true));
    }
  }

  list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  yearCache.set(year, list);
  return list;
}

/** Festivals in a given month, keyed by ISO date for O(1) grid lookups. */
export function getFestivalsForMonth(year: number, month: number): Festival[] {
  const prefix = `${year}-${month + 1 < 10 ? "0" : ""}${month + 1}-`;
  return getFestivalsForYear(year).filter((f) => f.date.startsWith(prefix));
}

export function indexByDate(festivals: Festival[]): Map<string, Festival[]> {
  const map = new Map<string, Festival[]>();
  for (const f of festivals) {
    const arr = map.get(f.date);
    if (arr) arr.push(f);
    else map.set(f.date, [f]);
  }
  return map;
}

/** Whole days from `today` (local midnight) to the ISO date. Negative = past. */
export function daysUntil(iso: string, today: Date): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - base.getTime()) / 86_400_000);
}

/** The next festival on or after `today`, looking up to a year ahead. */
export function getUpcomingFestival(today: Date): Festival | null {
  const todayIso = toISODate(today.getFullYear(), today.getMonth(), today.getDate());
  for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
    const hit = getFestivalsForYear(year).find((f) => f.date >= todayIso);
    if (hit) return hit;
  }
  return null;
}

export function describeFestivalDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}
