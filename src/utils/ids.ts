export function newId(prefix: string) {
  // Non-crypto ID is fine for local-only records.
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

