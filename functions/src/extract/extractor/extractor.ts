import { Receipt } from '../receipt';

export type Opt<T> = T | undefined | null;

export abstract class Extractor<T> {
  constructor(public readonly field: string) {}

  public abstract extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): Opt<T> | Promise<Opt<T>>;
}
