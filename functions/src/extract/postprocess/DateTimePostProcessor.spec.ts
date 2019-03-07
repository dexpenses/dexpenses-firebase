import { expect } from 'chai';
import 'mocha';
import DateTimePostProcessor from './DateTimePostProcessor';
import { DateTime } from 'luxon';

describe('Date time postprocessor', () => {
  const postprocessor = new DateTimePostProcessor();

  it('should be successfully create timestamp', () => {
    const extracted: any = {
      date: DateTime.fromFormat('22.02.2019', 'dd.MM.yyyy', {
        zone: 'Europe/Berlin',
      }),
      time: {
        hour: 11,
        minute: 12,
        second: 13,
      },
    };
    postprocessor.touch(extracted);
    expect(extracted).to.have.property('timestamp');
    expect(extracted.timestamp.toFormat('dd.MM.yyyy HH:mm:ss')).to.equal(
      '22.02.2019 11:12:13'
    );
  });
});
