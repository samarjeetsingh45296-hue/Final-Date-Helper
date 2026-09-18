/**
 * Exam & result calendar for India — school boards (Class 10 / 12), national
 * entrance tests and major competitive exams.
 *
 * Each schedule is tagged:
 *   "confirmed" – officially announced by the conducting body
 *   "expected"  – projected from the usual pattern; verify before relying on it
 *
 * Dates are "YYYY-MM-DD". Multi-day exams produce a "begins" and an "ends"
 * event so the month grid is not flooded. Edit YEARS below to add or fix dates.
 */

export type ExamStatus = "confirmed" | "expected";
export type ExamLevel = "board" | "entrance" | "competitive";

interface Schedule {
  start: string;
  end?: string;
  result?: string;
  status: ExamStatus;
  /** Result date confidence, if different from the exam date */
  resultStatus?: ExamStatus;
}

interface ExamDef {
  key: string;
  name: string;
  short: string;
  org: string;
  icon: string;
  level: ExamLevel;
  description: string;
  years: Partial<Record<number, Schedule[]>>;
}

export interface ExamEvent {
  id: string;
  /** Key of the exam definition this event belongs to (for comparisons) */
  examKey: string;
  kind: "exam" | "result";
  date: string;
  name: string;
  shortName: string;
  icon: string;
  org: string;
  level: ExamLevel;
  description: string;
  status: ExamStatus;
  /** For a multi-day exam: the full window, e.g. "17 Feb – 10 Mar" */
  window?: string;
}

const C: ExamStatus = "confirmed";
const E: ExamStatus = "expected";

/* -------------------------------------------------------------------------- */
/*  Definitions                                                               */
/* -------------------------------------------------------------------------- */

const EXAMS: ExamDef[] = [
  /* ---------------- National school boards ---------------- */
  {
    key: "cbse10",
    name: "CBSE Class 10 Board Exam",
    short: "CBSE 10th",
    org: "CBSE",
    icon: "📝",
    level: "board",
    description: "Central Board of Secondary Education — Class 10 main board examination.",
    years: {
      2025: [{ start: "2025-02-15", end: "2025-03-18", result: "2025-05-13", status: C }],
      2026: [
        { start: "2026-02-17", end: "2026-03-10", result: "2026-05-13", status: C, resultStatus: E },
        { start: "2026-05-15", end: "2026-06-01", result: "2026-06-30", status: C, resultStatus: E },
      ],
      2027: [{ start: "2027-02-15", end: "2027-03-10", result: "2027-05-13", status: E }],
    },
  },
  {
    key: "cbse12",
    name: "CBSE Class 12 Board Exam",
    short: "CBSE 12th",
    org: "CBSE",
    icon: "📝",
    level: "board",
    description: "Central Board of Secondary Education — Class 12 board examination.",
    years: {
      2025: [{ start: "2025-02-15", end: "2025-04-04", result: "2025-05-13", status: C }],
      2026: [{ start: "2026-02-17", end: "2026-04-09", result: "2026-05-13", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-15", end: "2027-04-08", result: "2027-05-13", status: E }],
    },
  },
  {
    key: "icse",
    name: "ICSE Class 10 Board Exam",
    short: "ICSE 10th",
    org: "CISCE",
    icon: "📘",
    level: "board",
    description: "Council for the Indian School Certificate Examinations — Class 10 (ICSE).",
    years: {
      2025: [{ start: "2025-02-18", end: "2025-03-27", result: "2025-04-30", status: C }],
      2026: [{ start: "2026-02-17", end: "2026-03-30", result: "2026-04-30", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-16", end: "2027-03-29", result: "2027-04-30", status: E }],
    },
  },
  {
    key: "isc",
    name: "ISC Class 12 Board Exam",
    short: "ISC 12th",
    org: "CISCE",
    icon: "📘",
    level: "board",
    description: "Council for the Indian School Certificate Examinations — Class 12 (ISC).",
    years: {
      2025: [{ start: "2025-02-13", end: "2025-04-05", result: "2025-04-30", status: C }],
      2026: [{ start: "2026-02-12", end: "2026-04-06", result: "2026-04-30", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-11", end: "2027-04-05", result: "2027-04-30", status: E }],
    },
  },

  /* ---------------- State boards ---------------- */
  {
    key: "gseb",
    name: "GSEB Class 10 & 12 Board Exam",
    short: "GSEB 10th/12th",
    org: "GSEB (Gujarat)",
    icon: "📗",
    level: "board",
    description: "Gujarat Secondary and Higher Secondary Education Board — SSC and HSC examinations.",
    years: {
      2025: [{ start: "2025-02-27", end: "2025-03-13", status: C }],
      2026: [{ start: "2026-02-26", end: "2026-03-17", status: C }],
      2027: [{ start: "2027-02-25", end: "2027-03-16", status: E }],
    },
  },
  {
    key: "gseb12r",
    name: "GSEB Class 12 Result",
    short: "GSEB 12th",
    org: "GSEB (Gujarat)",
    icon: "📗",
    level: "board",
    description: "Gujarat board HSC (Science and General stream) results.",
    years: {
      2025: [{ start: "2025-04-21", result: "2025-04-21", status: C }],
      2026: [{ start: "2026-04-30", result: "2026-04-30", status: E }],
      2027: [{ start: "2027-04-30", result: "2027-04-30", status: E }],
    },
  },
  {
    key: "gseb10r",
    name: "GSEB Class 10 Result",
    short: "GSEB 10th",
    org: "GSEB (Gujarat)",
    icon: "📗",
    level: "board",
    description: "Gujarat board SSC results.",
    years: {
      2025: [{ start: "2025-05-08", result: "2025-05-08", status: C }],
      2026: [{ start: "2026-05-08", result: "2026-05-08", status: E }],
      2027: [{ start: "2027-05-08", result: "2027-05-08", status: E }],
    },
  },
  {
    key: "mhhsc",
    name: "Maharashtra HSC (Class 12) Board Exam",
    short: "MH HSC",
    org: "MSBSHSE",
    icon: "📙",
    level: "board",
    description: "Maharashtra State Board — Higher Secondary Certificate examination.",
    years: {
      2025: [{ start: "2025-02-11", end: "2025-03-18", result: "2025-05-05", status: C }],
      2026: [{ start: "2026-02-11", end: "2026-03-18", result: "2026-05-05", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-11", end: "2027-03-18", result: "2027-05-05", status: E }],
    },
  },
  {
    key: "mhssc",
    name: "Maharashtra SSC (Class 10) Board Exam",
    short: "MH SSC",
    org: "MSBSHSE",
    icon: "📙",
    level: "board",
    description: "Maharashtra State Board — Secondary School Certificate examination.",
    years: {
      2025: [{ start: "2025-02-21", end: "2025-03-17", result: "2025-05-13", status: C }],
      2026: [{ start: "2026-02-20", end: "2026-03-17", result: "2026-05-13", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-20", end: "2027-03-17", result: "2027-05-13", status: E }],
    },
  },
  {
    key: "upmsp",
    name: "UP Board Class 10 & 12 Exam",
    short: "UP Board",
    org: "UPMSP",
    icon: "📕",
    level: "board",
    description: "Uttar Pradesh Madhyamik Shiksha Parishad — High School and Intermediate examinations.",
    years: {
      2025: [{ start: "2025-02-24", end: "2025-03-12", result: "2025-04-25", status: C }],
      2026: [{ start: "2026-02-18", end: "2026-03-12", result: "2026-04-25", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-18", end: "2027-03-12", result: "2027-04-25", status: E }],
    },
  },
  {
    key: "bseb12",
    name: "Bihar Board Class 12 Exam",
    short: "BSEB 12th",
    org: "BSEB",
    icon: "📔",
    level: "board",
    description: "Bihar School Examination Board — Intermediate examination.",
    years: {
      2025: [{ start: "2025-02-01", end: "2025-02-15", result: "2025-03-25", status: C }],
      2026: [{ start: "2026-02-02", end: "2026-02-13", result: "2026-03-25", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-01", end: "2027-02-13", result: "2027-03-25", status: E }],
    },
  },
  {
    key: "bseb10",
    name: "Bihar Board Class 10 Exam",
    short: "BSEB 10th",
    org: "BSEB",
    icon: "📔",
    level: "board",
    description: "Bihar School Examination Board — Matriculation examination.",
    years: {
      2025: [{ start: "2025-02-17", end: "2025-02-25", result: "2025-03-29", status: C }],
      2026: [{ start: "2026-02-17", end: "2026-02-25", result: "2026-03-29", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-17", end: "2027-02-25", result: "2027-03-29", status: E }],
    },
  },
  {
    key: "mpbse",
    name: "MP Board Class 10 & 12 Exam",
    short: "MP Board",
    org: "MPBSE",
    icon: "📒",
    level: "board",
    description: "Madhya Pradesh Board of Secondary Education — High School and Higher Secondary examinations.",
    years: {
      2025: [{ start: "2025-02-25", end: "2025-03-25", result: "2025-05-06", status: C }],
      2026: [{ start: "2026-02-09", end: "2026-03-12", result: "2026-05-06", status: E }],
      2027: [{ start: "2027-02-09", end: "2027-03-12", result: "2027-05-06", status: E }],
    },
  },
  {
    key: "rbse",
    name: "RBSE Class 10 & 12 Exam",
    short: "RBSE",
    org: "RBSE (Rajasthan)",
    icon: "📓",
    level: "board",
    description: "Rajasthan Board of Secondary Education — Secondary and Senior Secondary examinations.",
    years: {
      2025: [{ start: "2025-03-06", end: "2025-04-07", result: "2025-05-22", status: C }],
      2026: [{ start: "2026-03-05", end: "2026-04-07", result: "2026-05-22", status: E }],
      2027: [{ start: "2027-03-05", end: "2027-04-07", result: "2027-05-22", status: E }],
    },
  },
  {
    key: "kseab10",
    name: "Karnataka SSLC (Class 10) Exam",
    short: "KA SSLC",
    org: "KSEAB",
    icon: "📖",
    level: "board",
    description: "Karnataka School Examination and Assessment Board — SSLC examination.",
    years: {
      2025: [{ start: "2025-03-21", end: "2025-04-04", result: "2025-05-02", status: C }],
      2026: [{ start: "2026-03-20", end: "2026-04-04", result: "2026-05-02", status: E }],
      2027: [{ start: "2027-03-20", end: "2027-04-04", result: "2027-05-02", status: E }],
    },
  },
  {
    key: "kseab12",
    name: "Karnataka II PUC (Class 12) Exam",
    short: "KA II PUC",
    org: "KSEAB",
    icon: "📖",
    level: "board",
    description: "Karnataka School Examination and Assessment Board — II PUC examination.",
    years: {
      2025: [{ start: "2025-03-01", end: "2025-03-20", result: "2025-04-08", status: C }],
      2026: [{ start: "2026-03-02", end: "2026-03-20", result: "2026-04-08", status: E }],
      2027: [{ start: "2027-03-01", end: "2027-03-20", result: "2027-04-08", status: E }],
    },
  },
  {
    key: "tnsslc",
    name: "Tamil Nadu SSLC (Class 10) Exam",
    short: "TN SSLC",
    org: "TN DGE",
    icon: "📄",
    level: "board",
    description: "Tamil Nadu Directorate of Government Examinations — SSLC examination.",
    years: {
      2025: [{ start: "2025-03-28", end: "2025-04-15", result: "2025-05-09", status: C }],
      2026: [{ start: "2026-03-27", end: "2026-04-14", result: "2026-05-09", status: E }],
      2027: [{ start: "2027-03-26", end: "2027-04-14", result: "2027-05-09", status: E }],
    },
  },
  {
    key: "tnhsc",
    name: "Tamil Nadu HSC (Class 12) Exam",
    short: "TN HSC",
    org: "TN DGE",
    icon: "📄",
    level: "board",
    description: "Tamil Nadu Directorate of Government Examinations — Higher Secondary (+2) examination.",
    years: {
      2025: [{ start: "2025-03-03", end: "2025-03-25", result: "2025-05-08", status: C }],
      2026: [{ start: "2026-03-02", end: "2026-03-24", result: "2026-05-08", status: E }],
      2027: [{ start: "2027-03-01", end: "2027-03-24", result: "2027-05-08", status: E }],
    },
  },
  {
    key: "wbbse",
    name: "West Bengal Madhyamik (Class 10) Exam",
    short: "WB Madhyamik",
    org: "WBBSE",
    icon: "📃",
    level: "board",
    description: "West Bengal Board of Secondary Education — Madhyamik Pariksha.",
    years: {
      2025: [{ start: "2025-02-10", end: "2025-02-22", result: "2025-05-02", status: C }],
      2026: [{ start: "2026-02-02", end: "2026-02-12", result: "2026-05-02", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-01", end: "2027-02-12", result: "2027-05-02", status: E }],
    },
  },
  {
    key: "tsssc",
    name: "Telangana SSC (Class 10) Exam",
    short: "TS SSC",
    org: "BSE Telangana",
    icon: "📑",
    level: "board",
    description: "Board of Secondary Education, Telangana — SSC public examination.",
    years: {
      2025: [{ start: "2025-03-21", end: "2025-04-04", result: "2025-04-30", status: C }],
      2026: [{ start: "2026-03-20", end: "2026-04-03", result: "2026-04-30", status: E }],
      2027: [{ start: "2027-03-19", end: "2027-04-03", result: "2027-04-30", status: E }],
    },
  },
  {
    key: "apssc",
    name: "Andhra Pradesh SSC (Class 10) Exam",
    short: "AP SSC",
    org: "BSE AP",
    icon: "📑",
    level: "board",
    description: "Board of Secondary Education, Andhra Pradesh — SSC public examination.",
    years: {
      2025: [{ start: "2025-03-17", end: "2025-03-31", result: "2025-04-23", status: C }],
      2026: [{ start: "2026-03-16", end: "2026-03-30", result: "2026-04-23", status: E }],
      2027: [{ start: "2027-03-15", end: "2027-03-30", result: "2027-04-23", status: E }],
    },
  },
  {
    key: "keralasslc",
    name: "Kerala SSLC (Class 10) Exam",
    short: "Kerala SSLC",
    org: "Kerala Pareeksha Bhavan",
    icon: "📜",
    level: "board",
    description: "Kerala Board — SSLC examination.",
    years: {
      2025: [{ start: "2025-03-03", end: "2025-03-26", result: "2025-05-09", status: C }],
      2026: [{ start: "2026-03-02", end: "2026-03-25", result: "2026-05-09", status: E }],
      2027: [{ start: "2027-03-01", end: "2027-03-25", result: "2027-05-09", status: E }],
    },
  },

  /* ---------------- Engineering & science entrance ---------------- */
  {
    key: "jeem1",
    name: "JEE Main Session 1",
    short: "JEE Main S1",
    org: "NTA",
    icon: "⚙️",
    level: "entrance",
    description: "Joint Entrance Examination (Main), January session — gateway to NITs, IIITs and JEE Advanced.",
    years: {
      2025: [{ start: "2025-01-22", end: "2025-01-30", result: "2025-02-11", status: C }],
      2026: [{ start: "2026-01-21", end: "2026-01-30", result: "2026-02-12", status: C, resultStatus: E }],
      2027: [{ start: "2027-01-21", end: "2027-01-30", result: "2027-02-12", status: E }],
    },
  },
  {
    key: "jeem2",
    name: "JEE Main Session 2",
    short: "JEE Main S2",
    org: "NTA",
    icon: "⚙️",
    level: "entrance",
    description: "Joint Entrance Examination (Main), April session.",
    years: {
      2025: [{ start: "2025-04-02", end: "2025-04-09", result: "2025-04-18", status: C }],
      2026: [{ start: "2026-04-01", end: "2026-04-10", result: "2026-04-19", status: E }],
      2027: [{ start: "2027-04-01", end: "2027-04-10", result: "2027-04-19", status: E }],
    },
  },
  {
    key: "jeeadv",
    name: "JEE Advanced",
    short: "JEE Advanced",
    org: "IIT",
    icon: "🎯",
    level: "entrance",
    description: "Entrance examination for the Indian Institutes of Technology.",
    years: {
      2025: [{ start: "2025-05-18", result: "2025-06-02", status: C }],
      2026: [{ start: "2026-05-17", result: "2026-06-01", status: C, resultStatus: E }],
      2027: [{ start: "2027-05-23", result: "2027-06-01", status: E }],
    },
  },
  {
    key: "neet",
    name: "NEET UG",
    short: "NEET UG",
    org: "NTA",
    icon: "🩺",
    level: "entrance",
    description: "National Eligibility cum Entrance Test for MBBS, BDS and AYUSH admissions.",
    years: {
      2025: [{ start: "2025-05-04", result: "2025-06-14", status: C }],
      2026: [{ start: "2026-05-03", result: "2026-06-14", status: C, resultStatus: E }],
      2027: [{ start: "2027-05-02", result: "2027-06-14", status: E }],
    },
  },
  {
    key: "cuet",
    name: "CUET UG",
    short: "CUET UG",
    org: "NTA",
    icon: "🏛️",
    level: "entrance",
    description: "Common University Entrance Test for undergraduate admission to central and participating universities.",
    years: {
      2025: [{ start: "2025-05-13", end: "2025-06-03", result: "2025-07-04", status: C }],
      2026: [{ start: "2026-05-11", end: "2026-05-31", result: "2026-07-04", status: E }],
      2027: [{ start: "2027-05-11", end: "2027-05-31", result: "2027-07-04", status: E }],
    },
  },
  {
    key: "cuetpg",
    name: "CUET PG",
    short: "CUET PG",
    org: "NTA",
    icon: "🏛️",
    level: "entrance",
    description: "Common University Entrance Test for postgraduate admissions.",
    years: {
      2025: [{ start: "2025-03-13", end: "2025-04-03", status: C }],
      2026: [{ start: "2026-03-13", end: "2026-04-03", status: E }],
      2027: [{ start: "2027-03-13", end: "2027-04-03", status: E }],
    },
  },
  {
    key: "gate",
    name: "GATE",
    short: "GATE",
    org: "IIT",
    icon: "🔧",
    level: "entrance",
    description: "Graduate Aptitude Test in Engineering — for M.Tech admissions and PSU recruitment.",
    years: {
      2025: [{ start: "2025-02-01", end: "2025-02-16", result: "2025-03-19", status: C }],
      2026: [{ start: "2026-02-07", end: "2026-02-15", result: "2026-03-19", status: C, resultStatus: E }],
      2027: [{ start: "2027-02-06", end: "2027-02-14", result: "2027-03-19", status: E }],
    },
  },
  {
    key: "bitsat",
    name: "BITSAT",
    short: "BITSAT",
    org: "BITS Pilani",
    icon: "🧪",
    level: "entrance",
    description: "Birla Institute of Technology and Science Admission Test, Session 1.",
    years: {
      2025: [{ start: "2025-05-26", end: "2025-05-30", status: C }],
      2026: [{ start: "2026-05-26", end: "2026-05-30", status: E }],
      2027: [{ start: "2027-05-26", end: "2027-05-30", status: E }],
    },
  },
  {
    key: "gujcet",
    name: "GUJCET",
    short: "GUJCET",
    org: "GSEB (Gujarat)",
    icon: "🧪",
    level: "entrance",
    description: "Gujarat Common Entrance Test for engineering and pharmacy admissions in Gujarat.",
    years: {
      2025: [{ start: "2025-03-23", status: C }],
      2026: [{ start: "2026-03-22", status: E }],
      2027: [{ start: "2027-03-21", status: E }],
    },
  },
  {
    key: "mhtcet",
    name: "MHT CET",
    short: "MHT CET",
    org: "MH State CET Cell",
    icon: "🧪",
    level: "entrance",
    description: "Maharashtra Common Entrance Test for engineering, pharmacy and agriculture.",
    years: {
      2025: [{ start: "2025-04-09", end: "2025-04-27", status: C }],
      2026: [{ start: "2026-04-09", end: "2026-04-27", status: E }],
      2027: [{ start: "2027-04-09", end: "2027-04-27", status: E }],
    },
  },
  {
    key: "kcet",
    name: "KCET",
    short: "KCET",
    org: "KEA (Karnataka)",
    icon: "🧪",
    level: "entrance",
    description: "Karnataka Common Entrance Test.",
    years: {
      2025: [{ start: "2025-04-16", end: "2025-04-17", status: C }],
      2026: [{ start: "2026-04-16", end: "2026-04-17", status: E }],
      2027: [{ start: "2027-04-16", end: "2027-04-17", status: E }],
    },
  },
  {
    key: "uceed",
    name: "UCEED & CEED",
    short: "UCEED/CEED",
    org: "IIT Bombay",
    icon: "🎨",
    level: "entrance",
    description: "Undergraduate and Common Entrance Examination for Design.",
    years: {
      2025: [{ start: "2025-01-19", status: C }],
      2026: [{ start: "2026-01-18", status: C }],
      2027: [{ start: "2027-01-17", status: E }],
    },
  },

  /* ---------------- Management, law & others ---------------- */
  {
    key: "cat",
    name: "CAT",
    short: "CAT",
    org: "IIM",
    icon: "📊",
    level: "entrance",
    description: "Common Admission Test for the Indian Institutes of Management.",
    years: {
      2025: [{ start: "2025-11-30", result: "2025-12-19", status: C }],
      2026: [{ start: "2026-11-29", result: "2026-12-19", status: E }],
      2027: [{ start: "2027-11-28", result: "2027-12-19", status: E }],
    },
  },
  {
    key: "xat",
    name: "XAT",
    short: "XAT",
    org: "XLRI",
    icon: "📊",
    level: "entrance",
    description: "Xavier Aptitude Test for management admissions.",
    years: {
      2025: [{ start: "2025-01-05", status: C }],
      2026: [{ start: "2026-01-04", status: C }],
      2027: [{ start: "2027-01-03", status: E }],
    },
  },
  {
    key: "clat",
    name: "CLAT",
    short: "CLAT",
    org: "Consortium of NLUs",
    icon: "⚖️",
    level: "entrance",
    description: "Common Law Admission Test for the National Law Universities (held in December for the next academic year).",
    years: {
      2025: [{ start: "2025-12-07", status: C }],
      2026: [{ start: "2026-12-06", status: E }],
      2027: [{ start: "2027-12-05", status: E }],
    },
  },
  {
    key: "nift",
    name: "NIFT Entrance Exam",
    short: "NIFT",
    org: "NIFT / NTA",
    icon: "🧵",
    level: "entrance",
    description: "National Institute of Fashion Technology entrance examination.",
    years: {
      2025: [{ start: "2025-02-09", status: C }],
      2026: [{ start: "2026-02-08", status: E }],
      2027: [{ start: "2027-02-07", status: E }],
    },
  },

  /* ---------------- Competitive / government ---------------- */
  {
    key: "upscpre",
    name: "UPSC Civil Services Prelims",
    short: "UPSC Prelims",
    org: "UPSC",
    icon: "🏛️",
    level: "competitive",
    description: "Preliminary examination for the Civil Services (IAS, IPS, IFS) and Indian Forest Service.",
    years: {
      2025: [{ start: "2025-05-25", result: "2025-06-11", status: C }],
      2026: [{ start: "2026-05-24", result: "2026-06-11", status: C, resultStatus: E }],
      2027: [{ start: "2027-05-30", result: "2027-06-11", status: E }],
    },
  },
  {
    key: "upscmains",
    name: "UPSC Civil Services Mains",
    short: "UPSC Mains",
    org: "UPSC",
    icon: "🏛️",
    level: "competitive",
    description: "Main written examination for the Civil Services.",
    years: {
      2025: [{ start: "2025-08-22", end: "2025-08-31", status: C }],
      2026: [{ start: "2026-08-21", end: "2026-08-30", status: C }],
      2027: [{ start: "2027-08-20", end: "2027-08-29", status: E }],
    },
  },
  {
    key: "nda1",
    name: "NDA & NA (I) and CDS (I)",
    short: "NDA I / CDS I",
    org: "UPSC",
    icon: "🎖️",
    level: "competitive",
    description: "National Defence Academy, Naval Academy and Combined Defence Services exams — first cycle.",
    years: {
      2025: [{ start: "2025-04-13", status: C }],
      2026: [{ start: "2026-04-12", status: C }],
      2027: [{ start: "2027-04-18", status: E }],
    },
  },
  {
    key: "nda2",
    name: "NDA & NA (II) and CDS (II)",
    short: "NDA II / CDS II",
    org: "UPSC",
    icon: "🎖️",
    level: "competitive",
    description: "National Defence Academy, Naval Academy and Combined Defence Services exams — second cycle.",
    years: {
      2025: [{ start: "2025-09-14", status: C }],
      2026: [{ start: "2026-09-13", status: C }],
      2027: [{ start: "2027-09-12", status: E }],
    },
  },
  {
    key: "ugcnetjun",
    name: "UGC NET (June cycle)",
    short: "UGC NET",
    org: "NTA",
    icon: "🎓",
    level: "competitive",
    description: "National Eligibility Test for Assistant Professor and JRF — June cycle.",
    years: {
      2025: [{ start: "2025-06-25", end: "2025-06-29", status: C }],
      2026: [{ start: "2026-06-25", end: "2026-06-29", status: E }],
      2027: [{ start: "2027-06-25", end: "2027-06-29", status: E }],
    },
  },
  {
    key: "neetpg",
    name: "NEET PG",
    short: "NEET PG",
    org: "NBEMS",
    icon: "🩺",
    level: "entrance",
    description: "National Eligibility cum Entrance Test for postgraduate medical admissions.",
    years: {
      2025: [{ start: "2025-08-03", status: C }],
      2026: [{ start: "2026-06-14", status: E }],
      2027: [{ start: "2027-06-13", status: E }],
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Engine                                                                    */
/* -------------------------------------------------------------------------- */

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_SHORT[m - 1]}`;
}

const yearCache = new Map<number, ExamEvent[]>();

export function getExamEventsForYear(year: number): ExamEvent[] {
  const cached = yearCache.get(year);
  if (cached) return cached;

  const list: ExamEvent[] = [];
  for (const def of EXAMS) {
    const schedules = def.years[year] ?? [];
    schedules.forEach((s, i) => {
      const base = {
        examKey: def.key,
        icon: def.icon,
        org: def.org,
        level: def.level,
        description: def.description,
      };
      const multiDay = !!s.end && s.end !== s.start;
      const window = multiDay ? `${shortDate(s.start)} – ${shortDate(s.end!)}` : undefined;
      const isResultOnly = s.result === s.start;

      if (!isResultOnly) {
        list.push({
          ...base,
          id: `${def.key}-${i}-start`,
          kind: "exam",
          date: s.start,
          name: multiDay ? `${def.name} begins` : def.name,
          shortName: multiDay ? `${def.short} begins` : def.short,
          status: s.status,
          window,
        });
        if (multiDay) {
          list.push({
            ...base,
            id: `${def.key}-${i}-end`,
            kind: "exam",
            date: s.end!,
            name: `${def.name} ends`,
            shortName: `${def.short} ends`,
            status: s.status,
            window,
          });
        }
      }
      if (s.result) {
        list.push({
          ...base,
          id: `${def.key}-${i}-result`,
          kind: "result",
          date: s.result,
          name: isResultOnly ? def.name : `${def.name} result`,
          shortName: `${def.short} result`,
          status: s.resultStatus ?? s.status,
        });
      }
    });
  }

  list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  yearCache.set(year, list);
  return list;
}

export function getExamEventsForMonth(year: number, month: number): ExamEvent[] {
  const prefix = `${year}-${month + 1 < 10 ? "0" : ""}${month + 1}-`;
  return getExamEventsForYear(year).filter((e) => e.date.startsWith(prefix));
}

function todayIso(today: Date): string {
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  return `${y}-${m < 10 ? "0" : ""}${m}-${d < 10 ? "0" : ""}${d}`;
}

/** The next exam (not result) on or after `today`, looking up to a year ahead. */
export function getUpcomingExam(today: Date): ExamEvent | null {
  const iso = todayIso(today);
  const y = today.getFullYear();
  for (const year of [y, y + 1]) {
    const hit = getExamEventsForYear(year).find(
      (e) => e.kind === "exam" && e.date >= iso && !e.name.endsWith(" ends"),
    );
    if (hit) return hit;
  }
  return null;
}

/** The next result declaration on or after `today`, looking up to a year ahead. */
export function getUpcomingResult(today: Date): ExamEvent | null {
  const iso = todayIso(today);
  const y = today.getFullYear();
  for (const year of [y, y + 1]) {
    const hit = getExamEventsForYear(year).find((e) => e.kind === "result" && e.date >= iso);
    if (hit) return hit;
  }
  return null;
}

/** Whole-day distance between two ISO dates (b - a). */
function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86_400_000);
}

export interface MonthComparisonRow {
  key: string;
  name: string;
  short: string;
  icon: string;
  org: string;
  /** This year's session in the viewed month */
  current: { start: string; end?: string; status: ExamStatus };
  /** The matching session from the previous year, if we have it */
  previous: { start: string; end?: string; status: ExamStatus } | null;
  /** Days later (+) or earlier (−) than last year; null without data */
  shiftDays: number | null;
}

/**
 * Every exam that starts in the given month, paired with the same session
 * from the previous year so the two can be compared side by side.
 */
export function getMonthComparison(year: number, month: number): MonthComparisonRow[] {
  const rows: MonthComparisonRow[] = [];
  const prefix = `${year}-${month + 1 < 10 ? "0" : ""}${month + 1}-`;
  for (const def of EXAMS) {
    const sessions = def.years[year] ?? [];
    sessions.forEach((s, i) => {
      if (!s.start.startsWith(prefix)) return;
      if (s.result === s.start) return; // result-only entries are not exams
      const prevSessions = def.years[year - 1] ?? [];
      const p = prevSessions[i] ?? prevSessions[0] ?? null;
      let shiftDays: number | null = null;
      if (p) {
        const [py, pm, pd] = p.start.split("-").map(Number);
        const shifted = `${py + 1}-${pm < 10 ? "0" : ""}${pm}-${pd < 10 ? "0" : ""}${pd}`;
        shiftDays = dayDiff(shifted, s.start);
      }
      rows.push({
        key: `${def.key}-${i}`,
        name: def.name,
        short: def.short,
        icon: def.icon,
        org: def.org,
        current: { start: s.start, end: s.end, status: s.status },
        previous: p ? { start: p.start, end: p.end, status: p.status } : null,
        shiftDays,
      });
    });
  }
  rows.sort((a, b) => (a.current.start < b.current.start ? -1 : 1));
  return rows;
}

export const LEVEL_LABEL: Record<ExamLevel, string> = {
  board: "Board",
  entrance: "Entrance",
  competitive: "Competitive",
};
