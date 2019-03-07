import { Extractor } from './extractor';
import { Receipt } from './receipt';
import { DependsOn } from './DependsOn';
import { HeaderExtractor, cleanHeaders } from './header';

@DependsOn(HeaderExtractor)
export class TimeExtractor extends Extractor {
  constructor() {
    super('time');
  }

  extract(text: string, lines: string[], extracted: Receipt) {
    return Extractor.anyLineMatches(lines, line => {
      return line.match(/((?:[01][0-9]|2[0-4]))\s?:\s?([0-5][0-9])(?:\s?:\s?([0-5][0-9]))?/);
    }).then(([fullTime, hour, minute, second]: any) => {
      cleanHeaders(extracted, fullTime);
      return {
        hour: parseInt(hour),
        minute: parseInt(minute),
        second: parseInt(second),
      };
    });
  }
}
