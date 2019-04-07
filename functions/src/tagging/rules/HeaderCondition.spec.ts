import HeaderCondition from './HeaderCondition';

describe('HeaderCondition', () => {
  it('should be false if absent', () => {
    const condition = new HeaderCondition('header');
    expect(condition.test({})).toBeFalsy();
  });

  it('should match case-insensitively by default', () => {
    const condition = new HeaderCondition('walmart');
    expect(
      condition.test({
        header: ['Walmart'],
      })
    ).toBeTruthy();

    expect(
      condition.test({
        header: ['prefix', 'Walmart'],
      })
    ).toBeTruthy();

    expect(
      condition.test({
        header: ['Walmart', 'suffix'],
      })
    ).toBeTruthy();

    expect(
      condition.test({
        header: ['prefix', 'Walmart', 'suffix'],
      })
    ).toBeTruthy();
  });

  it('should match case-sensitive if specified', () => {
    const condition = new HeaderCondition('walmart', true);
    expect(
      condition.test({
        header: ['Walmart'],
      })
    ).toBeFalsy();
  });
});
