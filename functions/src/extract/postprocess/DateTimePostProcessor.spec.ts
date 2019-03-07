import { expect } from 'chai';
import 'mocha';
import DateTimePostProcessor from './DateTimePostProcessor';

describe('Date time postprocessor', () => {
  const postprocessor = new DateTimePostProcessor();

  it('should be successfully create timestamp', () => {
    const extracted: any = {
      date: new Date(2019, 1, 22),
      time: {
        hour: 11,
        minute: 12,
        second: 13,
      },
    };
    postprocessor.touch(extracted);
    expect(extracted).to.have.property('timestamp');
    expect(extracted.timestamp).to.equalDate(new Date(2019, 1, 22, 11, 12, 13));
  });
});
