import { buildIdentifier } from '.';

describe('admin functions / test data / identifier builder', () => {
  it('should build the correct name without a classifier', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'wob',
        name: 'test',
        paymentMethod: 'credit',
      })
    ).toBe('ec/wob-test-credit');
  });

  it('should build the correct name with a classifier', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'wob',
        name: 'test',
        classifier: 'classifier',
        paymentMethod: 'credit',
      })
    ).toBe('ec/wob-test-classifier-credit');
  });

  it('should trim the strings', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: ' wob ',
        name: ' test ',
        paymentMethod: ' credit ',
      })
    ).toBe('ec/wob-test-credit');
  });

  it('should lower the strings', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'WOB',
        name: 'TEST',
        paymentMethod: 'CREDIT',
      })
    ).toBe('ec/wob-test-credit');
  });

  it('should replace whitespace with dashes', () => {
    expect(
      buildIdentifier({
        category: 'ec',
        cityCode: 'wob',
        name: ' something with spaces ',
        paymentMethod: 'credit',
      })
    ).toBe('ec/wob-something-with-spaces-credit');
  });
});
