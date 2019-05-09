export function anyMatches(s: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => !!s.match(p));
}

export function getAllMatches(regex: RegExp, s: string) {
  let m: RegExpExecArray | null;
  const matches: RegExpExecArray[] = [];
  while ((m = regex.exec(s)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    matches.push(m);
  }
  return matches;
}

export function regexTrim(s: string, r: RegExp): string {
  return s
    .replace(new RegExp(`^${r.source}`, r.flags), '')
    .replace(new RegExp(`${r.source}$`, r.flags), '');
}
