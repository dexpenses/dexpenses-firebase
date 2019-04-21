import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { cleanHeaders, HeaderExtractor } from './header';
import { Receipt, Time } from '../receipt';
import { anyLineMatches } from './util';

@DependsOn(HeaderExtractor)
export class TimeExtractor extends Extractor<Time> {
  constructor() {
    super('time');
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    return anyLineMatches(lines, (line) => {
      return line.match(
        /((?:[01][0-9]|2[0-4]))\s?:\s?([0-5][0-9])(?:\s?:\s?([0-5][0-9]))?/
      );
    }).then(([fullTime, hour, minute, second]: any) => {
      cleanHeaders(extracted, fullTime);
      return {
        hour: parseInt(hour, 10),
        minute: parseInt(minute, 10),
        second: !second ? null : parseInt(second, 10),
      };
    });
  }
}
