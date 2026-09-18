import type { FestivalCategory } from "@/lib/festivals";

type Tone =
  | "festival"
  | "holiday"
  | "approx"
  | "exam"
  | "result"
  | "due"
  | "note"
  | FestivalCategory;

interface FestivalBadgeProps {
  children?: React.ReactNode;
  icon?: string;
  tone?: Tone;
  size?: "sm" | "md";
  className?: string;
  title?: string;
}

const TONE_CLASS: Record<Tone, string> = {
  festival: "bg-fest/10 text-fest-strong ring-fest/25",
  holiday: "bg-accent-soft text-accent ring-accent/20",
  approx: "bg-surface-2 text-ink-3 ring-line",
  exam: "bg-exam/10 text-exam-strong ring-exam/30",
  result: "bg-result/10 text-result-strong ring-result/30",
  due: "bg-due/10 text-due-strong ring-due/30",
  note: "bg-accent/10 text-accent ring-accent/30",
  national: "bg-tone-national-soft text-tone-national ring-tone-national/25",
  hindu: "bg-fest/10 text-fest-strong ring-fest/25",
  muslim: "bg-tone-muslim-soft text-tone-muslim ring-tone-muslim/25",
  christian: "bg-tone-christian-soft text-tone-christian ring-tone-christian/25",
  sikh: "bg-tone-sikh-soft text-tone-sikh ring-tone-sikh/25",
  jain: "bg-tone-christian-soft text-tone-christian ring-tone-christian/25",
  buddhist: "bg-tone-national-soft text-tone-national ring-tone-national/25",
  cultural: "bg-tone-cultural-soft text-tone-cultural ring-tone-cultural/25",
};

/**
 * Compact pill used on day cards and in the festival list.
 * `tone` can be a semantic role (festival/holiday/approx) or a category.
 */
export default function FestivalBadge({
  children,
  icon,
  tone = "festival",
  size = "sm",
  className = "",
  title,
}: FestivalBadgeProps) {
  const sizing =
    size === "sm"
      ? "h-5 gap-1 px-1.5 text-[11px] leading-none"
      : "h-6 gap-1.5 px-2 text-xs leading-none";

  return (
    <span
      title={title}
      className={`inline-flex max-w-full items-center rounded-md font-medium ring-1 ring-inset ${sizing} ${TONE_CLASS[tone]} ${className}`}
    >
      {icon && (
        <span aria-hidden className="shrink-0 text-[1.05em] leading-none">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </span>
  );
}
