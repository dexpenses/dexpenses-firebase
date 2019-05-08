import { Extractor } from './extractor';
import { Receipt } from '../../model/receipt';

const irrelevantLines = [
  /^Datum:?/i,
  /^Uhrzeit:?/i,
  /^Beleg\s?(\-?\s?Nr\.?|nummer)/i,
  /^Trace(\s*\-?\s*Nr\.?|nummer)/i,
  /kundenbele[gqa]/i,
  /K-U-N-D-E-N-B-E-L-E-[gqa]/i,
  /h(ae|ä)ndlerbeleg/i,
  /zwischensumme/i,
  /^Fax[.:]?\s/i, // TODO: just not is the first line, it could be the name of the store
  /^Terminal\-?ID/i,
  /^TA\-?Nr/i,
  /^\(?\s?[O0]rtstarif\s?\)?$/i,
];

export class HeaderExtractor extends Extractor<string[]> {
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
      if (HeaderExtractor.isIrrelevantLine(line)) {
        continue;
      }
      if (!line.trim() || this._isHeaderDelimiter(line)) {
        break;
      }
      headerLines.push(HeaderExtractor.trim(line));
    }
    return [...new Set(headerLines)];
  }

  static isIrrelevantLine(line: string): boolean {
    return line.length <= 1 || irrelevantLines.some((r) => !!line.match(r));
  }

  /**
   * Trims the header line from *, x and spaces
   *
   * @param line the line to trim
   * @example '**** Header****' -> 'Header'
   * @example '*xxx Header*xx*' -> 'Header'
   */
  static trim(line: string): string {
    return line.replace(/^[\s*x]*[\s*]/i, '').replace(/[\s*][\s*x]*$/i, '');
  }

  private _isHeaderDelimiter(line: string): boolean {
    return (
      !line.match(/[\d\w]/) ||
      !!line.match(/^\s*Artikelname\s*$/i) ||
      !!line.match(/^\s*Preis:?\s*$/i) ||
      !!line.match(/^UID\sNr/i) ||
      !!line.match(/^\s*EUR\s*$/i) ||
      !!line.match(/^\s*\d+[,.]\d\d\s*$/i)
    );
  }

  private _firstHeaderLine(lines: string[]): number {
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (
        !HeaderExtractor.isIrrelevantLine(line) &&
        !this._isHeaderDelimiter(line)
      ) {
        return i;
      }
    }
    return -1;
  }
}

export function cleanHeaders(
  extracted: Receipt,
  value: string,
  sliceAfterMatch = false
) {
  if (!extracted.header) {
    return;
  }
  if (sliceAfterMatch) {
    for (const [i, line] of extracted.header.entries()) {
      if (line.includes(value)) {
        extracted.header = [...extracted.header.slice(0, i)];
        const l = _sanitize(line, value);
        if (l) {
          extracted.header.push(l);
        }
      }
    }
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
