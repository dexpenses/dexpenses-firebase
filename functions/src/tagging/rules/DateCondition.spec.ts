import DateCondition from './DateCondition';
import { DateTime } from 'luxon';

describe('DateCondition', () => {
  it('should be false if absent', () => {
    const condition = new DateCondition('weekday', '==', 1);
    expect(condition.test({})).toBeFalsy();
  });

  it('should throw error if unknown date field encounters', () => {
    const condition = new DateCondition('not_existing' as any, '==', 1);
    expect(() =>
      condition.test({
        date: DateTime.fromISO('2019-04-03T00:00:00.000+01:00').toJSDate(),
      })
    ).toThrowError(/unknown date time field/);
  });

  it('should throw error if non-numeric field encounters', () => {
    const condition = new DateCondition('weekdayLong', '==', 1);
    expect(() =>
      condition.test({
        date: DateTime.fromISO('2019-04-03T00:00:00.000+01:00').toJSDate(),
      })
    ).toThrowError(/not a numeric field/);
  });

  it('should decide correctly for weekday', () => {
    const isWednesday = new DateCondition('weekday', '==', 3);

    expect(
      isWednesday.test({
        date: DateTime.fromISO('2019-04-03T00:00:00.000+01:00').toJSDate(),
      })
    ).toBeTruthy();
  });

  it('should decide correctly for month', () => {
    const beforeJuly = new DateCondition('month', '<', 7);

    expect(
      beforeJuly.test({
        date: DateTime.fromISO('2019-06-03T00:00:00.000+01:00').toJSDate(),
      })
    ).toBeTruthy();

    expect(
      beforeJuly.test({
        date: DateTime.fromISO('2019-07-03T00:00:00.000+01:00').toJSDate(),
      })
    ).toBeFalsy();
  });
});
