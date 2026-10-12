import type { ReactNode } from "react";

import type { ApiFailure, ConfigVariable, FailedPlayer } from "@/features/squad/model/types";
import type { I18n } from "@/shared/i18n/context";
import { rich } from "@/shared/i18n/rich";
import type { MessageKey } from "@/shared/i18n/translate";
import Icon from "@/shared/ui/Icon/Icon";
import type { IconName } from "@/shared/ui/Icon/icons";

import styles from "./SquadStatus.module.scss";

export type SquadProblem =
  | { status: "unconfigured"; missing: ConfigVariable[] }
  | { status: "unavailable"; reason: ApiFailure }
  | { status: "empty"; failed: FailedPlayer[] };

const FAILURES: Record<ApiFailure, { title: MessageKey; body: MessageKey; icon: IconName }> = {
  unauthorized: { title: "status.unauthorized.title", body: "status.unauthorized.body", icon: "alert" },
  "rate-limited": { title: "status.rateLimited.title", body: "status.rateLimited.body", icon: "clock" },
  unreachable: { title: "status.unreachable.title", body: "status.unreachable.body", icon: "refresh" },
};

const HINTS: Record<ConfigVariable, MessageKey> = {
  FACEIT_API_KEY: "status.apiKey",
  FACEIT_PLAYERS: "status.players",
};

// Inline code in the setup help
const Code = ({ children }: { children: ReactNode }) => <code className={styles.code}>{children}</code>;

interface SquadStatusProps {
  problem: SquadProblem;
  i18n: I18n;
}

// Explains a missing configuration, an unavailable API or an empty squad
const SquadStatus = ({ problem, i18n: { t, format } }: SquadStatusProps) => {
  let icon: IconName = "info";
  let title: string;
  let body: ReactNode;

  if (problem.status === "unconfigured") {
    title = t("status.almostReady");
    body = (
      <>
        <p>{rich(t("status.missing"), { env: <Code>.env</Code>, example: <Code>.env.example</Code> })}</p>
        <ul className={styles.missing}>
          {problem.missing.map((variable) => (
            <li key={variable} className={styles.variable}>
              <Icon name="chevronRight" size={14} className={styles.arrow} />
              <Code>{variable}</Code>
              <span>{t(HINTS[variable])}</span>
            </li>
          ))}
        </ul>
      </>
    );
  } else if (problem.status === "unavailable") {
    const copy = FAILURES[problem.reason];
    title = t(copy.title);
    icon = copy.icon;
    body = <p>{t(copy.body)}</p>;
  } else {
    icon = "users";
    title = t("status.empty.title");
    const names = problem.failed.map((entry) => entry.nickname);
    body = (
      <p>
        {rich(t("status.empty.body"), {
          names: names.length > 0 ? format.list(names) : t("status.empty.configured"),
          variable: <Code>FACEIT_PLAYERS</Code>,
        })}
      </p>
    );
  }

  return (
    <div className={styles.status}>
      <header className={styles.header}>
        <p className={styles.kicker}>{t("app.kicker")}</p>
        <h1 className={styles.title}>{t("status.title")}</h1>
      </header>
      <div className={styles.card}>
        <span className={styles.icon}>
          <Icon name={icon} size={20} />
        </span>
        <div className={styles.body}>
          <h2 className={styles.problem}>{title}</h2>
          {body}
        </div>
      </div>
    </div>
  );
};

export default SquadStatus;
