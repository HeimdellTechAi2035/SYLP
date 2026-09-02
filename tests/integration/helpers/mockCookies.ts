export type MockCookieStore = {
  get: (name: string) => { value: string } | undefined;
  set: (name: string, value: string) => void;
  delete: (name: string) => void;
  _map: Map<string, string>;
};

/** A minimal in-memory stand-in for Next's cookies() store, shared across a test file via vi.mock. */
export function createMockCookieStore(): MockCookieStore {
  const map = new Map<string, string>();
  return {
    get: (name) => (map.has(name) ? { value: map.get(name)! } : undefined),
    set: (name, value) => {
      map.set(name, value);
    },
    delete: (name) => {
      map.delete(name);
    },
    _map: map,
  };
}
