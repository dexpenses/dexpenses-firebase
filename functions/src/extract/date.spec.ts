import { expect } from 'chai';
import 'mocha';
import { DateExtractor } from './date';

describe('Date extractor', () => {
  const extractor = new DateExtractor();

  it('should be successfully extract the date', () => {
    const text = `22.01.201
    Datum: 22.01.2019
    `;
    const date = extractor.extract(text, text.split('\n'), {});
    expect(date).to.exist;
    if (date) {
      expect(date.toFormat('dd.MM.yyyy')).to.equal('22.01.2019');
    }
  });
});
