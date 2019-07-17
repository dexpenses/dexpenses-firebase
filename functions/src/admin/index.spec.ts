import { buildIdentifier } from '.';

describe('admin functions / test data / identifier builder', () => {
  it('should build the correct name without a classifier', () => {
    expect(
      buildIdentifier({
        category: 'not used',
        cityCode: 'wob',
        name: 'test',
        paymentMethod: 'credit',
      })
    ).toBe('wob-test-credit');
  });

  it('should build the correct name with a classifier', () => {
    expect(
      buildIdentifier({
        category: 'not used',
        cityCode: 'wob',
        name: 'test',
        classifier: 'classifier',
        paymentMethod: 'credit',
      })
    ).toBe('wob-test-classifier-credit');
  });

  it('should trim the strings', () => {
    expect(
      buildIdentifier({
        category: 'not used',
        cityCode: ' wob ',
        name: ' test ',
        paymentMethod: ' credit ',
      })
    ).toBe('wob-test-credit');
  });

  it('should lower the strings', () => {
    expect(
      buildIdentifier({
        category: 'not used',
        cityCode: 'WOB',
        name: 'TEST',
        paymentMethod: 'CREDIT',
      })
    ).toBe('wob-test-credit');
  });

  it('should replace whitespace with dashes', () => {
    expect(
      buildIdentifier({
        category: '',
        cityCode: 'wob',
        name: ' something with spaces ',
        paymentMethod: 'credit',
      })
    ).toBe('wob-something-with-spaces-credit');
  });
});
