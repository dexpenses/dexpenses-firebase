import TimeCondition from './TimeCondition';

describe('TimeCondition', () => {
  it('should be false if absent', () => {
    const condition = new TimeCondition({ hour: 16, minute: 0 }, 'after');
    expect(condition.test({})).toBeFalsy();
  });

  it('should match decide correctly with after', () => {
    const condition = new TimeCondition({ hour: 16, minute: 0 }, 'after');

    expect(
      condition.test({
        time: {
          hour: 15,
          minute: 59,
          second: 59,
        },
      })
    ).toBeFalsy();

    expect(
      condition.test({
        time: {
          hour: 16,
          minute: 0,
        },
      })
    ).toBeTruthy();

    expect(
      condition.test({
        time: {
          hour: 16,
          minute: 0,
          second: 1,
        },
      })
    ).toBeTruthy();
  });

  it('should match decide correctly with before', () => {
    const condition = new TimeCondition({ hour: 16, minute: 0 }, 'before');

    expect(
      condition.test({
        time: {
          hour: 15,
          minute: 59,
          second: 59,
        },
      })
    ).toBeTruthy();

    expect(
      condition.test({
        time: {
          hour: 16,
          minute: 0,
        },
      })
    ).toBeFalsy();

    expect(
      condition.test({
        time: {
          hour: 16,
          minute: 0,
          second: 1,
        },
      })
    ).toBeFalsy();
  });
});
