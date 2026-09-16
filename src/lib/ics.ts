/**
 * Minimal iCalendar (.ics) export so festivals, exams and results can be
 * added to Google Calendar, Outlook or Apple Calendar with one click.
 */

export interface IcsEvent {
  uid: string;
  /** ISO date `YYYY-MM-DD` — exported as an all-day event */
  date: string;
  title: string;
  description?: string;
}

function icsDate(iso: string): string {
  return iso.replace(/-/g, "");
}

function nextDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const next = new Date(y, m - 1, d + 1);
  const mm = next.getMonth() + 1;
  const dd = next.getDate();
  return `${next.getFullYear()}${mm < 10 ? "0" : ""}${mm}${dd < 10 ? "0" : ""}${dd}`;
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildIcs(events: IcsEvent[], calendarName: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Festival Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@festival-calendar`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(e.date)}`,
      `DTEND;VALUE=DATE:${nextDay(e.date)}`,
      `SUMMARY:${escapeText(e.title)}`,
      ...(e.description ? [`DESCRIPTION:${escapeText(e.description)}`] : []),
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Triggers a browser download of the generated .ics file. */
export function downloadIcs(events: IcsEvent[], calendarName: string, fileName: string): void {
  const blob = new Blob([buildIcs(events, calendarName)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".ics") ? fileName : `${fileName}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
