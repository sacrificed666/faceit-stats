"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useRange, withRange } from "@/features/squad/model/useRange";
import { useI18n } from "@/shared/i18n/useI18n";
import { comparePath, homePath } from "@/shared/lib/urls";

import styles from "./HeaderNav.module.scss";

interface HeaderNavProps {
  className?: string;
}

// Squad and Compare links that keep the range
const HeaderNav = ({ className }: HeaderNavProps) => {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const range = useRange();
  const compare = comparePath(locale);
  const links = [
    { href: withRange(homePath(locale), range), label: t("nav.squad"), current: !pathname.startsWith(compare) },
    { href: withRange(compare, range), label: t("nav.compare"), current: pathname.startsWith(compare) },
  ];
  return (
    <nav aria-label={t("nav.label")} className={className}>
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.label} className={styles.item}>
            <Link href={link.href} aria-current={link.current ? "page" : undefined} className={styles.link}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default HeaderNav;
