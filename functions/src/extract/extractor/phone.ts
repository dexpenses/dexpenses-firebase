import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor, cleanHeaders } from './header';
import { Receipt } from '../../model/receipt';

const phoneRegex = /(?:^|[.,:\s])(\(?(?=\+49|\(?0)((\([\d \-\–\+\/]+\)|[\d \-\–\+\/])+){6,}\)?([ \-–\/]?)([\d]+))/;
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
    for (const line of extracted.header!) {
      const m = line.match(phoneRegex);
      if (m) {
        const prefix = line.substring(0, line.indexOf(m[0]));
        if (prefix.match(/St\.?Nr\.?\s*$/i) || prefix.match(/^UID\sNr\.?/i)) {
          continue;
        }
        cleanHeaders(extracted, prefixedRegex, true);
        cleanHeaders(extracted, phoneRegex, true);
        return m[1].trim();
      }
    }
    for (const line of lines) {
      const m = line.match(prefixedRegex);
      if (m) {
        cleanHeaders(extracted, m[0], true);
        return m[1].trim();
      }
    }
    return null;
  }
}
