# Festival Calendar

A premium month-view calendar dashboard built with Next.js, TypeScript, Tailwind CSS v4 and Framer Motion.
A built-in festival engine surfaces Indian festivals
and national holidays for 2024–2030, and an exam engine tracks board, entrance and competitive
exam dates and results for 2025–2027.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Features

- Month grid with equal-sized day cards, hover elevation, and staggered reveal
- Slide + fade month transitions with a shimmering skeleton loader
- Festival days in soft emerald with a gentle pulse
- Month / year selectors, Today button, and keyboard navigation (← → / Shift + ← → / T)
- Exams (amber) and results (red) on the grid, with legend toggles to show or hide each layer
- Bullet lists of the month's festivals and exams under the grid, plus next-festival and next-exam countdowns
- Print button in the top bar; deep links (?y=2026&m=9) open a specific month; each day popup can export its events as .ics
- Swipe on touch screens to change month
- "Events" button in the top bar opens the /events page: every festival of the year, month by month, date on the left and name on the right
- Click any day to open a popup listing everything on it and add your own events; "Last date" entries turn the day purple, plain events indigo, and already-coloured days get a highlight ring (saved in the browser)
- Light and dark themes, responsive from phone to desktop, reduced-motion aware

## Structure

```
src/
  app/                     Layout, home page, /events page, global theme tokens
  components/calendar/     CalendarDashboard, CalendarHeader, NextFestival (NextUp),
                           MonthNavigator, CalendarGrid, CalendarDayCard,
                           FestivalBadge, FestivalBullets, DayPopover, EventsList, SkeletonGrid
  components/ui/           Select, ThemeToggle, icons
  hooks/                   useCalendar
  lib/                     calendar (date helpers), festivals, exams (data engines), userEvents (local storage), ics (export)
```

## Festival & exam data

Fixed-date festivals and Good Friday / Easter are computed. Lunar festivals are tabulated per year
in `src/lib/festivals.ts` under `LUNAR`; edit that table to adjust dates or add years.

Exam schedules live in `src/lib/exams.ts` under `EXAMS`. Each year's entry is tagged `confirmed`
(officially announced) or `expected` (projected from the usual pattern). Verify expected dates
with the conducting body before relying on them.
