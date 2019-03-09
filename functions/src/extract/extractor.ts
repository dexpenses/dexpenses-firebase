import { Receipt } from "./receipt";

export class Optional<T> {

  public static none<T>(): Optional<T> {
    return new Optional();
  }
  constructor(private value?: T) {}

  public then<U>(mapper: (value: T) => U): U | null {
    if (!this.value) {
      return null;
    }
    return mapper(this.value);
  }

  public asIs(): T | null {
    if (!this.value) {
      return null;
    }
    return this.value;
  }
}

export abstract class Extractor {

  public static anyLineMatches<T>(
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
  public metadata: { [key: string]: any } = {};

  constructor(public readonly field: string) {}

  public abstract extract(text: string, lines: string[], extracted: Receipt): any;

  public addMetadata(key: string, value: any, override = true): void {
    if (
      override ||
      this.metadata[key] === null ||
      this.metadata[key] === undefined
    ) {
      this.metadata[key] = value;
    }
  }
}
