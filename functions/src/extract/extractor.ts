import { Receipt } from './receipt';
import { Optional } from './Optional';

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

  public abstract extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): any;

  public addMetadata(
    key: string,
    value: any,
    override = true,
    overrideIf = (prev: any) => true
  ): void {
    if (
      override ||
      this.metadata[key] === null ||
      this.metadata[key] === undefined ||
      overrideIf(this.metadata[key])
    ) {
      this.metadata[key] = value;
    }
  }
}
