import "server-only";

const DEFAULT_BASE_URL = "https://open.faceit.com/data/v4/";
const DATA_CACHE_SECONDS = 240;
const REQUESTS_PER_SECOND = 10;
const WINDOW_MS = 1000;
const MAX_ATTEMPTS = 6;
const MAX_BACKOFF_MS = 8000;
const TIMEOUT_MS = 10_000;
const MATCH_LIMIT = 100;

export type FaceitErrorKind = "unauthorized" | "rate-limited" | "unreachable";

// A failed FACEIT request with the reason and the status
export class FaceitError extends Error {
  readonly kind: FaceitErrorKind;
  readonly status: number | null;

  constructor(kind: FaceitErrorKind, status: number | null, path: string) {
    super(`FACEIT API request to ${path} failed: ${status === null ? "network error" : String(status)}`);
    this.name = "FaceitError";
    this.kind = kind;
    this.status = status;
  }
}

const startedAt: number[] = [];

// Waits for the given time
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Waits until a request fits into the rate limit of FACEIT
const acquireSlot = async (): Promise<void> => {
  const now = Date.now();
  while (startedAt.length > 0 && now - (startedAt[0] ?? now) >= WINDOW_MS) startedAt.shift();
  if (startedAt.length < REQUESTS_PER_SECOND) {
    startedAt.push(now);
    return;
  }
  await sleep(WINDOW_MS - (now - (startedAt[0] ?? now)) + 5);
  return acquireSlot();
};

// Time to wait before a retry: the header of FACEIT or a backoff
const retryDelay = (response: Response | null, attempt: number): number => {
  const header = response?.headers.get("retry-after") ?? response?.headers.get("ratelimit-reset");
  const seconds = header ? Number.parseFloat(header) : Number.NaN;
  const backoff = Math.min(500 * 2 ** attempt, MAX_BACKOFF_MS) + Math.random() * 250;
  return Number.isFinite(seconds) && seconds > 0 ? Math.max(seconds * 1000, backoff) : backoff;
};

// The FACEIT API address, which tests point to the mock API
const baseUrl = (env: Partial<Record<string, string>> = process.env): string => {
  const configured = env.FACEIT_API_URL?.trim();
  if (!configured) return DEFAULT_BASE_URL;
  return configured.endsWith("/") ? configured : `${configured}/`;
};

// One cached request, or null when the network fails
const send = async (path: string, apiKey: string): Promise<Response | null> => {
  await acquireSlot();
  try {
    return await fetch(`${baseUrl()}${path}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${apiKey}` },
      cache: "force-cache",
      next: { revalidate: DATA_CACHE_SECONDS, tags: ["faceit"] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return null;
  }
};

// A request with retries; 404 is null and a rejected key throws
export const request = async (path: string, apiKey: string, attempt = 0): Promise<unknown> => {
  const response = await send(path, apiKey);
  if (response?.ok) {
    const body: unknown = await response.json();
    return body;
  }
  if (response?.status === 404) return null;
  if (response && [400, 401, 403].includes(response.status)) {
    throw new FaceitError("unauthorized", response.status, path);
  }
  const status = response?.status ?? null;
  if (attempt + 1 >= MAX_ATTEMPTS) {
    throw new FaceitError(status === 429 ? "rate-limited" : "unreachable", status, path);
  }
  await sleep(retryDelay(response, attempt));
  return request(path, apiKey, attempt + 1);
};

// The API path of a player
const playerPath = (playerId: string): string => `players/${encodeURIComponent(playerId)}`;

// The four FACEIT requests the app needs, bound to an API key
export const createFaceitClient = (apiKey: string) => ({
  player: (nickname: string) => request(`players?nickname=${encodeURIComponent(nickname)}`, apiKey),
  matches: (playerId: string) =>
    request(`${playerPath(playerId)}/games/cs2/stats?offset=0&limit=${MATCH_LIMIT}`, apiKey),
  lifetime: (playerId: string) => request(`${playerPath(playerId)}/stats/cs2`, apiKey),
  ranking: (region: string, playerId: string) =>
    request(
      `rankings/games/cs2/regions/${encodeURIComponent(region)}/players/${encodeURIComponent(playerId)}?limit=1`,
      apiKey,
    ),
});

export type FaceitClient = ReturnType<typeof createFaceitClient>;
