import { DependsOn } from './DependsOn';
import { Extractor } from './extractor';
import { cleanHeaders, HeaderExtractor } from './header';
import { Receipt } from './receipt';

@DependsOn(HeaderExtractor)
export class TimeExtractor extends Extractor {
  constructor() {
    super('time');
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    return Extractor.anyLineMatches(lines, (line) => {
      return line.match(
        /((?:[01][0-9]|2[0-4]))\s?:\s?([0-5][0-9])(?:\s?:\s?([0-5][0-9]))?/
      );
    }).then(([fullTime, hour, minute, second]: any) => {
      cleanHeaders(extracted, fullTime);
      return {
        hour: parseInt(hour, 10),
        minute: parseInt(minute, 10),
        second: parseInt(second, 10),
      };
    });
  }
}
