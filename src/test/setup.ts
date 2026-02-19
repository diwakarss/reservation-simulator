import "@testing-library/jest-dom";

// Vitest can start with a partial localStorage implementation in some environments.
// Always provide a complete localStorage mock to avoid issues.
if (typeof window !== 'undefined') {
  const store = new Map<string, string>();

  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    },
  };

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    writable: true,
    value: localStorageMock,
  });

  // Also ensure global localStorage is available
  (globalThis as typeof globalThis & { localStorage: typeof localStorageMock }).localStorage = localStorageMock;
}
