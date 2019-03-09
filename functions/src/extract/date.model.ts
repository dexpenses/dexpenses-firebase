export const matchers = {
  dd: /(0[1-9]|[12]\d|3[01])/,
  MM: /(0[1-9]|1[0-2])/,
  yyyy: /([12]\d{3})/,
  yy: /([1-6][0-9])/,
};

export interface DateModelEntry {
  format: string;
  flags?: string;
}

export type DateModel = DateModelEntry[];

function buildRegex(entry: DateModelEntry): RegExp {
  return new RegExp(
    entry.format
      .replace(/\\/g, "\\\\") // escape backslash
      .replace(/\./g, "\\s?\\.\\s?") // escape dot and lazy match optional spaces around the dot
      .replace("dd", matchers.dd.source)
      .replace("MM", matchers.MM.source)
      .replace("yyyy", matchers.yyyy.source)
      .replace("yy", matchers.yy.source),
    entry.flags
  );
}

export interface DateExtractionDef {
  format: string;
  regex: RegExp;
}

export function loadModel(model: DateModel): DateExtractionDef[] {
  return model.map((e) => ({
    format: e.format,
    regex: buildRegex(e),
  }));
}
