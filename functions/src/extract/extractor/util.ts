import { Optional } from '../Optional';

export function anyLineMatches<T>(
  lines: string[],
  predicate: (line: string) => T
): Optional<T> {
  for (const line of lines) {
    const value = predicate(line);
    if (value) {
      return new Optional(value);
    }
  }
  return Optional.none();
}
