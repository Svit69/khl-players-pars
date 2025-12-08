class PlayerCache {
  #store = new Map();
  #ttlMs;
  #cleanupInterval;

  constructor(ttlSeconds = 60, cleanupIntervalSeconds = 60) {
    this.#ttlMs = ttlSeconds * 1000;
    this.#cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalSeconds * 1000);
  }

  get(key) {
    const entry = this.#store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.#store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    this.#store.set(key, { value, expiresAt: Date.now() + this.#ttlMs });
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.#store.entries()) {
      if (now > entry.expiresAt) {
        this.#store.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.#cleanupInterval);
    this.#store.clear();
  }
}

export default PlayerCache;
