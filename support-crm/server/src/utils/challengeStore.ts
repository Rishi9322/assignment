// In-memory WebAuthn challenge store, keyed by a random ceremony id.
// Fine for a single-instance dev/demo deployment; a multi-instance production
// deployment should back this with Redis (or similar) so challenges survive
// across server instances/restarts within their TTL.

interface Entry {
  challenge: string;
  userId: number;
  expiresAt: number;
}

const TTL_MS = 5 * 60 * 1000;
const store = new Map<string, Entry>();

const cleanup = () => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key);
  }
};

export const challengeStore = {
  save(ceremonyId: string, userId: number, challenge: string) {
    cleanup();
    store.set(ceremonyId, { challenge, userId, expiresAt: Date.now() + TTL_MS });
  },

  consume(ceremonyId: string): Entry | undefined {
    const entry = store.get(ceremonyId);
    if (!entry) return undefined;
    store.delete(ceremonyId);
    if (entry.expiresAt < Date.now()) return undefined;
    return entry;
  },
};
