import { Receipt } from './receipt';

export class Optional<T> {
  constructor(private value?: T) {}

  then<U>(mapper: (value: T) => U): U | null {
    if (!this.value) {
      return null;
    }
    return mapper(this.value);
  }

  asIs(): T | null {
    if (!this.value) {
      return null;
    }
    return this.value;
  }

  static none<T>(): Optional<T> {
    return new Optional();
  }
}

export abstract class Extractor {
  public metadata: { [key: string]: any } = {};

  constructor(public readonly field: string) {}

  abstract extract(text: string, lines: string[], extracted: Receipt): any;

  addMetadata(key: string, value: any, override = true): void {
    if (
      override ||
      this.metadata[key] === null ||
      this.metadata[key] === undefined
    ) {
      this.metadata[key] = value;
    }
  }

  static anyLineMatches<T>(
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
}
