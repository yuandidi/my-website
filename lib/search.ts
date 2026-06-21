/** Escape `%`, `_`, and `\` for PostgreSQL ILIKE ... ESCAPE '\\' */
export function escapeLikePattern(input: string): string {
  return input.replace(/[\\%_]/g, (match) => `\\${match}`);
}
