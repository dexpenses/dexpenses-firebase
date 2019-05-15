import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor, cleanHeaders } from './header';
import { Receipt } from '../../model/receipt';

const phoneRegex = /(?:^|[.,:\s])(\(?(?=\+49|\(?0)((\([\d \-\–\+\/]+\)|[\d \-\–\+\/])+){6,}\)?([ \-–\/]?)([\doO]+))/;
const prefixRegex = /(?:Tel(?:efon)?|Fon|(?:^|\s)el)\.?:?/i;
const prefixedRegex = new RegExp(
  `${prefixRegex.source}${phoneRegex.source}`,
  'i'
);

@DependsOn(HeaderExtractor)
export class PhoneNumberExtractor extends Extractor<string> {
  constructor() {
    super('phone');
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    for (const [i, line] of extracted.header!.entries()) {
      const m = line.match(phoneRegex);
      if (m) {
        const prefix = line.substring(0, line.indexOf(m[0]));
        if (prefix.match(/St\.?Nr\.?\s*$/i) || prefix.match(/^UID\sNr\.?/i)) {
          continue;
        }
        cleanHeaders(extracted, prefixedRegex, i > 0);
        cleanHeaders(extracted, phoneRegex, i > 0);
        return m[1].trim().replace(/o/gi, '0');
      }
    }
    for (const [i, line] of lines.entries()) {
      const m = line.match(prefixedRegex);
      if (m) {
        cleanHeaders(extracted, m[0], i > 0);
        return m[1].trim().replace(/o/gi, '0');
      }
    }
    return null;
  }
}
