"use client";

import { useNow, useTimeZone } from "@/shared/hooks/useClient";
import { useI18n } from "@/shared/i18n/useI18n";

interface RelativeTimeProps {
  timestamp: number;
  className?: string;
}

// How long ago something happened, with the exact time on hover
const RelativeTime = ({ timestamp, className }: RelativeTimeProps) => {
  const { format } = useI18n();
  const now = useNow();
  const timeZone = useTimeZone();
  const absolute = format.date(timestamp, timeZone, "datetime");
  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      data-format="relative"
      title={absolute}
      className={className}
      suppressHydrationWarning
    >
      {now === null ? absolute : format.relative(timestamp, now)}
    </time>
  );
};

export default RelativeTime;
