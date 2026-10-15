"use client";

import { useTimeZone } from "@/shared/hooks/useClient";
import { useI18n } from "@/shared/i18n/useI18n";
import type { DateStyle } from "@/shared/lib/format";

interface LocalDateProps {
  timestamp: number;
  format?: DateStyle;
  className?: string;
}

// A date in the visitor's time zone
const LocalDate = ({ timestamp, format: style = "date", className }: LocalDateProps) => {
  const { format } = useI18n();
  const timeZone = useTimeZone();
  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      data-format={style}
      className={className}
      suppressHydrationWarning
    >
      {format.date(timestamp, timeZone, style)}
    </time>
  );
};

export default LocalDate;
