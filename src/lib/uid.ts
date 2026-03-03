/** Generates a short random alphanumeric ID. */
export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}
