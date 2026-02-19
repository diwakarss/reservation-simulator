import "@testing-library/jest-dom";

// Vitest can start with a partial localStorage implementation in some environments.
// Ensure Storage API methods exist so Zustand persist middleware works in tests.
if (
  typeof window !== 'undefined' &&
  (!window.localStorage ||
    typeof window.localStorage.getItem !== 'function' ||
    typeof window.localStorage.setItem !== 'function' ||
    typeof window.localStorage.removeItem !== 'function' ||
    typeof window.localStorage.clear !== 'function')
) {
  const store = new Map<string, string>();

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
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
    },
  });
}
