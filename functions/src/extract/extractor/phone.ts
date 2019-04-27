import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor } from './header';
import { Receipt } from '../receipt';

const phoneRegex = /(\(?([\d \-\)\–\+\/\(]+){6,}\)?([ .-–\/]?)([\d]+))/;
const prefixRegex = /(?:Tel(?:efon)?|Fon)\.?:?\s+/i;
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
      const m = line.match(prefixedRegex);
      if (m) {
        extracted.header!.splice(i); // remove anything afterwards as well
        return m[1].trim();
      }
    }
    for (const [i, line] of extracted.header!.entries()) {
      const m = line.match(phoneRegex);
      if (m) {
        const prefix = line.substring(0, line.indexOf(m[0]));
        if (prefix.match(/St\.?Nr\.?\s*$/i) || prefix.match(/^UID\sNr\.?/i)) {
          continue;
        }
        extracted.header!.splice(i); // remove anything afterwards as well
        return m[0].trim();
      }
    }
    return null;
  }
}
