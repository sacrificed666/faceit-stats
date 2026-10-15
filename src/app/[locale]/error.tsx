"use client";

import { useI18n } from "@/shared/i18n/useI18n";
import { homePath } from "@/shared/lib/urls";
import ErrorScreen from "@/widgets/ErrorScreen/ErrorScreen";

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

// Shown when a page fails to render, with a way to try again
const ErrorPage = ({ error, retry }: ErrorPageProps) => {
  const { locale, t } = useI18n();
  return <ErrorScreen t={t} home={homePath(locale)} digest={error.digest} onRetry={retry} />;
};

export default ErrorPage;
