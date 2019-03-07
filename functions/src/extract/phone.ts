import { Extractor } from './extractor';
import { Receipt } from './receipt';
import { DependsOn } from './DependsOn';
import { HeaderExtractor } from './header';

const phoneRegex = /(\(?([\d \-\)\–\+\/\(]+){6,}\)?([ .-–\/]?)([\d]+))/;

@DependsOn(HeaderExtractor)
export class PhoneNumberExtractor extends Extractor {
  constructor() {
    super('phone');
  }

  extract(text: string, lines: string[], extracted: Receipt) {
    for (const [i, line] of extracted.header!.entries()) {
      const m = line.match(phoneRegex);
      if (m) {
        extracted.header!.splice(i, 1);
        return m[0];
      }
    }
    return null;
  }
}
