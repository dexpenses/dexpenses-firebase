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
