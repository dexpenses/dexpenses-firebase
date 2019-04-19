import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor } from './header';
import { Receipt } from '../receipt';

const phoneRegex = /(\(?([\d \-\)\–\+\/\(]+){6,}\)?([ .-–\/]?)([\d]+))/;

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
        if (prefix.match(/St\.?Nr\.?\s*$/i)) {
          continue;
        }
        extracted.header!.splice(i); // remove anything afterwards as well
        return m[0].trim();
      }
    }
    return null;
  }
}
