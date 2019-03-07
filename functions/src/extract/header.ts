import { Extractor } from './extractor';
import { Receipt } from './receipt';

const irrelevantLines = [
  /^Datum:?/i,
  /^Uhrzeit:?/i,
  /^Beleg\s?(\-?\s?Nr\.?|nummer)/i,
  /^Trace(\-?Nr\.?|nummer)/i,
  /kundenbeleg/i,
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

  _isIrrelevantLine(line: string): boolean {
    return irrelevantLines.some(r => !!line.match(r));
  }

  _isHeaderDelimiter(line: string): boolean {
    return !line.match(/[\d\w]/) || !!line.match(/^\s*Artikelname\s*$/i);
  }

  extract(text: string, lines: string[], extracted: Receipt) {
    const headerLines: string[] = [];
    // todo possibly jump to first non-empty line?
    for (let i = 0; i < this.options.maxHeaderLines && i < lines.length; i++) {
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
}

export function cleanHeaders(extracted: Receipt, value: string) {
  if (!extracted.header) {
    return;
  }
  extracted.header = extracted.header.map(line => _sanitize(line, value)).filter(line => !!line);
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
