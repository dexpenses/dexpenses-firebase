import { DependsOn } from './DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor } from './header';
import { Receipt } from './receipt';

const phoneRegex = /(\(?([\d \-\)\–\+\/\(]+){6,}\)?([ .-–\/]?)([\d]+))/;

@DependsOn(HeaderExtractor)
export class PhoneNumberExtractor extends Extractor {
  constructor() {
    super('phone');
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    for (const [i, line] of extracted.header!.entries()) {
      const m = line.match(phoneRegex);
      if (m) {
        extracted.header!.splice(i); // remove anything afterwards as well
        return m[0].trim();
      }
    }
    return null;
  }
}
