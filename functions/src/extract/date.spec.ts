import { expect } from 'chai';
import 'mocha';
import { DateExtractor } from './date';
import { DateTime } from 'luxon';

describe('Date extractor', () => {
  const extractor = new DateExtractor();

  it('should be successfully extract the date', () => {
    const text = `22.01.201
    Datum: 22.01.2019
    `;
    const date = extractor.extract(text, text.split('\n'), {});
    expect(date).to.exist;
    if (date) {
      expect(date).to.equalDate(
        DateTime.fromISO('2019-01-22T00:00:00.000+01:00').toJSDate()
      );
    }
  });
});
