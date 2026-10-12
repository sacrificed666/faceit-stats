import { NextResponse, type NextRequest } from "next/server";

import { parseNicknames } from "@/features/squad/model/config";
import { decodeNickname } from "@/features/squad/model/players";
import { isLocale, LOCALE_COOKIE, negotiateLocale, type Locale } from "@/shared/i18n/locales";

const MISSING = "__missing__";

// The saved language, or the best match for the browser
const preferredLocale = (request: NextRequest): Locale => {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(saved) ? saved : negotiateLocale(request.headers.get("accept-language"));
};

// Adds the language to bare addresses and checks player nicknames
export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const [first, ...rest] = segments;

  const lowercase = first?.toLowerCase();
  if (!isLocale(first) && isLocale(lowercase)) {
    const url = request.nextUrl.clone();
    url.pathname = ["", lowercase, ...rest].join("/");
    return NextResponse.redirect(url, 308);
  }

  if (!isLocale(first)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url, 307);
    response.headers.set("Vary", "Accept-Language, Cookie");
    return response;
  }

  if (rest[0] === "players" && rest.length === 2 && rest[1] !== undefined) {
    const nickname = decodeNickname(rest[1]);
    const canonical = parseNicknames(process.env.FACEIT_PLAYERS).find(
      (entry) => entry.toLowerCase() === nickname.toLowerCase(),
    );
    if (!canonical) {
      const url = request.nextUrl.clone();
      url.pathname = `/${first}/${MISSING}`;
      return NextResponse.rewrite(url);
    }
    if (canonical !== nickname) {
      const url = request.nextUrl.clone();
      url.pathname = `/${first}/players/${encodeURIComponent(canonical)}`;
      return NextResponse.redirect(url, 308);
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    {
      source:
        "/((?!(?:_next/static|_next/image|flags|pwa|healthz|offline|\\.well-known)(?:/|$)|(?:favicon\\.ico|icon\\.svg|apple-icon|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|sw\\.js)$).*)",
    },
  ],
};
