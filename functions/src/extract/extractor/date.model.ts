export const matchers = {
  d: /([1-9]|[12]\d|3[01])/,
  dd: /(0[1-9]|[12]\d|3[01])/,
  M: /([1-9]|1[0-2])/,
  MM: /(0[1-9]|1[0-2])/,
  yyyy: /([12]\d{3})/,
  yy: /([1-6][0-9])/,
};
const matcherChars = [...new Set(Object.keys(matchers).map((f) => f[0]))];

export function tokenize(format: string): string[] {
  const tokens: string[] = [];
  let currentToken = '';
  for (const c of format) {
    if (
      matcherChars.indexOf(c) !== -1 &&
      (!currentToken || c === currentToken[0])
    ) {
      currentToken += c;
    } else {
      tokens.push(currentToken);
      currentToken = c;
    }
  }
  if (currentToken) {
    tokens.push(currentToken);
  }
  return tokens;
}
export const DOT_MATCHER = '\\s?[\\.,]\\s?';
export const DASH_MATCHER = '\\s?\\-\\s?';

export function escapeLoosely(token: string): string {
  return token
    .replace(/\\/g, '\\\\') // escape backslash
    .replace(/\./g, DOT_MATCHER) // escape dot and lazy match optional spaces around the dot
    .replace(/\-/g, DASH_MATCHER); // escape dash and lazy match optional spaces around the dash
}

export function replace(format: string) {
  return tokenize(format)
    .map((token) =>
      matchers[token] ? matchers[token].source : escapeLoosely(token)
    )
    .join('');
}

export interface DateModelEntry {
  format: string;
  flags?: string;
}

export type DateModel = DateModelEntry[];

function buildRegex(entry: DateModelEntry): RegExp {
  return new RegExp(replace(entry.format), entry.flags);
}

export interface DateExtractionDef {
  format: string;
  regex: RegExp;
  polishLooselyMatchedString(match: RegExpMatchArray): string;
}

export function loadModel(model: DateModel): DateExtractionDef[] {
  return model.map((e) => ({
    format: e.format,
    regex: buildRegex(e),
    polishLooselyMatchedString(match: RegExpMatchArray): string {
      let matchIndex = 0;
      return tokenize(e.format)
        .map((token) => {
          if (matchers[token]) {
            matchIndex += 1;
            return match[matchIndex];
          } else {
            return token;
          }
        })
        .join('');
    },
  }));
}
