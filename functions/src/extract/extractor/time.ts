import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { cleanHeaders, HeaderExtractor } from './header';
import { Receipt, Time } from '../../model/receipt';
import { statically, createMatcher, Matcher } from './util/matcher';

const matchers = {
  HH: /((?:[01][0-9]|2[0-4]))/,
  mm: /([0-5][0-9])/,
  ss: /([0-5][0-9])/,
  ':': statically(/\s?:\s?/),
  // '^': /(?:^|\s)/,
};

const formats = ['HH:mm:ss', '^HH mm:ss', 'HH:mm'];

@DependsOn(HeaderExtractor)
export class TimeExtractor extends Extractor<Time> {
  private readonly matcher: Matcher;
  constructor() {
    super('time');
    this.matcher = createMatcher(matchers, formats);
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    return this.matcher.exec(text).then((res) => {
      const [fullTime, hour, minute, second] = res.regexMatch;
      cleanHeaders(extracted, fullTime);
      return {
        hour: parseInt(hour, 10),
        minute: parseInt(minute, 10),
        second: !second ? null : parseInt(second, 10),
      };
    });
  }
}
