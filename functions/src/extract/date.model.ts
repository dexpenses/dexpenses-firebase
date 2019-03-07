export const matchers = {
  day: /(0[1-9]|[12]\d|3[01])/,
  month: /(0[1-9]|1[0-2])/,
  year: /([12]\d{3})/,
};

export interface DateModelEntry {
  format: string;
  flags?: string;
}

export type DateModel = DateModelEntry[];

function buildRegex(entry: DateModelEntry): RegExp {
  return new RegExp(
    entry.format
      .replace(/\\/g, '\\\\') // escape backslash
      .replace(/\./g, '\\s?\\.\\s?') // escape dot and lazy match optional spaces around the dot
      .replace('DD', matchers.day.source)
      .replace('MM', matchers.month.source)
      .replace('YYYY', matchers.year.source),
    entry.flags
  );
}

export interface DateExtractionDef {
  format: string;
  regex: RegExp;
}

export function loadModel(model: DateModel): DateExtractionDef[] {
  return model.map(e => ({
    format: e.format,
    regex: buildRegex(e),
  }));
}
