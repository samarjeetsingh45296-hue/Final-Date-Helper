import type { Metadata } from "next";
import EventsList from "@/components/calendar/EventsList";
import { MAX_YEAR, MIN_YEAR } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "Events · Festival Calendar",
  description: "Every festival of the year, month by month.",
};

interface EventsPageProps {
  searchParams: Promise<{ y?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { y } = await searchParams;
  const parsed = Number(y);
  const fallback = new Date().getFullYear();
  const year =
    Number.isInteger(parsed) && parsed >= MIN_YEAR && parsed <= MAX_YEAR
      ? parsed
      : Math.min(MAX_YEAR, Math.max(MIN_YEAR, fallback));
  return <EventsList year={year} />;
}
