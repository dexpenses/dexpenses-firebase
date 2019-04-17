import { Extractor } from './extractor';
import { Receipt } from './receipt';

const irrelevantLines = [
  /^Datum:?/i,
  /^Uhrzeit:?/i,
  /^Beleg\s?(\-?\s?Nr\.?|nummer)/i,
  /^Trace(\s*\-?\s*Nr\.?|nummer)/i,
  /kundenbele[gqa]/i,
  /K-U-N-D-E-N-B-E-L-E-[gqa]/i,
  /h(ae|ä)ndlerbeleg/i,
  /zwischensumme/i,
];

export class HeaderExtractor extends Extractor {
  constructor(
    protected options = {
      maxHeaderLines: 8,
    }
  ) {
    super('header');
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    const headerLines: string[] = [];
    let i = this._firstHeaderLine(lines);
    if (i === -1) {
      return [];
    }
    for (i; i < this.options.maxHeaderLines && i < lines.length; i++) {
      const line = lines[i];
      if (this._isIrrelevantLine(line)) {
        continue;
      }
      if (!line.trim() || this._isHeaderDelimiter(line)) {
        return headerLines;
      }
      headerLines.push(line);
    }
    return headerLines;
  }

  private _isIrrelevantLine(line: string): boolean {
    return irrelevantLines.some((r) => !!line.match(r));
  }

  private _isHeaderDelimiter(line: string): boolean {
    return !line.match(/[\d\w]/) || !!line.match(/^\s*Artikelname\s*$/i);
  }

  private _firstHeaderLine(lines: string[]): number {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (!this._isIrrelevantLine(line) && !this._isHeaderDelimiter(line)) {
        return i;
      }
    }
    return -1;
  }
}

export function cleanHeaders(extracted: Receipt, value: string) {
  if (!extracted.header) {
    return;
  }
  extracted.header = extracted.header
    .map((line) => _sanitize(line, value))
    .filter((line) => !!line);
}

function _sanitize(line: string, value?: string): string {
  if (!value) {
    return line;
  }
  const i = line.indexOf(value);
  if (i === -1) {
    return line;
  }
  return `${line.substring(0, i)}${line.substring(i + value.length)}`
    .trim()
    .replace(/^[,.]/, '')
    .replace(/[,.]$/, '');
}
